/**
 * Swift Code Generator
 * Based on curlconverter swift generator
 */

import type { Request } from '../curlconverter';

// Escape strings for Swift
function reprStr(s: string): string {
  return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')}"`;
}

export function generateSwiftURLSession(request: Request): string {
  const url = request.urls[0]?.url || '';
  const method = (request.method || 'GET').toUpperCase();
  const headers = request.headers || {};

  let code = '';

  // Imports
  code += 'import Foundation\n\n';

  // Create URL
  code += `guard let url = URL(string: ${reprStr(url)}) else {\n`;
  code += '    print("Invalid URL")\n';
  code += '    return\n';
  code += '}\n\n';

  // Create request
  code += 'var request = URLRequest(url: url)\n';
  code += `request.httpMethod = ${reprStr(method)}\n`;

  // Add headers
  Object.entries(headers).forEach(([key, value]) => {
    if (value && typeof value === 'string') {
      code += `request.setValue(${reprStr(value)}, forHTTPHeaderField: ${reprStr(key)})\n`;
    }
  });

  // Handle body data
  if (request.json) {
    const jsonStr = JSON.stringify(request.json);
    code += `\nlet jsonData = ${reprStr(jsonStr)}.data(using: .utf8)!\n`;
    code += 'request.httpBody = jsonData\n';
    code += 'request.setValue("application/json", forHTTPHeaderField: "Content-Type")\n';
  } else if (request.dataArray && request.dataArray.length > 0) {
    const dataStr = request.dataArray.map(d =>
      typeof d === 'string' ? d : (typeof d === 'object' && 'filename' in d ? d.filename : ''),
    ).join('');
    code += `\nlet bodyData = ${reprStr(dataStr)}.data(using: .utf8)!\n`;
    code += 'request.httpBody = bodyData\n';
  } else if (request.data) {
    const dataStr = Array.isArray(request.data)
      ? request.data.map(d => (typeof d === 'object' && 'content' in d ? d.content : String(d)) || '').join('&')
      : String(request.data);
    code += `\nlet bodyData = ${reprStr(dataStr)}.data(using: .utf8)!\n`;
    code += 'request.httpBody = bodyData\n';
  }

  // Execute request
  code += '\nlet task = URLSession.shared.dataTask(with: request) { data, response, error in\n';
  code += '    if let error = error {\n';
  code += '        print("Error: \\(error)")\n';
  code += '        return\n';
  code += '    }\n';
  code += '    \n';
  code += '    if let data = data {\n';
  code += '        if let responseString = String(data: data, encoding: .utf8) {\n';
  code += '            print(responseString)\n';
  code += '        }\n';
  code += '    }\n';
  code += '}\n\n';
  code += 'task.resume()\n';

  return code;
}

export function generateSwiftAlamofire(request: Request): string {
  const url = request.urls[0]?.url || '';
  const method = (request.method || 'GET').toLowerCase();
  const headers = request.headers || {};

  let code = '';

  // Imports
  code += 'import Alamofire\n\n';

  // Prepare headers
  let headersCode = '';
  if (Object.keys(headers).length > 0) {
    headersCode = 'let headers: HTTPHeaders = [\n';
    Object.entries(headers).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        headersCode += `    ${reprStr(key)}: ${reprStr(value)},\n`;
      }
    });
    headersCode += ']\n\n';
    code += headersCode;
  }

  // Prepare parameters/body
  let parametersCode = '';
  if (request.json) {
    const jsonStr = JSON.stringify(request.json);
    parametersCode = `let parameters = ${reprStr(jsonStr)}\n\n`;
    code += parametersCode;
  } else if (request.dataArray && request.dataArray.length > 0) {
    const dataStr = request.dataArray.map(d =>
      typeof d === 'string' ? d : (typeof d === 'object' && 'filename' in d ? d.filename : ''),
    ).join('');
    parametersCode = `let parameters = ${reprStr(dataStr)}\n\n`;
    code += parametersCode;
  } else if (request.data) {
    const dataStr = Array.isArray(request.data)
      ? request.data.map(d => (typeof d === 'object' && 'content' in d ? d.content : String(d)) || '').join('&')
      : String(request.data);
    parametersCode = `let parameters = ${reprStr(dataStr)}\n\n`;
    code += parametersCode;
  }

  // Make request
  code += `AF.request(${reprStr(url)}, method: .${method}`;

  if (parametersCode) {
    code += ', parameters: parameters';
  }

  if (headersCode) {
    code += ', headers: headers';
  }

  code += ').responseString { response in\n';
  code += '    switch response.result {\n';
  code += '    case .success(let value):\n';
  code += '        print(value)\n';
  code += '    case .failure(let error):\n';
  code += '        print("Error: \\(error)")\n';
  code += '    }\n';
  code += '}\n';

  return code;
}
