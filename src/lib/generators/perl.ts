/**
 * Perl Code Generator
 * Based on curlconverter perl generator
 */

import type { Request } from '../curlconverter';

// Escape strings for Perl
function reprStr(s: string): string {
  const needsEscaping = /\p{C}|[^ \P{Z}]/u;

  if (!needsEscaping.test(s)) {
    return `'${s.replace(/\\/g, '\\\\').replace(/'/g, '\\\'')}'`;
  }

  return `"${s.replace(/[$@"\\]/g, '\\$&')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\f/g, '\\f')
    .replace(/\b/g, '\\b')}"`;
}

export function generatePerlLWP(request: Request): string {
  const url = request.urls[0]?.url || '';
  const method = (request.method || 'GET').toUpperCase();
  const headers = request.headers || {};

  let code = '';

  // Imports
  code += 'use strict;\n';
  code += 'use warnings;\n';
  code += 'use LWP::UserAgent;\n';
  code += 'use HTTP::Request;\n\n';

  // Create user agent
  code += 'my $ua = LWP::UserAgent->new();\n';

  // Handle body data
  let bodyCode = '';
  if (request.json) {
    code += 'use JSON;\n';
    const jsonStr = JSON.stringify(request.json);
    bodyCode = `encode_json(${reprStr(jsonStr)})`;
  } else if (request.dataArray && request.dataArray.length > 0) {
    const dataStr = request.dataArray.map(d =>
      typeof d === 'string' ? d : (typeof d === 'object' && 'filename' in d ? d.filename : ''),
    ).join('');
    bodyCode = reprStr(dataStr);
  } else if (request.data) {
    const dataStr = Array.isArray(request.data)
      ? request.data.map(d => (typeof d === 'object' && 'content' in d ? d.content : String(d)) || '').join('&')
      : String(request.data);
    bodyCode = reprStr(dataStr);
  }

  // Create request
  code += `\nmy $request = HTTP::Request->new('${method}', ${reprStr(url)});\n`;

  // Add headers
  Object.entries(headers).forEach(([key, value]) => {
    if (value && typeof value === 'string') {
      code += `$request->header('${key}' => ${reprStr(value)});\n`;
    }
  });

  // Add body
  if (bodyCode) {
    code += `$request->content(${bodyCode});\n`;
  }

  // Execute request
  code += '\nmy $response = $ua->request($request);\n';
  code += 'if ($response->is_success) {\n';
  code += '    print $response->decoded_content;\n';
  code += '} else {\n';
  code += '    die $response->status_line;\n';
  code += '}\n';

  return code;
}

export function generatePerlHTTPTiny(request: Request): string {
  const url = request.urls[0]?.url || '';
  const method = (request.method || 'GET').toLowerCase();
  const headers = request.headers || {};

  let code = '';

  // Imports
  code += 'use strict;\n';
  code += 'use warnings;\n';
  code += 'use HTTP::Tiny;\n\n';

  // Create HTTP::Tiny instance
  code += 'my $http = HTTP::Tiny->new();\n\n';

  // Prepare options
  let optionsCode = '';

  // Add headers
  if (Object.keys(headers).length > 0) {
    optionsCode += '    headers => {\n';
    Object.entries(headers).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        optionsCode += `        ${reprStr(key)} => ${reprStr(value)},\n`;
      }
    });
    optionsCode += '    },\n';
  }

  // Handle body data
  if (request.json) {
    code += 'use JSON;\n';
    const jsonStr = JSON.stringify(request.json);
    optionsCode += `    content => encode_json(${reprStr(jsonStr)}),\n`;
  } else if (request.dataArray && request.dataArray.length > 0) {
    const dataStr = request.dataArray.map(d =>
      typeof d === 'string' ? d : (typeof d === 'object' && 'filename' in d ? d.filename : ''),
    ).join('');
    optionsCode += `    content => ${reprStr(dataStr)},\n`;
  } else if (request.data) {
    const dataStr = Array.isArray(request.data)
      ? request.data.map(d => (typeof d === 'object' && 'content' in d ? d.content : String(d)) || '').join('&')
      : String(request.data);
    optionsCode += `    content => ${reprStr(dataStr)},\n`;
  }

  // Execute request
  if (optionsCode) {
    code += `my $response = $http->${method}(${reprStr(url)}, {\n${optionsCode}});\n\n`;
  } else {
    code += `my $response = $http->${method}(${reprStr(url)});\n\n`;
  }

  // Handle response
  code += 'if ($response->{success}) {\n';
  code += '    print $response->{content};\n';
  code += '} else {\n';
  code += '    die "$response->{status} $response->{reason}\\n";\n';
  code += '}\n';

  return code;
}
