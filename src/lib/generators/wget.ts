/**
 * Wget Code Generator
 * Based on curlconverter wget generator
 */

import type { Request } from '../curlconverter';

// Escape strings for shell
function reprStr(s: string): string {
  return `'${s.replace(/'/g, '\'"\'"\'')}'`;
}

export function generateWget(request: Request): string {
  const url = request.urls[0]?.url || '';
  const method = (request.method || 'GET').toUpperCase();
  const headers = request.headers || {};

  let code = 'wget';

  // Add method if not GET
  if (method !== 'GET') {
    code += ` --method=${method}`;
  }

  // Add headers
  Object.entries(headers).forEach(([key, value]) => {
    if (value && typeof value === 'string') {
      code += ` --header=${reprStr(`${key}: ${value}`)}`;
    }
  });

  // Handle body data
  if (request.json) {
    const jsonStr = JSON.stringify(request.json);
    code += ` --body-data=${reprStr(jsonStr)}`;
    code += ` --header=${reprStr('Content-Type: application/json')}`;
  } else if (request.dataArray && request.dataArray.length > 0) {
    const dataStr = request.dataArray.map(d =>
      typeof d === 'string' ? d : (typeof d === 'object' && 'filename' in d ? d.filename : ''),
    ).join('');
    code += ` --body-data=${reprStr(dataStr)}`;
  } else if (request.data) {
    const dataStr = Array.isArray(request.data)
      ? request.data.map(d => (typeof d === 'object' && 'content' in d ? d.content : String(d)) || '').join('&')
      : String(request.data);
    code += ` --body-data=${reprStr(dataStr)}`;
  }

  // Add URL (should be last)
  code += ` ${reprStr(url)}`;

  return code;
}

export function generateWgetMirror(request: Request): string {
  const url = request.urls[0]?.url || '';
  const method = (request.method || 'GET').toUpperCase();

  let code = 'wget';

  // Add common mirror options
  code += ' --mirror --convert-links --adjust-extension --page-requisites --no-parent';

  // Add method if not GET
  if (method !== 'GET') {
    code += ` --method=${method}`;
  }

  // Add URL
  code += ` ${reprStr(url)}`;

  return code;
}
