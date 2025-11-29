/**
 * Node.js Code Generators
 * Server-side JavaScript using Node.js APIs and libraries
 * Based on curlconverter generators
 */

import type { Request } from '../curlconverter';

export function generateNodeJsHttp(request: Request): string {
  const url = request.urls[0]?.url || '';
  const method = request.method.toLowerCase();
  const headers = request.headers;
  const body = getRequestBody(request);

  let code = `const http = require('http');\nconst https = require('https');\nconst url = require('url');\n\n`;

  code += `const options = {\n`;
  code += `    method: '${method.toUpperCase()}',\n`;
  code += `    hostname: '${getHostname(url)}',\n`;
  code += `    port: ${getPort(url)},\n`;
  code += `    path: '${getPath(url)}',\n`;

  // Add headers
  if (Object.keys(headers).length > 0) {
    code += `    headers: {\n`;
    const headerEntries = Object.entries(headers)
      .map(([key, value]) => `        '${key}': '${value}'`)
      .join(',\n');
    code += `${headerEntries}\n`;
    code += `    }\n`;
  }

  code += `};\n\n`;

  // Determine protocol
  const isHttps = url.startsWith('https://');
  const protocol = isHttps ? 'https' : 'http';

  code += `const req = ${protocol}.request(options, (res) => {\n`;
  code += `    let data = '';\n`;
  code += `    res.on('data', (chunk) => {\n`;
  code += `        data += chunk;\n`;
  code += `    });\n`;
  code += `    res.on('end', () => {\n`;
  code += `        console.log(data);\n`;
  code += `    });\n`;
  code += `});\n\n`;

  // Add error handling
  code += `req.on('error', (error) => {\n`;
  code += `    console.error(error);\n`;
  code += `});\n\n`;

  // Add body if present
  if (body) {
    if (request.json) {
      code += `const requestData = JSON.stringify(${JSON.stringify(request.json, null, 4)});\n`;
      code += `req.write(requestData);\n`;
    } else {
      code += `req.write('${body.replace(/'/g, '\\\'').replace(/\n/g, '\\n')}');\n`;
    }
  }

  code += `req.end();\n`;

  return code;
}

export function generateNodeJsAxios(request: Request): string {
  const url = request.urls[0]?.url || '';
  const method = request.method.toLowerCase();
  const headers = request.headers;
  const body = getRequestBody(request);

  let code = `// Install: npm install axios\nconst axios = require('axios');\n\n`;

  // Handle multipart form data
  if (request.multipartUploads && request.multipartUploads.length > 0) {
    code += `const FormData = require('form-data');\nconst fs = require('fs');\n\n`;
    code += `const form = new FormData();\n`;

    request.multipartUploads.forEach((field) => {
      if (field.isFile) {
        code += `form.append('${field.name}', fs.createReadStream('${field.content}'));\n`;
      } else {
        code += `form.append('${field.name}', '${field.content}');\n`;
      }
    });

    code += `\n`;
  }

  // Build config object
  const config: string[] = [`    url: '${url}'`, `    method: '${method}'`];

  // Add headers
  if (Object.keys(headers).length > 0 || (request.multipartUploads && request.multipartUploads.length > 0)) {
    const headerEntries = Object.entries(headers)
      .map(([key, value]) => `        '${key}': '${value}'`)
      .join(',\n');

    if (request.multipartUploads && request.multipartUploads.length > 0) {
      config.push(`    headers: {\n${headerEntries ? `${headerEntries},\n` : ''}        ...form.getHeaders()\n    }`);
    } else {
      config.push(`    headers: {\n${headerEntries}\n    }`);
    }
  }

  // Add data
  if (request.multipartUploads && request.multipartUploads.length > 0) {
    config.push(`    data: form`);
  } else if (body) {
    if (request.json) {
      config.push(`    data: ${JSON.stringify(request.json, null, 4)}`);
    } else {
      config.push(`    data: '${body.replace(/'/g, '\\\'').replace(/\n/g, '\\n')}'`);
    }
  }

  // Add auth
  if (request.auth) {
    config.push(`    auth: {\n        username: '${request.auth.username}',\n        password: '${request.auth.password}'\n    }`);
  }

  code += `const config = {\n${config.join(',\n')}\n};\n\n`;

  code += `axios(config)\n`;
  code += `    .then(response => {\n`;
  code += `        console.log(response.data);\n`;
  code += `    })\n`;
  code += `    .catch(error => {\n`;
  code += `        console.error('Error:', error.response?.data || error.message);\n`;
  code += `    });\n`;

  return code;
}

export function generateNodeJsGot(request: Request): string {
  const url = request.urls[0]?.url || '';
  const method = request.method.toLowerCase();
  const headers = request.headers;

  let code = `// Install: npm install got\nconst got = require('got');\n\n`;

  // Build options object
  const options: string[] = [`    method: '${method}'`];

  // Add headers
  if (Object.keys(headers).length > 0) {
    const headerEntries = Object.entries(headers)
      .map(([key, value]) => `        '${key}': '${value}'`)
      .join(',\n');
    options.push(`    headers: {\n${headerEntries}\n    }`);
  }

  // Handle body data
  if (request.multipartUploads && request.multipartUploads.length > 0) {
    code += `const FormData = require('form-data');\nconst fs = require('fs');\n\n`;
    code += `const form = new FormData();\n`;

    request.multipartUploads.forEach((field) => {
      if (field.isFile) {
        code += `form.append('${field.name}', fs.createReadStream('${field.content}'));\n`;
      } else {
        code += `form.append('${field.name}', '${field.content}');\n`;
      }
    });

    options.push(`    body: form`);
    code += `\n`;
  } else if (request.json) {
    options.push(`    json: ${JSON.stringify(request.json, null, 4)}`);
  } else if (request.data && request.data.length > 0) {
    const dataStr = request.data.map(d => (typeof d === 'object' && 'content' in d ? d.content : String(d)) || '').join('&');
    options.push(`    body: '${dataStr.replace(/'/g, '\\\'').replace(/\n/g, '\\n')}'`);
  }

  // Add auth
  if (request.auth) {
    options.push(`    username: '${request.auth.username}'`);
    options.push(`    password: '${request.auth.password}'`);
  }

  if (options.length > 1) {
    code += `const options = {\n${options.join(',\n')}\n};\n\n`;
    code += `got('${url}', options)\n`;
  } else {
    code += `got.${method}('${url}')\n`;
  }

  code += `    .then(response => {\n`;
  code += `        console.log(response.body);\n`;
  code += `    })\n`;
  code += `    .catch(error => {\n`;
  code += `        console.error('Error:', error.response?.body || error.message);\n`;
  code += `    });\n`;

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

function getHostname(urlString: string): string {
  try {
    const parsed = new URL(urlString);
    return parsed.hostname;
  } catch {
    return 'localhost';
  }
}

function getPort(urlString: string): number {
  try {
    const parsed = new URL(urlString);
    if (parsed.port) {
      return Number.parseInt(parsed.port, 10);
    }
    return parsed.protocol === 'https:' ? 443 : 80;
  } catch {
    return 80;
  }
}

function getPath(urlString: string): string {
  try {
    const parsed = new URL(urlString);
    return parsed.pathname + parsed.search;
  } catch {
    return '/';
  }
}
