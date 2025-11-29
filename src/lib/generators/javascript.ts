/**
 * JavaScript (Browser) Code Generators
 * Pure client-side JavaScript using browser APIs
 * Based on curlconverter generators
 */

import type { Request } from '../curlconverter';

export function generateJavaScriptFetch(request: Request): string {
  const url = request.urls[0]?.url || '';
  const method = request.method;
  const headers = request.headers;

  let code = `const response = await fetch('${url}', {\n  method: '${method}'`;

  // Handle multipart form data (highest priority)
  if (request.multipartUploads && request.multipartUploads.length > 0) {
    code += `,\n  body: (() => {\n    const formData = new FormData();\n`;
    request.multipartUploads.forEach((field) => {
      if (field.isFile) {
        code += `    // TODO: Replace with actual file object\n    formData.append('${field.name}', new File([/* file contents */], '${field.content}'));\n`;
      } else {
        code += `    formData.append('${field.name}', '${field.content}');\n`;
      }
    });
    code += `    return formData;\n  })()`;
  }
  // Handle JSON data
  else if (request.json) {
    // Add headers (excluding Content-Type for JSON as we'll set it explicitly)
    const filteredHeaders = { ...headers };
    delete filteredHeaders['content-type'];
    delete filteredHeaders['Content-Type'];

    if (Object.keys(filteredHeaders).length > 0) {
      const headerEntries = Object.entries(filteredHeaders)
        .map(([key, value]) => `    '${key}': '${value}'`)
        .join(',\n');
      code += `,\n  headers: {\n${headerEntries},\n    'Content-Type': 'application/json'\n  }`;
    } else {
      code += `,\n  headers: {\n    'Content-Type': 'application/json'\n  }`;
    }

    code += `,\n  body: JSON.stringify(${JSON.stringify(request.json, null, 2)})`;
  }
  // Handle data from dataArray (enhanced file support)
  else if (request.dataArray && request.dataArray.length > 0) {
    // Add headers
    if (Object.keys(headers).length > 0) {
      const headerEntries = Object.entries(headers)
        .map(([key, value]) => `    '${key}': '${value}'`)
        .join(',\n');
      code += `,\n  headers: {\n${headerEntries}\n  }`;
    }

    code += `,\n  body: ${generateJavaScriptDataFromDataArray(request.dataArray)}`;
  }
  // Fallback to legacy data handling
  else if (request.data && request.data.length > 0) {
    // Add headers
    if (Object.keys(headers).length > 0) {
      const headerEntries = Object.entries(headers)
        .map(([key, value]) => `    '${key}': '${value}'`)
        .join(',\n');
      code += `,\n  headers: {\n${headerEntries}\n  }`;
    }

    const body = getRequestBody(request);
    if (body) {
      code += `,\n  body: ${JSON.stringify(body)}`;
    }
  } else {
    // No body, just headers
    if (Object.keys(headers).length > 0) {
      const headerEntries = Object.entries(headers)
        .map(([key, value]) => `    '${key}': '${value}'`)
        .join(',\n');
      code += `,\n  headers: {\n${headerEntries}\n  }`;
    }
  }

  code += `\n});\n\nconst data = await response.json();\nconsole.log(data);`;

  return code;
}

// Generate JavaScript data handling from dataArray (based on curlconverter approach)
function generateJavaScriptDataFromDataArray(dataArray: any[]): string {
  const parts: string[] = [];
  let hasFiles = false;

  for (const d of dataArray) {
    if (typeof d === 'string') {
      // Plain string data
      parts.push(`'${d.replace(/'/g, '\\\'')}'`);
    } else if (d.filetype) {
      // File data
      hasFiles = true;
      const { filetype, filename, name } = d;

      if (filename === '-') {
        // stdin - not directly supported in browser
        parts.push(`'/* stdin input */'`);
      } else {
        if (filetype === 'urlencode' && name) {
          // URL-encoded file with field name
          parts.push(`'${name}=' + encodeURIComponent(/* read ${filename} */)`);
        } else {
          // Regular file - need to read contents
          parts.push(`/* read file: ${filename} */`);
        }
      }
    }
  }

  if (hasFiles) {
    return `(\n    // TODO: Replace file reading with actual file contents\n    ${parts.join(' + ')}\n  )`;
  } else {
    return parts.join(' + ');
  }
}

export function generateJavaScriptXHR(request: Request): string {
  const url = request.urls[0]?.url || '';
  const method = request.method;
  const headers = request.headers;

  let code = `const xhr = new XMLHttpRequest();\n`;
  code += `xhr.open('${method}', '${url}');\n\n`;

  // Add headers
  Object.entries(headers).forEach(([key, value]) => {
    if (typeof value === 'string') {
      code += `xhr.setRequestHeader('${key}', '${value}');\n`;
    }
  });

  if (Object.keys(headers).length > 0) {
    code += '\n';
  }

  // Handle response
  code += `xhr.onreadystatechange = function() {\n`;
  code += `  if (xhr.readyState === 4) {\n`;
  code += `    if (xhr.status >= 200 && xhr.status < 300) {\n`;
  code += `      console.log(xhr.responseText);\n`;
  code += `    } else {\n`;
  code += `      console.error('Error:', xhr.status, xhr.statusText);\n`;
  code += `    }\n`;
  code += `  }\n`;
  code += `};\n\n`;

  // Handle body data
  if (request.multipartUploads && request.multipartUploads.length > 0) {
    code += `const formData = new FormData();\n`;
    request.multipartUploads.forEach((field) => {
      if (field.isFile) {
        code += `// TODO: Replace with actual file object\n`;
        code += `formData.append('${field.name}', new File([/* file contents */], '${field.content}'));\n`;
      } else {
        code += `formData.append('${field.name}', '${field.content}');\n`;
      }
    });
    code += `xhr.send(formData);\n`;
  } else if (request.json) {
    code += `const data = JSON.stringify(${JSON.stringify(request.json, null, 2)});\n`;
    code += `xhr.send(data);\n`;
  } else if (request.data && request.data.length > 0) {
    const dataStr = request.data.map(d => (typeof d === 'object' && 'content' in d ? d.content : String(d)) || '').join('&');
    code += `xhr.send('${dataStr}');\n`;
  } else {
    code += `xhr.send();\n`;
  }

  return code;
}

function getRequestBody(request: Request): string | undefined {
  if (request.json) {
    return typeof request.json === 'string' ? request.json : JSON.stringify(request.json);
  }

  if (request.data && request.data.length > 0) {
    return request.data.map((d: any) => d.content).join('&');
  }

  if (request.multipartUploads && request.multipartUploads.length > 0) {
    // For multipart, we'll need FormData
    return 'MULTIPART_FORM_DATA'; // Placeholder
  }

  return undefined;
}
