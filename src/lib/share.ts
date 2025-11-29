export function encodeState(obj: unknown): string {
  const json = JSON.stringify(obj);
  if (typeof window === 'undefined') {
    return Buffer.from(json).toString('base64url');
  }
  // browser-safe base64
  return btoa(unescape(encodeURIComponent(json)));
}

export function decodeState<T = any>(raw: string): T | null {
  try {
    const cleaned = raw.replace(/^#?state=/, '');
    let json: string;
    if (typeof window === 'undefined') {
      json = Buffer.from(cleaned, 'base64url').toString();
    } else {
      json = decodeURIComponent(escape(atob(cleaned)));
    }
    return JSON.parse(json);
  } catch {
    return null;
  }
}
