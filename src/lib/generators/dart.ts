/**
 * Dart Code Generator
 * Based on curlconverter dart generator
 */

import type { Request } from '../curlconverter';

// Escape strings for Dart
function reprStr(s: string): string {
  return `'${s.replace(/\\/g, '\\\\').replace(/'/g, '\\\'').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')}'`;
}

export function generateDartHttp(request: Request): string {
  const url = request.urls[0]?.url || '';
  const method = (request.method || 'GET').toLowerCase();
  const headers = request.headers || {};

  let code = '';

  // Imports
  code += 'import \'package:http/http.dart\' as http;\n';
  code += 'import \'dart:convert\';\n\n';

  // Main function
  code += 'void main() async {\n';

  // Prepare headers
  if (Object.keys(headers).length > 0) {
    code += '  var headers = {\n';
    Object.entries(headers).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        code += `    ${reprStr(key)}: ${reprStr(value)},\n`;
      }
    });
    code += '  };\n\n';
  }

  // Prepare body
  let bodyCode = '';
  if (request.json) {
    const jsonStr = JSON.stringify(request.json);
    bodyCode = `jsonEncode(${reprStr(jsonStr)})`;
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

  // Make request
  const hasHeaders = Object.keys(headers).length > 0;
  const hasBody = bodyCode !== '';

  if (method === 'get') {
    code += `  var response = await http.get(\n`;
    code += `    Uri.parse(${reprStr(url)})`;
    if (hasHeaders) {
      code += ',\n    headers: headers';
    }
    code += '\n  );\n';
  } else {
    code += `  var response = await http.${method}(\n`;
    code += `    Uri.parse(${reprStr(url)})`;
    if (hasHeaders) {
      code += ',\n    headers: headers';
    }
    if (hasBody) {
      code += `,\n    body: ${bodyCode}`;
    }
    code += '\n  );\n';
  }

  // Handle response
  code += '\n  if (response.statusCode == 200) {\n';
  code += '    print(response.body);\n';
  code += '  } else {\n';
  code += '    throw Exception(\'Failed to load data\');\n';
  code += '  }\n';
  code += '}\n';

  return code;
}

export function generateDartDio(request: Request): string {
  const url = request.urls[0]?.url || '';
  const method = (request.method || 'GET').toLowerCase();
  const headers = request.headers || {};

  let code = '';

  // Imports
  code += 'import \'package:dio/dio.dart\';\n\n';

  // Main function
  code += 'void main() async {\n';
  code += '  var dio = Dio();\n\n';

  // Prepare options
  let optionsCode = '';

  // Add headers
  if (Object.keys(headers).length > 0) {
    optionsCode += '    headers: {\n';
    Object.entries(headers).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        optionsCode += `      ${reprStr(key)}: ${reprStr(value)},\n`;
      }
    });
    optionsCode += '    },\n';
  }

  // Prepare body
  let bodyCode = '';
  if (request.json) {
    bodyCode = JSON.stringify(request.json);
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

  // Make request
  code += '  try {\n';
  if (optionsCode || bodyCode) {
    code += `    var response = await dio.${method}(\n`;
    code += `      ${reprStr(url)}`;
    if (optionsCode || bodyCode) {
      code += ',\n      options: Options(\n';
      if (optionsCode) {
        code += optionsCode;
      }
      code += '      )';
      if (bodyCode) {
        code += `,\n      data: ${bodyCode}`;
      }
    }
    code += '\n    );\n';
  } else {
    code += `    var response = await dio.${method}(${reprStr(url)});\n`;
  }

  code += '    print(response.data);\n';
  code += '  } catch (e) {\n';
  code += '    print(\'Error: \$e\');\n';
  code += '  }\n';
  code += '}\n';

  return code;
}
