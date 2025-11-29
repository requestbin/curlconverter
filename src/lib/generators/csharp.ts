/**
 * C# Code Generators
 * Based on curlconverter generators
 */

import type { Request } from '../curlconverter';

export function generateCSharpHttpClient(request: Request): string {
  const url = request.urls[0]?.url || '';
  const method = request.method.toUpperCase();
  const headers = request.headers;

  let code = `using System;\nusing System.Net.Http;\nusing System.Text;\nusing System.Threading.Tasks;\n\n`;
  code += `class Program\n{\n`;
  code += `    static async Task Main()\n    {\n`;
  code += `        var client = new HttpClient();\n\n`;

  // Add headers
  if (Object.keys(headers).length > 0) {
    Object.entries(headers).forEach(([key, value]) => {
      if (key.toLowerCase() !== 'content-type') {
        code += `        client.DefaultRequestHeaders.Add("${key}", "${value.replace(/"/g, '\\"')}");\n`;
      }
    });
    if (Object.keys(headers).length > 0) {
      code += `\n`;
    }
  }

  // Handle different body types
  let contentVar = 'null';

  if (request.multipartUploads && request.multipartUploads.length > 0) {
    // Multipart form data
    code += `        var formData = new MultipartFormDataContent();\n`;

    request.multipartUploads.forEach((field) => {
      if (field.isFile) {
        code += `        // File upload: ${field.content}\n`;
        code += `        var fileContent = new ByteArrayContent(File.ReadAllBytes("${field.content}"));\n`;
        code += `        fileContent.Headers.ContentType = MediaTypeHeaderValue.Parse("application/octet-stream");\n`;
        code += `        formData.Add(fileContent, "${field.name}", "${field.content}");\n`;
      } else {
        code += `        formData.Add(new StringContent("${field.content.replace(/"/g, '\\"')}"), "${field.name}");\n`;
      }
    });

    code += `\n`;
    contentVar = 'formData';
  } else if (request.json) {
    // JSON data
    const jsonStr = JSON.stringify(request.json).replace(/"/g, '\\"');
    code += `        var json = "${jsonStr}";\n`;
    code += `        var content = new StringContent(json, Encoding.UTF8, "application/json");\n\n`;
    contentVar = 'content';
  } else if (request.dataArray && request.dataArray.length > 0) {
    // Enhanced data handling using dataArray
    code += generateCSharpDataFromDataArray(request.dataArray);
    contentVar = 'content';
  } else if (request.data && request.data.length > 0) {
    // Fallback to legacy data handling
    const body = getRequestBody(request);
    if (body) {
      code += `        var data = "${body.replace(/"/g, '\\"')}";\n`;
      code += `        var content = new StringContent(data, Encoding.UTF8, "text/plain");\n\n`;
      contentVar = 'content';
    }
  }

  // Make request
  code += `        var response = await client.${method.charAt(0).toUpperCase() + method.slice(1).toLowerCase()}Async("${url}"`;
  if (contentVar !== 'null') {
    code += `, ${contentVar}`;
  }
  code += `);\n`;
  code += `        var result = await response.Content.ReadAsStringAsync();\n`;
  code += `        Console.WriteLine(result);\n`;
  code += `    }\n`;
  code += `}\n`;

  return code;
}

export function generateCSharpRestSharp(request: Request): string {
  const url = request.urls[0]?.url || '';
  const method = request.method.toUpperCase();
  const headers = request.headers;

  let code = `using RestSharp;\nusing System;\n\n`;
  code += `class Program\n{\n`;
  code += `    static void Main()\n    {\n`;
  code += `        var client = new RestClient("${url}");\n`;
  code += `        var request = new RestRequest(Method.${method});\n\n`;

  // Add headers
  if (Object.keys(headers).length > 0) {
    Object.entries(headers).forEach(([key, value]) => {
      code += `        request.AddHeader("${key}", "${value.replace(/"/g, '\\"')}");\n`;
    });
    code += `\n`;
  }

  // Handle different body types
  if (request.multipartUploads && request.multipartUploads.length > 0) {
    // Multipart form data
    request.multipartUploads.forEach((field) => {
      if (field.isFile) {
        code += `        request.AddFile("${field.name}", "${field.content}");\n`;
      } else {
        code += `        request.AddParameter("${field.name}", "${field.content.replace(/"/g, '\\"')}");\n`;
      }
    });
    code += `\n`;
  } else if (request.json) {
    // JSON data
    code += `        request.AddJsonBody(${JSON.stringify(request.json, null, 4).replace(/"/g, '\\"')});\n\n`;
  } else if (request.dataArray && request.dataArray.length > 0) {
    // Enhanced data handling
    const hasFiles = request.dataArray.some(d => typeof d === 'object' && d.filetype);

    if (hasFiles) {
      code += `        // File data handling\n`;
      request.dataArray.forEach((d) => {
        if (typeof d === 'string') {
          code += `        request.AddParameter("text/plain", "${d.replace(/"/g, '\\"')}", ParameterType.RequestBody);\n`;
        } else if (d.filetype) {
          const { filename, name } = d;
          if (d.filetype === 'urlencode' && name) {
            code += `        // URL-encoded file: ${filename}\n`;
            code += `        var fileContent${name} = File.ReadAllText("${filename}");\n`;
            code += `        request.AddParameter("${name}", Uri.EscapeDataString(fileContent${name}));\n`;
          } else {
            code += `        request.AddFile("data", "${filename}");\n`;
          }
        }
      });
    } else {
      const dataStr = request.dataArray.map(d =>
        typeof d === 'string' ? d : d.content || '',
      ).join('');
      code += `        request.AddParameter("text/plain", "${dataStr.replace(/"/g, '\\"')}", ParameterType.RequestBody);\n`;
    }
    code += `\n`;
  } else if (request.data && request.data.length > 0) {
    const body = getRequestBody(request);
    if (body) {
      code += `        request.AddParameter("text/plain", "${body.replace(/"/g, '\\"')}", ParameterType.RequestBody);\n\n`;
    }
  }

  code += `        IRestResponse response = client.Execute(request);\n`;
  code += `        Console.WriteLine(response.Content);\n`;
  code += `    }\n`;
  code += `}\n`;

  return code;
}

// Generate C# data handling from dataArray
function generateCSharpDataFromDataArray(dataArray: any[]): string {
  let code = '';
  const hasFiles = dataArray.some(d => typeof d === 'object' && d.filetype);

  if (hasFiles) {
    code += `        var dataBuilder = new StringBuilder();\n`;

    dataArray.forEach((d, index) => {
      if (typeof d === 'string') {
        code += `        dataBuilder.Append("${d.replace(/"/g, '\\"')}");\n`;
      } else if (d.filetype) {
        const { filetype, filename, name } = d;

        if (filename === '-') {
          code += `        // Reading from stdin\n`;
          code += `        var stdinData = Console.In.ReadToEnd();\n`;
          if (filetype === 'urlencode' && name) {
            code += `        dataBuilder.Append("${name}=").Append(Uri.EscapeDataString(stdinData));\n`;
          } else {
            code += `        dataBuilder.Append(stdinData);\n`;
          }
        } else {
          code += `        // Reading file: ${filename}\n`;
          if (filetype === 'binary') {
            code += `        var fileBytes${index} = File.ReadAllBytes("${filename}");\n`;
            code += `        dataBuilder.Append(Encoding.UTF8.GetString(fileBytes${index}));\n`;
          } else {
            code += `        var fileText${index} = File.ReadAllText("${filename}");\n`;
            if (filetype === 'urlencode') {
              if (name) {
                code += `        dataBuilder.Append("${name}=").Append(Uri.EscapeDataString(fileText${index}));\n`;
              } else {
                code += `        dataBuilder.Append(Uri.EscapeDataString(fileText${index}));\n`;
              }
            } else if (filetype === 'data') {
              // Remove newlines for --data
              code += `        fileText${index} = fileText${index}.Replace("\\n", "").Replace("\\r", "");\n`;
              code += `        dataBuilder.Append(fileText${index});\n`;
            } else {
              code += `        dataBuilder.Append(fileText${index});\n`;
            }
          }
        }
      }
    });

    code += `        var content = new StringContent(dataBuilder.ToString(), Encoding.UTF8, "text/plain");\n\n`;
  } else {
    const dataStrings = dataArray.map(d =>
      typeof d === 'string' ? `"${d.replace(/"/g, '\\"')}"` : `"${(d.content || '').replace(/"/g, '\\"')}"`,
    );
    code += `        var data = ${dataStrings.join(' + ')};\n`;
    code += `        var content = new StringContent(data, Encoding.UTF8, "text/plain");\n\n`;
  }

  return code;
}

function getRequestBody(request: Request): string {
  if (!request.data || request.data.length === 0) {
    return '';
  }

  return request.data.map(d => d.content).join('&');
}
