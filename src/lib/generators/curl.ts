/**
 * cURL Code Generators
 * Generate Windows-compatible cURL commands
 */

import type { Request } from '../curlconverter';

export function generateCurlWindows(request: Request): string {
  const url = request.urls[0]?.url || '';
  const method = request.method.toUpperCase();
  const headers = request.headers;

  let curlCommand = `curl.exe`;

  // Add method
  if (method !== 'GET') {
    curlCommand += ` ^\n  -X ${method}`;
  }

  // Add URL
  curlCommand += ` ^\n  "${url}"`;

  // Add headers
  Object.entries(headers).forEach(([key, value]) => {
    curlCommand += ` ^\n  -H "${key}: ${value}"`;
  });

  // Add data
  if (request.json) {
    const jsonStr = JSON.stringify(request.json).replace(/"/g, '\\"');
    curlCommand += ` ^\n  --json "${jsonStr}"`;
  } else if (request.data && request.data.length > 0) {
    request.data.forEach((d) => {
      if (d.binary) {
        curlCommand += ` ^\n  --data-binary "${d.isFile ? `@${d.content}` : d.content}"`;
      } else if (d.urlencode) {
        const urlencodeData = d.name ? `${d.name}=${d.isFile ? `@${d.content}` : d.content}` : (d.isFile ? `@${d.content}` : d.content);
        curlCommand += ` ^\n  --data-urlencode "${urlencodeData}"`;
      } else {
        curlCommand += ` ^\n  --data "${d.isFile ? `@${d.content}` : d.content}"`;
      }
    });
  }

  // Add auth
  if (request.auth) {
    curlCommand += ` ^\n  -u "${request.auth.username}:${request.auth.password}"`;
  }

  // Add form data
  if (request.multipartUploads && request.multipartUploads.length > 0) {
    request.multipartUploads.forEach((field) => {
      const content = field.isFile ? `@${field.content}` : field.content;
      curlCommand += ` ^\n  -F "${field.name}=${content}"`;
    });
  }

  return curlCommand;
}

export function generateCurlPowerShell(request: Request): string {
  const url = request.urls[0]?.url || '';
  const method = request.method.toUpperCase();
  const headers = request.headers;

  let curlCommand = `curl.exe`;

  // Add method
  if (method !== 'GET') {
    curlCommand += ` \`\n  -X ${method}`;
  }

  // Add URL
  curlCommand += ` \`\n  '${url}'`;

  // Add headers
  Object.entries(headers).forEach(([key, value]) => {
    curlCommand += ` \`\n  -H '${key}: ${value}'`;
  });

  // Add data
  if (request.json) {
    const jsonStr = JSON.stringify(request.json);
    curlCommand += ` \`\n  --json '${jsonStr}'`;
  } else if (request.data && request.data.length > 0) {
    request.data.forEach((d) => {
      if (d.binary) {
        curlCommand += ` \`\n  --data-binary '${d.isFile ? `@${d.content}` : d.content}'`;
      } else if (d.urlencode) {
        const urlencodeData = d.name ? `${d.name}=${d.isFile ? `@${d.content}` : d.content}` : (d.isFile ? `@${d.content}` : d.content);
        curlCommand += ` \`\n  --data-urlencode '${urlencodeData}'`;
      } else {
        curlCommand += ` \`\n  --data '${d.isFile ? `@${d.content}` : d.content}'`;
      }
    });
  }

  // Add auth
  if (request.auth) {
    curlCommand += ` \`\n  -u '${request.auth.username}:${request.auth.password}'`;
  }

  // Add form data
  if (request.multipartUploads && request.multipartUploads.length > 0) {
    request.multipartUploads.forEach((field) => {
      const content = field.isFile ? `@${field.content}` : field.content;
      curlCommand += ` \`\n  -F '${field.name}=${content}'`;
    });
  }

  return curlCommand;
}
