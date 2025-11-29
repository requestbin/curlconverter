/**
 * PHP Code Generators
 * Based on curlconverter generators
 */

import type { Request } from '../curlconverter';

export function generatePhpCurl(request: Request): string {
  const url = request.urls[0]?.url || '';
  const method = request.method.toUpperCase();
  const headers = request.headers;

  let code = `<?php\n\n`;
  code += `$ch = curl_init();\n\n`;

  // URL
  code += `curl_setopt($ch, CURLOPT_URL, '${url}');\n`;
  code += `curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);\n`;

  // Method
  if (method !== 'GET') {
    code += `curl_setopt($ch, CURLOPT_CUSTOMREQUEST, '${method}');\n`;
  }

  // Headers
  if (Object.keys(headers).length > 0) {
    code += `\n$headers = array(\n`;
    const headerEntries = Object.entries(headers)
      .map(([key, value]) => `    '${key}: ${value}'`)
      .join(',\n');
    code += headerEntries;
    code += `\n);\n`;
    code += `curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);\n`;
  }

  // Handle different body types (similar to other generators)
  if (request.multipartUploads && request.multipartUploads.length > 0) {
    // Multipart form data
    code += `\n$postFields = array(\n`;
    request.multipartUploads.forEach((field) => {
      if (field.isFile) {
        code += `    '${field.name}' => new CURLFile('${field.content}'),\n`;
      } else {
        code += `    '${field.name}' => '${field.content.replace(/'/g, '\\\'').replace(/\\/g, '\\\\')}',\n`;
      }
    });
    code += `);\n`;
    code += `curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);\n`;
  } else if (request.json) {
    // JSON data
    code += `\n$data = '${JSON.stringify(request.json).replace(/'/g, '\\\'')}';\n`;
    code += `curl_setopt($ch, CURLOPT_POSTFIELDS, $data);\n`;
  } else if (request.dataArray && request.dataArray.length > 0) {
    // Enhanced data handling using dataArray
    code += generatePhpDataFromDataArray(request.dataArray);
    code += `curl_setopt($ch, CURLOPT_POSTFIELDS, $data);\n`;
  } else if (request.data && request.data.length > 0) {
    // Fallback to legacy data handling
    const body = getRequestBody(request);
    if (body) {
      code += `\n$data = '${body.replace(/'/g, '\\\'')}';\n`;
      code += `curl_setopt($ch, CURLOPT_POSTFIELDS, $data);\n`;
    }
  }

  // Auth
  if (request.auth) {
    code += `\ncurl_setopt($ch, CURLOPT_USERPWD, '${request.auth.username}:${request.auth.password}');\n`;
  }

  code += `\n$result = curl_exec($ch);\n`;
  code += `if (curl_errno($ch)) {\n`;
  code += `    echo 'Error:' . curl_error($ch);\n`;
  code += `}\n`;
  code += `curl_close($ch);\n`;
  code += `echo $result;\n`;

  return code;
}

export function generatePhpGuzzle(request: Request): string {
  const url = request.urls[0]?.url || '';
  const method = request.method.toLowerCase();
  const headers = request.headers;
  const body = getRequestBody(request);

  let code = `<?php\n\n`;
  code += `use GuzzleHttp\\Client;\n\n`;
  code += `$client = new Client();\n\n`;

  // Build options array
  const options: string[] = [];

  // Headers
  if (Object.keys(headers).length > 0) {
    const headerEntries = Object.entries(headers)
      .map(([key, value]) => `        '${key}' => '${value}'`)
      .join(',\n');
    options.push(`    'headers' => [\n${headerEntries}\n    ]`);
  }

  // Data
  if (body) {
    if (request.json) {
      options.push(`    'json' => ${phpArray(request.json)}`);
    } else {
      options.push(`    'body' => '${body.replace(/'/g, '\\\'')}'`);
    }
  }

  // Auth
  if (request.auth) {
    options.push(`    'auth' => ['${request.auth.username}', '${request.auth.password}']`);
  }

  code += `$response = $client->${method}('${url}'`;
  if (options.length > 0) {
    code += `, [\n${options.join(',\n')}\n]`;
  }
  code += `);\n\n`;

  code += `echo $response->getBody();\n`;

  return code;
}

// Generate PHP data handling from dataArray (based on curlconverter approach)
function generatePhpDataFromDataArray(dataArray: any[]): string {
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
    code += `\n$data = '';\n`;

    dataArray.forEach((d, index) => {
      if (typeof d === 'string') {
        // Plain string data
        code += `$data .= ${JSON.stringify(d)};\n`;
      } else if (d.filetype) {
        // File data
        const { filetype, filename, name } = d;

        if (filename === '-') {
          // stdin
          code += `// Reading from stdin\n`;
          code += `$stdinData = file_get_contents('php://stdin');\n`;
          if (filetype === 'urlencode' && name) {
            code += `$data .= '${name}=' . urlencode($stdinData);\n`;
          } else {
            code += `$data .= $stdinData;\n`;
          }
        } else {
          // File
          code += `// Reading file: ${filename}\n`;
          code += `$fileData = file_get_contents('${filename}');\n`;

          if (filetype === 'urlencode') {
            if (name) {
              code += `$data .= '${name}=' . urlencode($fileData);\n`;
            } else {
              code += `$data .= urlencode($fileData);\n`;
            }
          } else if (filetype === 'data') {
            // Remove newlines for --data
            code += `$fileData = str_replace(array("\\n", "\\r"), '', $fileData);\n`;
            code += `$data .= $fileData;\n`;
          } else {
            // Binary or raw data
            code += `$data .= $fileData;\n`;
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
    code += `\n$data = ${dataStrings.join(' . ')};\n`;
  }

  return code;
}

function getRequestBody(request: Request): string {
  if (request.json) {
    return typeof request.json === 'string' ? request.json : JSON.stringify(request.json);
  }

  if (request.data && request.data.length > 0) {
    return request.data.map((d: any) => d.content).join('&');
  }

  return undefined;
}

function phpArray(obj: any, indent = 0): string {
  const spaces = '    '.repeat(indent);

  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      return '[]';
    }
    const items = obj.map(item => `${spaces}    ${phpArray(item, indent + 1)}`).join(',\n');
    return `[\n${items}\n${spaces}]`;
  }

  if (typeof obj === 'object' && obj !== null) {
    const entries = Object.entries(obj);
    if (entries.length === 0) {
      return '[]';
    }
    const items = entries
      .map(([key, value]) => `${spaces}    '${key}' => ${phpArray(value, indent + 1)}`)
      .join(',\n');
    return `[\n${items}\n${spaces}]`;
  }

  if (typeof obj === 'string') {
    return `'${obj.replace(/'/g, '\\\'')}'`;
  }

  if (typeof obj === 'boolean') {
    return obj ? 'true' : 'false';
  }

  return String(obj);
}
