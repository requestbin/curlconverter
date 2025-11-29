/**
 * Java Code Generators
 * Based on curlconverter generators - modern Java HttpClient approach
 */

import type { Request } from '../curlconverter';

// Escape strings for Java
function reprStr(s: string): string {
  return `"${s.replace(/["\\]/g, '\\$&').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t').replace(/\0/g, '\\0')}"`;
}

export function generateJavaHttpClient(request: Request): string {
  const url = request.urls[0]?.url || '';
  const method = (request.method || 'GET').toUpperCase();
  const headers = request.headers || {};

  const imports = new Set([
    'java.net.URI',
    'java.net.http.HttpClient',
    'java.net.http.HttpRequest',
    'java.net.http.HttpResponse',
    'java.io.IOException',
  ]);

  let code = '';

  // Client creation
  code += 'HttpClient client = HttpClient.newHttpClient();\n\n';

  // Request body handling
  let bodyPublisher = 'HttpRequest.BodyPublishers.noBody()';

  if (request.json) {
    const jsonStr = JSON.stringify(request.json);
    bodyPublisher = `HttpRequest.BodyPublishers.ofString(${reprStr(jsonStr)})`;
    imports.add('java.net.http.HttpRequest.BodyPublishers');
  } else if (request.dataArray && request.dataArray.length > 0) {
    const { bodyCode, additionalImports } = generateHttpClientDataFromDataArray(request.dataArray);
    code += bodyCode;
    bodyPublisher = 'bodyPublisher';
    additionalImports.forEach(imp => imports.add(imp));
  } else if (request.data) {
    const dataStr = Array.isArray(request.data)
      ? request.data.map(d => d.content || '').join('&')
      : String(request.data);
    bodyPublisher = `HttpRequest.BodyPublishers.ofString(${reprStr(dataStr)})`;
    imports.add('java.net.http.HttpRequest.BodyPublishers');
  }

  // Build request
  code += 'HttpRequest request = HttpRequest.newBuilder()\n';
  code += `    .uri(URI.create(${reprStr(url)}))\n`;
  code += `    .${method}(${bodyPublisher})\n`;

  // Add headers
  Object.entries(headers).forEach(([key, value]) => {
    if (value && typeof value === 'string') {
      code += `    .setHeader(${reprStr(key)}, ${reprStr(value)})\n`;
    }
  });

  code += '    .build();\n\n';

  // Execute request
  code += 'HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());\n';
  code += 'System.out.println(response.body());\n';

  // Add imports
  let finalCode = '';
  Array.from(imports).sort().forEach((imp) => {
    finalCode += `import ${imp};\n`;
  });
  finalCode += '\n';

  // Wrap in class
  finalCode += 'public class Main {\n';
  finalCode += '    public static void main(String[] args) throws IOException, InterruptedException {\n';
  finalCode += code.split('\n').map(line => line ? `        ${line}` : '').join('\n');
  finalCode += '    }\n';
  finalCode += '}\n';

  return finalCode;
}

export function generateJavaOkHttp(request: Request): string {
  const url = request.urls[0]?.url || '';
  const method = (request.method || 'GET').toUpperCase();
  const headers = request.headers || {};

  let code = '';

  // Imports and setup
  code += 'import okhttp3.*;\n';
  code += 'import java.io.IOException;\n';
  code += 'import java.io.File;\n\n';

  code += 'public class Main {\n';
  code += '    public static void main(String[] args) throws IOException {\n';
  code += '        OkHttpClient client = new OkHttpClient();\n\n';

  // Request body handling
  let requestBodyCode = 'null';

  if (request.json) {
    const jsonStr = JSON.stringify(request.json).replace(/"/g, '\\"');
    code += '        MediaType JSON = MediaType.get("application/json; charset=utf-8");\n';
    code += `        RequestBody body = RequestBody.create("${jsonStr}", JSON);\n\n`;
    requestBodyCode = 'body';
  } else if (request.dataArray && request.dataArray.length > 0) {
    const bodyCode = generateOkHttpDataFromDataArray(request.dataArray);
    code += bodyCode;
    requestBodyCode = 'body';
  } else if (request.data) {
    const dataStr = Array.isArray(request.data)
      ? request.data.map(d => d.content || '').join('&')
      : String(request.data);
    code += '        MediaType TEXT = MediaType.get("text/plain; charset=utf-8");\n';
    code += `        RequestBody body = RequestBody.create("${dataStr.replace(/"/g, '\\"')}", TEXT);\n\n`;
    requestBodyCode = 'body';
  }

  // Build request
  code += '        Request.Builder requestBuilder = new Request.Builder()\n';
  code += `                .url("${url}");\n\n`;

  // Add method
  if (method === 'GET') {
    code += '        requestBuilder.get();\n';
  } else if (method === 'POST') {
    code += `        requestBuilder.post(${requestBodyCode});\n`;
  } else if (method === 'PUT') {
    code += `        requestBuilder.put(${requestBodyCode});\n`;
  } else if (method === 'DELETE') {
    code += `        requestBuilder.delete(${requestBodyCode});\n`;
  } else {
    code += `        requestBuilder.method("${method}", ${requestBodyCode});\n`;
  }

  // Add headers
  Object.entries(headers).forEach(([key, value]) => {
    if (value && typeof value === 'string') {
      code += `        requestBuilder.addHeader("${key}", "${value.replace(/"/g, '\\"')}");\n`;
    }
  });

  code += '\n        Request request = requestBuilder.build();\n';
  code += '        Response response = client.newCall(request).execute();\n';
  code += '        System.out.println(response.body().string());\n';
  code += '    }\n';
  code += '}\n';

  return code;
}

// Helper functions for data array processing
function generateHttpClientDataFromDataArray(dataArray: any[]): { bodyCode: string; additionalImports: Set<string> } {
  const imports = new Set<string>(['java.net.http.HttpRequest.BodyPublishers']);
  let code = '';

  const hasFiles = dataArray.some(d => typeof d === 'object' && d.filetype);

  if (hasFiles) {
    imports.add('java.nio.file.Files');
    imports.add('java.nio.file.Paths');
    imports.add('java.net.URLEncoder');
    imports.add('java.nio.charset.StandardCharsets');

    code += 'StringBuilder bodyBuilder = new StringBuilder();\n';

    dataArray.forEach((d) => {
      if (typeof d === 'string') {
        code += `bodyBuilder.append(${reprStr(d)});\n`;
      } else if (d.filetype) {
        const { filetype, filename, name } = d;

        if (filetype === 'urlencode' && name) {
          code += `bodyBuilder.append(${reprStr(`${name}=`)});\n`;
          const varName = `fileContent${Math.random().toString(36).substring(7)}`;
          code += `String ${varName} = Files.readString(Paths.get(${reprStr(filename)}));\n`;
          code += `bodyBuilder.append(URLEncoder.encode(${varName}, StandardCharsets.UTF_8));\n`;
        } else {
          code += `bodyBuilder.append(Files.readString(Paths.get(${reprStr(filename)})));\n`;
        }
      }
    });

    code += 'HttpRequest.BodyPublisher bodyPublisher = HttpRequest.BodyPublishers.ofString(bodyBuilder.toString());\n\n';
  } else {
    const dataStr = dataArray.map(d =>
      typeof d === 'string' ? d : (typeof d === 'object' && 'filename' in d ? d.filename : ''),
    ).join('');
    code += `HttpRequest.BodyPublisher bodyPublisher = HttpRequest.BodyPublishers.ofString(${reprStr(dataStr)});\n\n`;
  }

  return { bodyCode: code, additionalImports: imports };
}

function generateOkHttpDataFromDataArray(dataArray: any[]): string {
  let code = '';
  const hasFiles = dataArray.some(d => typeof d === 'object' && d.filetype);

  if (hasFiles) {
    code += '        StringBuilder bodyBuilder = new StringBuilder();\n';

    dataArray.forEach((d) => {
      if (typeof d === 'string') {
        code += `        bodyBuilder.append(${reprStr(d)});\n`;
      } else if (d.filetype) {
        const { filetype, filename, name } = d;

        if (filetype === 'urlencode' && name) {
          code += `        bodyBuilder.append(${reprStr(`${name}=`)});\n`;
          code += `        String fileContent = new String(Files.readAllBytes(Paths.get(${reprStr(filename)})));\n`;
          code += '        bodyBuilder.append(URLEncoder.encode(fileContent, StandardCharsets.UTF_8));\n';
        } else {
          code += `        bodyBuilder.append(new String(Files.readAllBytes(Paths.get(${reprStr(filename)}))));\n`;
        }
      }
    });

    code += '        MediaType TEXT = MediaType.get("text/plain; charset=utf-8");\n';
    code += '        RequestBody body = RequestBody.create(bodyBuilder.toString(), TEXT);\n\n';
  } else {
    const dataStr = dataArray.map(d =>
      typeof d === 'string' ? d : (typeof d === 'object' && 'filename' in d ? d.filename : ''),
    ).join('');
    code += '        MediaType TEXT = MediaType.get("text/plain; charset=utf-8");\n';
    code += `        RequestBody body = RequestBody.create(${reprStr(dataStr)}, TEXT);\n\n`;
  }

  return code;
}

export function generateJavaHttpUrlConnection(request: Request): string {
  const url = request.urls[0]?.url || '';
  const method = (request.method || 'GET').toUpperCase();
  const headers = request.headers || {};

  let code = '';

  // Imports
  code += 'import java.io.*;\n';
  code += 'import java.net.HttpURLConnection;\n';
  code += 'import java.net.URL;\n';
  if (request.dataArray?.some(d => typeof d === 'object' && d.filetype === 'urlencode')) {
    code += 'import java.net.URLEncoder;\n';
    code += 'import java.nio.charset.StandardCharsets;\n';
  }
  code += '\n';

  code += 'public class Main {\n';
  code += '    public static void main(String[] args) throws IOException {\n';
  code += `        URL url = new URL(${reprStr(url)});\n`;
  code += '        HttpURLConnection conn = (HttpURLConnection) url.openConnection();\n';
  code += `        conn.setRequestMethod("${method}");\n\n`;

  // Add headers
  Object.entries(headers).forEach(([key, value]) => {
    if (value && typeof value === 'string') {
      code += `        conn.setRequestProperty(${reprStr(key)}, ${reprStr(value)});\n`;
    }
  });

  // Handle body data
  if (request.json || request.dataArray || request.data) {
    code += '\n        conn.setDoOutput(true);\n\n';

    if (request.json) {
      const jsonStr = JSON.stringify(request.json);
      code += `        String requestBody = ${reprStr(jsonStr)};\n`;
    } else if (request.dataArray && request.dataArray.length > 0) {
      const dataStr = request.dataArray.map(d =>
        typeof d === 'string' ? d : (typeof d === 'object' && 'filename' in d ? d.filename : ''),
      ).join('');
      code += `        String requestBody = ${reprStr(dataStr)};\n`;
    } else if (request.data) {
      const dataStr = Array.isArray(request.data)
        ? request.data.map(d => (typeof d === 'object' && 'content' in d ? d.content : String(d)) || '').join('&')
        : String(request.data);
      code += `        String requestBody = ${reprStr(dataStr)};\n`;
    }

    code += '\n        try (OutputStreamWriter writer = new OutputStreamWriter(conn.getOutputStream())) {\n';
    code += '            writer.write(requestBody);\n';
    code += '        }\n';
  }

  code += '\n        BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));\n';
  code += '        String line;\n';
  code += '        StringBuilder response = new StringBuilder();\n';
  code += '        while ((line = reader.readLine()) != null) {\n';
  code += '            response.append(line);\n';
  code += '        }\n';
  code += '        reader.close();\n';
  code += '        System.out.println(response.toString());\n';
  code += '    }\n';
  code += '}\n';

  return code;
}
