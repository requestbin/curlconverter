/**
 * Python Code Generators
 * Based on curlconverter generators
 */

import type { Request } from '../curlconverter';

export function generatePythonRequests(request: Request): string {
  const url = request.urls[0]?.url || '';
  const method = request.method.toLowerCase();
  const headers = request.headers;

  let code = `import requests\n\n`;

  // Build parameters
  const params: string[] = [`'${url}'`];
  const kwargs: string[] = [];

  // Add headers
  if (Object.keys(headers).length > 0) {
    const headerEntries = Object.entries(headers)
      .map(([key, value]) => `    '${key}': '${value}'`)
      .join(',\n');
    code += `headers = {\n${headerEntries}\n}\n\n`;
    kwargs.push('headers=headers');
  }

  // Determine data handling priority (based on curlconverter approach)
  // 1. Multipart uploads (highest priority - for -F/--form)
  if (request.multipartUploads && request.multipartUploads.length > 0) {
    code += `# Multipart form data\n`;
    code += `files = {\n`;
    request.multipartUploads.forEach((field) => {
      if (field.isFile) {
        code += `    '${field.name}': open('${field.content}', 'rb'),  # File upload\n`;
      } else {
        code += `    '${field.name}': '${field.content}',\n`;
      }
    });
    code += `}\n\n`;
    kwargs.push('files=files');
  }
  // 2. JSON data (for --json flag)
  else if (request.json) {
    code += `json_data = ${JSON.stringify(request.json, null, 4).replace(/"/g, '\'')}\n\n`;
    kwargs.push('json=json_data');
  }
  // 3. Enhanced data handling using dataArray (like curlconverter)
  else if (request.dataArray && request.dataArray.length > 0) {
    code += generateDataFromDataArray(request.dataArray, request.isDataBinary || false);
    kwargs.push('data=data');
  }
  // 4. Fallback to legacy data handling
  else if (request.data && request.data.length > 0) {
    const hasFiles = request.data.some(d => d.isFile);

    if (hasFiles) {
      // Handle file uploads with --data @filename
      code += `# File data uploads\n`;
      code += `data = b''\n`;
      request.data.forEach((d, index) => {
        if (d.isFile) {
          const mode = d.binary ? ', "rb"' : '';
          code += `# Read file: ${d.content}\n`;
          code += `with open('${d.content}'${mode}) as f:\n`;
          code += `    data += f.read()${d.binary ? '' : '.encode()'}\n`;
        } else {
          code += `data += ${JSON.stringify(d.content)}${d.binary ? '.encode()' : ''}\n`;
        }
      });
      code += `\n`;
    } else {
      // Regular form data
      const formData = request.data.map(d => `${d.name || 'data'}=${d.content}`).join('&');
      code += `data = '${formData}'\n\n`;
    }
  }

  // Add auth
  if (request.auth) {
    kwargs.push(`auth=('${request.auth.username}', '${request.auth.password}')`);
  }

  // Build request call
  const allParams = [...params, ...kwargs].join(', ');
  code += `response = requests.${method}(${allParams})\n`;
  code += `print(response.text)`;

  return code;
}

// Generate data handling code from dataArray (based on curlconverter approach)
function generateDataFromDataArray(dataArray: any[], isBinary: boolean): string {
  let code = '';
  let hasFiles = false;

  // Check if we have file uploads
  for (const d of dataArray) {
    if (typeof d === 'object' && d.filetype) {
      hasFiles = true;
      break;
    }
  }

  if (hasFiles) {
    code += `# Data with file uploads\n`;
    code += `data = b'' if ${isBinary} else ''\n`;

    dataArray.forEach((d, index) => {
      if (typeof d === 'string') {
        // Plain string data
        code += `data += ${JSON.stringify(d)}\n`;
      } else if (d.filetype) {
        // File data
        const { filetype, filename, name } = d;

        if (filename === '-') {
          // stdin
          code += `# Reading from stdin\n`;
          code += `import sys\n`;
          code += `data += sys.stdin.read()\n`;
        } else {
          // File
          const mode = filetype === 'binary' ? ', "rb"' : '';
          code += `# Reading file: ${filename}\n`;
          code += `with open('${filename}'${mode}) as f:\n`;

          let readOperation = 'f.read()';

          if (filetype === 'urlencode') {
            code += `    from urllib.parse import quote_plus\n`;
            if (name) {
              readOperation = `'${name}=' + quote_plus(f.read())`;
            } else {
              readOperation = `quote_plus(f.read())`;
            }
          } else if (filetype === 'data' && !isBinary) {
            // Remove newlines for --data
            readOperation = `f.read().replace('\\n', '').replace('\\r', '')`;
          }

          if (filetype === 'binary' || isBinary) {
            code += `    data += ${readOperation}\n`;
          } else {
            code += `    data += ${readOperation}${filetype !== 'urlencode' ? '.encode()' : ''}\n`;
          }
        }
      }
    });
    code += `\n`;
  } else {
    // No files, simple string concatenation
    const dataStrings = dataArray.map(d =>
      typeof d === 'string' ? JSON.stringify(d) : `'${d.content || ''}'`,
    );
    code += `data = ${dataStrings.join(' + ')}\n\n`;
  }

  return code;
}

export function generatePythonHttpClient(request: Request): string {
  const url = request.urls[0]?.url || '';
  const method = request.method.toUpperCase();
  const headers = request.headers;
  const body = getRequestBody(request);

  let code = `import http.client\nimport json\nfrom urllib.parse import urlparse\n\n`;

  code += `url = urlparse('${url}')\n`;
  code += `conn = http.client.HTTPSConnection(url.netloc) if url.scheme == 'https' else http.client.HTTPConnection(url.netloc)\n\n`;

  // Add headers
  if (Object.keys(headers).length > 0) {
    const headerEntries = Object.entries(headers)
      .map(([key, value]) => `    '${key}': '${value}'`)
      .join(',\n');
    code += `headers = {\n${headerEntries}\n}\n\n`;
  }

  // Add payload
  if (body) {
    if (request.json) {
      code += `payload = json.dumps(${JSON.stringify(request.json, null, 4).replace(/"/g, '\'').replace(/'/g, '"')})\n\n`;
    } else {
      code += `payload = ${JSON.stringify(body)}\n\n`;
    }
  }

  // Build request call
  code += `conn.request('${method}', url.path`;
  if (body) {
    code += `, payload`;
  }
  if (Object.keys(headers).length > 0) {
    code += `, headers`;
  }
  code += `)\n\n`;

  code += `response = conn.getresponse()\n`;
  code += `data = response.read()\n`;
  code += `print(data.decode('utf-8'))`;

  return code;
}

function getRequestBody(request: Request): string | undefined {
  if (request.json) {
    return typeof request.json === 'string' ? request.json : JSON.stringify(request.json);
  }

  if (request.data && request.data.length > 0) {
    return request.data.map((d: any) => d.content).join('&');
  }

  return undefined;
}
