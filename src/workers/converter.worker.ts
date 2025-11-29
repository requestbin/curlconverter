export interface ConvertRequest { curl: string; to: 'python' | 'javascript'; }
export interface ConvertResponse { ok: boolean; code?: string; error?: string; }

self.onmessage = (e: MessageEvent<ConvertRequest>) => {
  try {
    const { curl, to } = e.data;
    const parsed = parseCurl(curl);
    let code = '';
    if (to === 'python') code = toPython(parsed);
    if (to === 'javascript') code = toJavaScript(parsed);
    const res: ConvertResponse = { ok: true, code };
    // @ts-ignore
    self.postMessage(res);
  } catch (err: any) {
    // @ts-ignore
    self.postMessage({ ok: false, error: err?.message ?? String(err) } as ConvertResponse);
  }
};

function parseCurl(input: string) {
  const tokens = tokenize(input);
  let method = 'GET';
  let url = '';
  const headers: Record<string, string> = {};
  let data = '';

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === 'curl') continue;
    if (t === '-X' || t === '--request') {
      method = tokens[++i] || method;
      continue;
    }
    if (t === '-H' || t === '--header') {
      const h = tokens[++i] || '';
      const idx = h.indexOf(':');
      if (idx > 0) {
        const key = h.slice(0, idx).trim();
        const value = h.slice(idx + 1).trim();
        headers[key] = value;
      }
      continue;
    }
    if (t === '--data' || t === '--data-raw' || t === '-d' || t === '--data-binary') {
      data = tokens[++i] || '';
      if (method === 'GET') method = 'POST';
      continue;
    }
    if (!t.startsWith('-') && !url) {
      url = t;
      continue;
    }
  }
  return { method, url, headers, data };
}

function tokenize(s: string): string[] {
  const out: string[] = [];
  let cur = '';
  let quote: '"' | "'" | null = null;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (quote) {
      if (ch === quote) {
        out.push(cur);
        cur = '';
        quote = null;
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"' || ch === "'") {
        quote = ch as any;
      } else if (/\s/.test(ch)) {
        if (cur) {
          out.push(cur);
          cur = '';
        }
      } else {
        cur += ch;
      }
    }
  }
  if (cur) out.push(cur);
  return out;
}

function toPython(p: { method: string; url: string; headers: Record<string,string>; data: string; }): string {
  const hasData = !!p.data;
  const headers = JSON.stringify(p.headers, null, 2);
  const bodyLine = hasData ? `data = ${isJson(p.data) ? p.data : JSON.stringify(p.data)}\n` : '';
  return `import requests\n\nurl = "${p.url}"\nheaders = ${headers}\n${bodyLine}response = requests.${p.method.toLowerCase()}(url, headers=headers${hasData ? ', data=data' : ''})\nprint(response.status_code)\nprint(response.text)`;
}

function toJavaScript(p: { method: string; url: string; headers: Record<string,string>; data: string; }): string {
  const hasData = !!p.data;
  const headers = JSON.stringify(p.headers, null, 2);
  const bodyLine = hasData ? `\n  body: ${isJson(p.data) ? p.data : JSON.stringify(p.data)},` : '';
  return `const url = '${p.url}';\nconst options = {\n  method: '${p.method}',\n  headers: ${headers},${bodyLine}\n};\n\nfetch(url, options)\n  .then(r => r.text())\n  .then(console.log)\n  .catch(console.error);`;
}

function isJson(s: string): boolean {
  try { JSON.parse(s); return true; } catch { return false; }
}
