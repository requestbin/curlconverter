/**
 * Code Generators Index
 * Dynamic imports for all generators
 */

import type { Request } from '../curlconverter';

// Generator type definition
export type CodeGenerator = (request: Request) => string;

// Generator implementations
export async function getJavaScriptGenerators() {
  const { generateJavaScriptFetch, generateJavaScriptXHR } = await import('./javascript');
  return {
    'Fetch API': generateJavaScriptFetch,
    'XMLHttpRequest': generateJavaScriptXHR,
  };
}

export async function getPythonGenerators() {
  const { generatePythonHttpClient, generatePythonRequests } = await import('./python');
  return {
    'Requests': generatePythonRequests,
    'HTTP Client': generatePythonHttpClient,
  };
}

export async function getPhpGenerators() {
  const { generatePhpCurl, generatePhpGuzzle } = await import('./php');
  return {
    cURL: generatePhpCurl,
    Guzzle: generatePhpGuzzle,
  };
}

export async function getNodejsGenerators() {
  const { generateNodeJsHttp, generateNodeJsAxios, generateNodeJsGot } = await import('./nodejs');
  return {
    'Native HTTP': generateNodeJsHttp,
    'Axios': generateNodeJsAxios,
    'Got': generateNodeJsGot,
  };
}

export async function getGoGenerators() {
  const { generateGoHttp, generateGoResty } = await import('./go');
  return {
    HTTP: generateGoHttp,
    Resty: generateGoResty,
  };
}

export async function getJavaGenerators() {
  const { generateJavaHttpClient, generateJavaOkHttp, generateJavaHttpUrlConnection } = await import('./java');
  return {
    HttpClient: generateJavaHttpClient,
    OkHttp: generateJavaOkHttp,
    HttpURLConnection: generateJavaHttpUrlConnection,
  };
}

export async function getCSharpGenerators() {
  const { generateCSharpHttpClient, generateCSharpRestSharp } = await import('./csharp');
  return {
    HttpClient: generateCSharpHttpClient,
    RestSharp: generateCSharpRestSharp,
  };
}

export async function getPerlGenerators() {
  const { generatePerlLWP, generatePerlHTTPTiny } = await import('./perl');
  return {
    LWP: generatePerlLWP,
    HTTPTiny: generatePerlHTTPTiny,
  };
}

export async function getPowerShellGenerators() {
  const { generatePowerShellInvokeWebRequest, generatePowerShellInvokeRestMethod } = await import('./powershell');
  return {
    WebRequest: generatePowerShellInvokeWebRequest,
    RestMethod: generatePowerShellInvokeRestMethod,
  };
}

export async function getWgetGenerators() {
  const { generateWget, generateWgetMirror } = await import('./wget');
  return {
    Standard: generateWget,
    Mirror: generateWgetMirror,
  };
}

export async function getDartGenerators() {
  const { generateDartHttp, generateDartDio } = await import('./dart');
  return {
    HTTP: generateDartHttp,
    Dio: generateDartDio,
  };
}

export async function getSwiftGenerators() {
  const { generateSwiftURLSession, generateSwiftAlamofire } = await import('./swift');
  return {
    URLSession: generateSwiftURLSession,
    Alamofire: generateSwiftAlamofire,
  };
}

export async function getRustGenerators() {
  const { generateRustReqwest, generateRustUreq } = await import('./rust');
  return {
    Reqwest: generateRustReqwest,
    Ureq: generateRustUreq,
  };
}

export async function getCurlGenerators() {
  const { generateCurlPowerShell, generateCurlWindows } = await import('./curl');
  return {
    'Windows CMD': generateCurlWindows,
    'PowerShell': generateCurlPowerShell,
  };
}

// Generator factory
export async function getGenerators(language: string): Promise<Record<string, CodeGenerator> | null> {
  switch (language) {
    case 'curl':
      return await getCurlGenerators();
    case 'javascript':
      return await getJavaScriptGenerators();
    case 'python':
      return await getPythonGenerators();
    case 'php':
      return await getPhpGenerators();
    case 'nodejs':
      return await getNodejsGenerators();
    case 'go':
      return await getGoGenerators();
    case 'java':
      return await getJavaGenerators();
    case 'csharp':
      return await getCSharpGenerators();
    case 'perl':
      return await getPerlGenerators();
    case 'powershell':
      return await getPowerShellGenerators();
    case 'wget':
      return await getWgetGenerators();
    case 'dart':
      return await getDartGenerators();
    case 'swift':
      return await getSwiftGenerators();
    case 'rust':
      return await getRustGenerators();
    default:
      return null;
  }
}

// Supported languages
export const supportedLanguages = [
  'curl',
  'javascript',
  'python',
  'php',
  'nodejs',
  'go',
  'java',
  'csharp',
  'perl',
  'powershell',
  'wget',
  'dart',
  'swift',
  'rust',
] as const;
export type GeneratorLanguage = typeof supportedLanguages[number];
