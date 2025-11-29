/**
 * PowerShell Code Generator
 * Based on curlconverter powershell generator
 */

import type { Request } from '../curlconverter';

// Escape strings for PowerShell
function reprStr(s: string): string {
  return `"${s.replace(/[`"$]/g, '`$&')
    .replace(/\n/g, '`n')
    .replace(/\r/g, '`r')
    .replace(/\t/g, '`t')
    .replace(/\0/g, '`0')}"`;
}

export function generatePowerShellInvokeWebRequest(request: Request): string {
  const url = request.urls[0]?.url || '';
  const method = (request.method || 'GET').toUpperCase();
  const headers = request.headers || {};

  let code = '';

  // Build Invoke-WebRequest command
  code += `$response = Invoke-WebRequest -Uri ${reprStr(url)} -Method ${method}`;

  // Add headers
  if (Object.keys(headers).length > 0) {
    code += ' -Headers @{\n';
    Object.entries(headers).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        code += `    ${reprStr(key)} = ${reprStr(value)}\n`;
      }
    });
    code += '}';
  }

  // Handle body data
  if (request.json) {
    const jsonStr = JSON.stringify(request.json);
    code += ` -Body ${reprStr(jsonStr)} -ContentType "application/json"`;
  } else if (request.dataArray && request.dataArray.length > 0) {
    const dataStr = request.dataArray.map(d =>
      typeof d === 'string' ? d : (typeof d === 'object' && 'filename' in d ? d.filename : ''),
    ).join('');
    code += ` -Body ${reprStr(dataStr)}`;
  } else if (request.data) {
    const dataStr = Array.isArray(request.data)
      ? request.data.map(d => (typeof d === 'object' && 'content' in d ? d.content : String(d)) || '').join('&')
      : String(request.data);
    code += ` -Body ${reprStr(dataStr)}`;
  }

  code += '\n\nWrite-Output $response.Content\n';

  return code;
}

export function generatePowerShellInvokeRestMethod(request: Request): string {
  const url = request.urls[0]?.url || '';
  const method = (request.method || 'GET').toUpperCase();
  const headers = request.headers || {};

  let code = '';

  // Build Invoke-RestMethod command
  code += `$response = Invoke-RestMethod -Uri ${reprStr(url)} -Method ${method}`;

  // Add headers
  if (Object.keys(headers).length > 0) {
    code += ' -Headers @{\n';
    Object.entries(headers).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        code += `    ${reprStr(key)} = ${reprStr(value)}\n`;
      }
    });
    code += '}';
  }

  // Handle body data
  if (request.json) {
    const jsonStr = JSON.stringify(request.json);
    code += ` -Body ${reprStr(jsonStr)} -ContentType "application/json"`;
  } else if (request.dataArray && request.dataArray.length > 0) {
    const dataStr = request.dataArray.map(d =>
      typeof d === 'string' ? d : (typeof d === 'object' && 'filename' in d ? d.filename : ''),
    ).join('');
    code += ` -Body ${reprStr(dataStr)}`;
  } else if (request.data) {
    const dataStr = Array.isArray(request.data)
      ? request.data.map(d => (typeof d === 'object' && 'content' in d ? d.content : String(d)) || '').join('&')
      : String(request.data);
    code += ` -Body ${reprStr(dataStr)}`;
  }

  code += '\n\nWrite-Output $response\n';

  return code;
}
