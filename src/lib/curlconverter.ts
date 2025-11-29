/**
 * CurlConverter Integration
 * Based on curlconverter.com library
 */

import type { ParsedRequest } from './curlParser';

// Core types from curlconverter
export type Request = {
  urls: RequestUrl[];
  cookieFiles: any[];
  outputPath?: any;
  method: string;
  headers: Headers;
  multipartUploads?: FormParam[];
  // Legacy data for backward compatibility
  data?: LegacyDataParam[];
  // New curlconverter-style data handling
  dataArray?: DataParam[];
  isDataBinary?: boolean;
  isDataRaw?: boolean;
  dataReadsFile?: string;
  json?: any;
  query?: QueryList;
  queryDict?: QueryDict;
  auth?: AuthConfig;
  proxy?: any;
  insecure?: boolean;
  followRedirects?: boolean;
  maxRedirs?: number;
  timeout?: number;
  cookies?: any;
  compressed?: boolean;
  http2?: boolean;
  httpVersion?: string;
};

export type RequestUrl = {
  originalUrl: string;
  url: string;
  queryList?: QueryList;
  uploadFile?: string;
};

export type Headers = {
  [key: string]: string;
};

export type FormParam = {
  name: string;
  content: string;
  contentFile?: string;
  isFile?: boolean;
};

// Enhanced DataParam types based on curlconverter
export type FileParamType = 'data' | 'binary' | 'urlencode' | 'json';

export type FileDataParam = {
  filetype: FileParamType;
  name?: string;
  filename: string;
};

// For backward compatibility with existing generators
export type LegacyDataParam = {
  name?: string;
  content: string;
  isFile?: boolean;
  binary?: boolean;
  urlencode?: boolean;
};

export type DataParam = string | FileDataParam;

export type QueryList = Array<[string, string]>;
export type QueryDict = {
  [key: string]: string;
};

export type AuthConfig = {
  type: 'basic' | 'digest' | 'ntlm' | 'negotiate';
  username: string;
  password: string;
};

// Simple parser implementation (will be replaced with curlconverter)
export function parseCurlCommand(command: string): { request?: Request; error?: string } {
  try {
    // Normalize command
    const normalized = command.trim()
      .replace(/\\\s*\n\s*/g, ' ') // Unix style
      .replace(/\^\s*\n\s*/g, ' '); // Windows style

    // Basic validation
    if (!normalized.toLowerCase().startsWith('curl')) {
      return { error: 'Command must start with "curl" or "curl.exe"' };
    }

    // Simple tokenizer for now
    const tokens = tokenizeCommand(normalized);
    const request = parseTokens(tokens);

    return { request };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Parse error' };
  }
}

function tokenizeCommand(command: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';
  let escapeNext = false;

  for (let i = 0; i < command.length; i++) {
    const char = command[i];

    if (escapeNext) {
      current += char;
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      escapeNext = true;
      continue;
    }

    if (!inQuotes && (char === '"' || char === '\'')) {
      inQuotes = true;
      quoteChar = char;
      continue;
    }

    if (inQuotes && char === quoteChar) {
      inQuotes = false;
      quoteChar = '';
      continue;
    }

    if (!inQuotes && char && /\s/.test(char)) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      continue;
    }

    current += char;
  }

  if (current) {
    tokens.push(current);
  }

  return tokens;
}

function parseTokens(tokens: string[]): Request {
  // Debug: Log tokens for debugging
  console.log('🔍 Tokenized command:', tokens);

  const request: Request = {
    urls: [],
    cookieFiles: [],
    method: 'GET',
    headers: {},
  };

  let explicitMethod = false; // Track if method was explicitly set
  let hasData = false; // Track if any data was provided

  let i = 1; // Skip 'curl'

  while (i < tokens.length) {
    const token = tokens[i];

    if (token?.startsWith('-')) {
      if (token === '-X' || token === '--request') {
        request.method = tokens[++i] || 'GET';
        explicitMethod = true;
      } else if (token === '-H' || token === '--header') {
        const header = tokens[++i];
        if (header) {
          const [key, ...valueParts] = header.split(':');
          if (key && valueParts.length > 0) {
            request.headers[key.trim()] = valueParts.join(':').trim();
          }
        }
      } else if (token === '-d' || token === '--data' || token === '--data-raw' || token === '--data-ascii') {
        const data = tokens[++i];
        if (data) {
          // Initialize arrays
          if (!request.data) {
            request.data = [];
          }
          if (!request.dataArray) {
            request.dataArray = [];
          }

          const isFile = data.startsWith('@');

          // Legacy data for backward compatibility
          request.data.push({
            content: isFile ? data.substring(1) : data,
            isFile,
          });

          // New curlconverter-style data
          if (isFile) {
            const filename = data.substring(1);
            request.dataArray.push({
              filetype: 'data',
              filename,
            });
            request.dataReadsFile = filename;
          } else {
            request.dataArray.push(data);
          }

          hasData = true;
        }
      } else if (token === '--data-binary') {
        const data = tokens[++i];
        if (data) {
          // Initialize arrays
          if (!request.data) {
            request.data = [];
          }
          if (!request.dataArray) {
            request.dataArray = [];
          }

          const isFile = data.startsWith('@');

          // Legacy data for backward compatibility
          request.data.push({
            content: isFile ? data.substring(1) : data,
            isFile,
            binary: true,
          });

          // New curlconverter-style data
          if (isFile) {
            const filename = data.substring(1);
            request.dataArray.push({
              filetype: 'binary',
              filename,
            });
            request.dataReadsFile = filename;
          } else {
            request.dataArray.push(data);
          }

          request.isDataBinary = true;
          hasData = true;
        }
      } else if (token === '--data-urlencode') {
        const data = tokens[++i];
        console.log('🔍 Processing --data-urlencode:', data);
        if (data) {
          if (!request.data) {
            request.data = [];
          }

          // Handle different formats:
          // 1. name=@filename (file upload with field name)
          // 2. @filename (file upload without field name)
          // 3. name@- (stdin with field name - special case)
          // 4. name=value (regular form data)
          // 5. value (just data)

          const [name, value] = data.split('=');
          console.log('🔍 Split result:', { name, value, fullData: data });

          // Initialize arrays
          if (!request.data) {
            request.data = [];
          }
          if (!request.dataArray) {
            request.dataArray = [];
          }

          if (value && value.startsWith('@')) {
            // Format: name=@filename
            console.log('🔍 Case: name=@filename');
            const filename = value.substring(1);

            // Legacy data for backward compatibility
            request.data.push({
              content: filename,
              isFile: true,
              name,
              urlencode: true,
            });

            // New curlconverter-style data
            request.dataArray.push({
              filetype: 'urlencode',
              name,
              filename,
            });
            request.dataReadsFile = filename;
          } else if (data.startsWith('@')) {
            // Format: @filename
            console.log('🔍 Case: @filename');
            const filename = data.substring(1);

            // Legacy data for backward compatibility
            request.data.push({
              content: filename,
              isFile: true,
              urlencode: true,
            });

            // New curlconverter-style data
            request.dataArray.push({
              filetype: 'urlencode',
              filename,
            });
            request.dataReadsFile = filename;
          } else if (data.includes('@') && !data.includes('=')) {
            // Special case: name@- or similar (stdin/pipe format)
            console.log('🔍 Case: name@stdin format');
            const atIndex = data.indexOf('@');
            const fieldName = data.substring(0, atIndex);
            const source = data.substring(atIndex + 1);

            // Legacy data for backward compatibility
            request.data.push({
              content: source,
              name: fieldName || undefined,
              isFile: source !== '-', // '-' means stdin, not a file
              urlencode: true,
            });

            // New curlconverter-style data
            if (source === '-') {
              // stdin - treat as string for now
              request.dataArray.push(`${fieldName}@-`);
            } else {
              request.dataArray.push({
                filetype: 'urlencode',
                name: fieldName,
                filename: source,
              });
              request.dataReadsFile = source;
            }
          } else {
            // Format: name=value or just value
            console.log('🔍 Case: name=value or plain value');

            // Legacy data for backward compatibility
            request.data.push({
              content: data,
              urlencode: true,
            });

            // New curlconverter-style data
            request.dataArray.push(data);
          }
          hasData = true;
        }
      } else if (token === '--json') {
        const jsonData = tokens[++i];
        if (jsonData) {
          try {
            request.json = JSON.parse(jsonData);
          } catch {
            // Invalid JSON, treat as string
            request.json = jsonData;
          }
          // --json implies POST unless method explicitly set
          if (!explicitMethod) {
            request.method = 'POST';
          }
          request.headers['Content-Type'] = 'application/json';
          hasData = true;
        }
      } else if (token === '-u' || token === '--user') {
        const auth = tokens[++i];
        if (auth) {
          const [username, password] = auth.split(':', 2);
          request.auth = {
            type: 'basic',
            username: username || '',
            password: password || '',
          };
        }
      } else if (token === '-F' || token === '--form') {
        const formData = tokens[++i];
        if (formData) {
          if (!request.multipartUploads) {
            request.multipartUploads = [];
          }
          const [name, content] = formData.split('=', 2);
          const isFile = content?.startsWith('@') || content?.startsWith('<');
          request.multipartUploads.push({
            name: name || '',
            content: isFile ? content?.substring(1) || '' : content || '',
            isFile,
            contentFile: isFile ? content?.substring(1) : undefined,
          });
          hasData = true;
        }
      } else if (token === '--form-string') {
        const formData = tokens[++i];
        if (formData) {
          if (!request.multipartUploads) {
            request.multipartUploads = [];
          }
          const [name, content] = formData.split('=', 2);
          request.multipartUploads.push({
            name: name || '',
            content: content || '',
            isFile: false,
          });
          hasData = true;
        }
      } else if (token === '--compressed') {
        request.compressed = true;
      }
    } else if (token) {
      // Assume it's a URL
      request.urls.push({
        originalUrl: token,
        url: token,
      });
    }

    i++;
  }

  // Auto-detect POST method if data provided and method not explicitly set
  if (hasData && !explicitMethod && request.method === 'GET') {
    request.method = 'POST';
  }

  return request;
}

// Convert curlconverter Request to our ParsedRequest format
export function convertToParseRequest(request: Request): ParsedRequest {
  const url = request.urls[0]?.url || '';

  return {
    method: request.method,
    url,
    headers: request.headers,
    body: getRequestBody(request),
    auth: request.auth
      ? {
          type: request.auth.type === 'basic' ? 'basic' : 'bearer',
          credentials: `${request.auth.username}:${request.auth.password}`,
        }
      : undefined,
  };
}

function getRequestBody(request: Request): string | undefined {
  if (request.json) {
    return typeof request.json === 'string' ? request.json : JSON.stringify(request.json);
  }

  if (request.data && request.data.length > 0) {
    return request.data.map(d => d.content).join('&');
  }

  return undefined;
}
