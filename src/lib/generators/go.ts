/**
 * Go Code Generators
 * Based on curlconverter generators
 */

import type { Request } from '../curlconverter';

export function generateGoHttp(request: Request): string {
  const url = request.urls[0]?.url || '';
  const method = request.method.toUpperCase();
  const headers = request.headers;

  let code = `package main\n\n`;
  code += `import (\n`;
  code += `    "fmt"\n`;
  code += `    "io"\n`;
  code += `    "log"\n`;
  code += `    "net/http"\n`;

  let needsStrings = false;
  let needsBytes = false;
  let needsMultipart = false;
  let needsOs = false;
  let needsIoutil = false;

  // Determine what imports we need based on data type
  if (request.multipartUploads && request.multipartUploads.length > 0) {
    needsBytes = true;
    needsMultipart = true;
    needsOs = true;
  } else if (request.json) {
    needsStrings = true;
  } else if (request.dataArray && request.dataArray.length > 0) {
    const hasFiles = request.dataArray.some(d => typeof d === 'object' && d.filetype);
    if (hasFiles) {
      needsIoutil = true;
      needsOs = true;
      needsBytes = true;
    } else {
      needsStrings = true;
    }
  } else if (request.data && request.data.length > 0) {
    needsStrings = true;
  }

  if (needsStrings) {
    code += `    "strings"\n`;
  }
  if (needsBytes) {
    code += `    "bytes"\n`;
  }
  if (needsMultipart) {
    code += `    "mime/multipart"\n`;
  }
  if (needsOs) {
    code += `    "os"\n`;
  }
  if (needsIoutil) {
    code += `    "io/ioutil"\n`;
  }

  code += `)\n\n`;
  code += `func main() {\n`;

  // Handle different body types
  let payloadVar = 'nil';

  if (request.multipartUploads && request.multipartUploads.length > 0) {
    // Multipart form data
    code += `    var body bytes.Buffer\n`;
    code += `    writer := multipart.NewWriter(&body)\n\n`;

    request.multipartUploads.forEach((field) => {
      if (field.isFile) {
        code += `    // File upload: ${field.content}\n`;
        code += `    fileWriter, err := writer.CreateFormFile("${field.name}", "${field.content}")\n`;
        code += `    if err != nil {\n        log.Fatal(err)\n    }\n`;
        code += `    file, err := os.Open("${field.content}")\n`;
        code += `    if err != nil {\n        log.Fatal(err)\n    }\n`;
        code += `    defer file.Close()\n`;
        code += `    _, err = io.Copy(fileWriter, file)\n`;
        code += `    if err != nil {\n        log.Fatal(err)\n    }\n\n`;
      } else {
        code += `    writer.WriteField("${field.name}", "${field.content}")\n`;
      }
    });

    code += `    writer.Close()\n`;
    payloadVar = '&body';

    // Set content type for multipart
    headers['Content-Type'] = 'writer.FormDataContentType()';
  } else if (request.json) {
    // JSON data
    const jsonStr = JSON.stringify(request.json).replace(/"/g, '\\"');
    code += `    payload := strings.NewReader("${jsonStr}")\n\n`;
    payloadVar = 'payload';
  } else if (request.dataArray && request.dataArray.length > 0) {
    // Enhanced data handling using dataArray
    code += generateGoDataFromDataArray(request.dataArray);
    payloadVar = 'payload';
  } else if (request.data && request.data.length > 0) {
    // Fallback to legacy data handling
    const body = getRequestBody(request);
    if (body) {
      code += `    payload := strings.NewReader("${body.replace(/"/g, '\\"')}")\n\n`;
      payloadVar = 'payload';
    }
  }

  // Create request
  code += `    req, err := http.NewRequest("${method}", "${url}", ${payloadVar})\n`;
  code += `    if err != nil {\n`;
  code += `        log.Fatal(err)\n`;
  code += `    }\n\n`;

  // Add headers
  if (Object.keys(headers).length > 0) {
    Object.entries(headers).forEach(([key, value]) => {
      code += `    req.Header.Add("${key}", "${value}")\n`;
    });
    code += `\n`;
  }

  // Add auth
  if (request.auth) {
    code += `    req.SetBasicAuth("${request.auth.username}", "${request.auth.password}")\n\n`;
  }

  // Execute request
  code += `    res, err := http.DefaultClient.Do(req)\n`;
  code += `    if err != nil {\n`;
  code += `        log.Fatal(err)\n`;
  code += `    }\n`;
  code += `    defer res.Body.Close()\n\n`;

  code += `    body, err := io.ReadAll(res.Body)\n`;
  code += `    if err != nil {\n`;
  code += `        log.Fatal(err)\n`;
  code += `    }\n\n`;

  code += `    fmt.Println(string(body))\n`;
  code += `}\n`;

  return code;
}

export function generateGoResty(request: Request): string {
  const url = request.urls[0]?.url || '';
  const method = request.method.toLowerCase();
  const headers = request.headers;
  const body = getRequestBody(request);

  let code = `package main\n\n`;
  code += `import (\n`;
  code += `    "fmt"\n`;
  code += `    "log"\n`;
  code += `    "github.com/go-resty/resty/v2"\n`;
  code += `)\n\n`;

  code += `func main() {\n`;
  code += `    client := resty.New()\n\n`;

  // Build request chain
  let requestChain = `client.R()`;

  // Add headers
  if (Object.keys(headers).length > 0) {
    const headerMethods = Object.entries(headers)
      .map(([key, value]) => `.SetHeader("${key}", "${value}")`)
      .join('');
    requestChain += headerMethods;
  }

  // Add auth
  if (request.auth) {
    requestChain += `.SetBasicAuth("${request.auth.username}", "${request.auth.password}")`;
  }

  // Add body
  if (body) {
    if (request.json) {
      requestChain += `.SetBody(${JSON.stringify(request.json, null, 4).replace(/"/g, '`').replace(/`/g, '"')})`;
    } else {
      requestChain += `.SetBody("${body.replace(/"/g, '\\"')}")`;
    }
  }

  // Execute request
  code += `    resp, err := ${requestChain}.\n`;

  // Choose method
  const methodMap: Record<string, string> = {
    get: 'Get',
    post: 'Post',
    put: 'Put',
    patch: 'Patch',
    delete: 'Delete',
    head: 'Head',
    options: 'Options',
  };

  const restyMethod = methodMap[method] || 'Execute';
  code += `        ${restyMethod}("${url}")\n\n`;

  code += `    if err != nil {\n`;
  code += `        log.Fatal(err)\n`;
  code += `    }\n\n`;

  code += `    fmt.Println(resp.String())\n`;
  code += `}\n`;

  return code;
}

// Generate Go data handling from dataArray (based on curlconverter approach)
function generateGoDataFromDataArray(dataArray: any[]): string {
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
    code += `    var data bytes.Buffer\n`;

    dataArray.forEach((d, index) => {
      if (typeof d === 'string') {
        // Plain string data
        code += `    data.WriteString(${JSON.stringify(d)})\n`;
      } else if (d.filetype) {
        // File data
        const { filetype, filename, name } = d;

        if (filename === '-') {
          // stdin
          code += `    // Reading from stdin\n`;
          code += `    stdinData, err := ioutil.ReadAll(os.Stdin)\n`;
          code += `    if err != nil {\n        log.Fatal(err)\n    }\n`;
          if (filetype === 'urlencode' && name) {
            code += `    data.WriteString("${name}=")\n`;
            code += `    data.WriteString(url.QueryEscape(string(stdinData)))\n`;
          } else {
            code += `    data.Write(stdinData)\n`;
          }
        } else {
          // File
          code += `    // Reading file: ${filename}\n`;
          code += `    fileData, err := ioutil.ReadFile("${filename}")\n`;
          code += `    if err != nil {\n        log.Fatal(err)\n    }\n`;

          if (filetype === 'urlencode') {
            if (name) {
              code += `    data.WriteString("${name}=")\n`;
            }
            code += `    data.WriteString(url.QueryEscape(string(fileData)))\n`;
          } else if (filetype === 'data') {
            // Remove newlines for --data
            code += `    cleanData := strings.ReplaceAll(string(fileData), "\\n", "")\n`;
            code += `    cleanData = strings.ReplaceAll(cleanData, "\\r", "")\n`;
            code += `    data.WriteString(cleanData)\n`;
          } else {
            // Binary or raw data
            code += `    data.Write(fileData)\n`;
          }
        }
      }
    });

    code += `    payload := &data\n\n`;
  } else {
    // No files, simple string concatenation
    const dataStrings = dataArray.map(d =>
      typeof d === 'string' ? JSON.stringify(d) : `"${d.content || ''}"`,
    );
    code += `    payload := strings.NewReader(${dataStrings.join(' + ')})\n\n`;
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
