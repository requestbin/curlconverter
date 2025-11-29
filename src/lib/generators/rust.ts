/**
 * Rust Code Generator
 * Based on curlconverter rust generator
 */

import type { Request } from '../curlconverter';

const INDENTATION = '    ';

function indent(line: string, level = 1): string {
  return INDENTATION.repeat(level) + line;
}

// Escape strings for Rust
function reprStr(s: string): string {
  return `"${s.replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\0/g, '\\0')}"`;
}

export function generateRustReqwest(request: Request): string {
  const url = request.urls[0]?.url || '';
  const method = (request.method || 'GET').toLowerCase();
  const headers = request.headers || {};

  let code = '';

  // Add basic imports
  code += 'extern crate reqwest;\n';

  // Main function
  code += '\nfn main() -> Result<(), Box<dyn std::error::Error>> {\n';

  // Handle headers
  if (Object.keys(headers).length > 0) {
    code += indent('let mut headers = reqwest::header::HeaderMap::new();\n');

    Object.entries(headers).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        const headerName = key.toLowerCase() === 'cookie'
          ? 'reqwest::header::COOKIE'
          : `"${key}"`;
        code += indent(`headers.insert(${headerName}, ${reprStr(value)}.parse().unwrap());\n`);
      }
    });
    code += '\n';
  }

  // Handle multipart forms (if supported)
  if (request.multipartUploads && request.multipartUploads.length > 0) {
    code += indent('let form = reqwest::multipart::Form::new()\n');

    request.multipartUploads.forEach((field, index) => {
      const isLast = index === request.multipartUploads!.length - 1;
      if (field.isFile) {
        code += indent(`.file(${reprStr(field.name)}, ${reprStr(field.content || '')})?`, 2);
      } else {
        code += indent(`.text(${reprStr(field.name)}, ${reprStr(field.content || '')})`, 2);
      }
      code += isLast ? ';\n\n' : '\n';
    });
  }

  // Create client
  code += indent('let client = reqwest::blocking::Client::new();\n');

  // Build request
  const reqwestMethods = ['get', 'post', 'put', 'patch', 'delete', 'head'];
  if (reqwestMethods.includes(method)) {
    code += indent(`let res = client.${method}(${reprStr(url)})\n`);
  } else {
    code += indent(`let res = client.request(reqwest::Method::from_bytes(b"${method.toUpperCase()}")?, ${reprStr(url)})\n`);
  }

  // Add headers if present
  if (Object.keys(headers).length > 0) {
    code += indent('.headers(headers)\n', 2);
  }

  // Add body data
  if (request.multipartUploads && request.multipartUploads.length > 0) {
    code += indent('.multipart(form)\n', 2);
  } else if (request.json) {
    const jsonStr = JSON.stringify(request.json);
    code += indent(`.body(${reprStr(jsonStr)})\n`, 2);
  } else if (request.dataArray && request.dataArray.length > 0) {
    const dataStr = request.dataArray.map(d =>
      typeof d === 'string' ? d : (typeof d === 'object' && 'filename' in d ? d.filename : ''),
    ).join('');
    code += indent(`.body(${reprStr(dataStr)})\n`, 2);
  } else if (request.data) {
    const dataStr = Array.isArray(request.data)
      ? request.data.map(d => (typeof d === 'object' && 'content' in d ? d.content : String(d)) || '').join('&')
      : String(request.data);
    code += indent(`.body(${reprStr(dataStr)})\n`, 2);
  }

  // Send request
  code += indent('.send()?\n', 2);
  code += indent('.text()?;\n', 2);

  // Print result
  code += indent('println!("{}", res);\n');
  code += '\n';
  code += indent('Ok(())\n');
  code += '}\n';

  return code;
}

export function generateRustUreq(request: Request): string {
  const url = request.urls[0]?.url || '';
  const method = (request.method || 'GET').toUpperCase();
  const headers = request.headers || {};

  let code = '';

  // Add imports
  code += 'extern crate ureq;\n\n';

  // Main function
  code += 'fn main() -> Result<(), Box<dyn std::error::Error>> {\n';

  // Build request
  code += indent(`let mut request = ureq::request("${method}", ${reprStr(url)});\n`);

  // Add headers
  Object.entries(headers).forEach(([key, value]) => {
    if (value && typeof value === 'string') {
      code += indent(`request = request.set(${reprStr(key)}, ${reprStr(value)});\n`);
    }
  });

  // Handle body data
  let hasBody = false;
  if (request.json) {
    const jsonStr = JSON.stringify(request.json);
    code += indent(`let body = ${reprStr(jsonStr)};\n`);
    hasBody = true;
  } else if (request.dataArray && request.dataArray.length > 0) {
    const dataStr = request.dataArray.map(d =>
      typeof d === 'string' ? d : (typeof d === 'object' && 'filename' in d ? d.filename : ''),
    ).join('');
    code += indent(`let body = ${reprStr(dataStr)};\n`);
    hasBody = true;
  } else if (request.data) {
    const dataStr = Array.isArray(request.data)
      ? request.data.map(d => (typeof d === 'object' && 'content' in d ? d.content : String(d)) || '').join('&')
      : String(request.data);
    code += indent(`let body = ${reprStr(dataStr)};\n`);
    hasBody = true;
  }

  // Send request
  if (hasBody) {
    code += indent('let response = request.send_string(&body)?;\n');
  } else {
    code += indent('let response = request.call()?;\n');
  }

  // Read response
  code += indent('let body = response.into_string()?;\n');
  code += indent('println!("{}", body);\n');
  code += '\n';
  code += indent('Ok(())\n');
  code += '}\n';

  return code;
}
