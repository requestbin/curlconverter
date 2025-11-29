/**
 * ConverterIsland Component
 * 
 * Main converter UI that handles cURL input and code generation.
 * Uses Astro Islands architecture for interactive React component.
 * 
 * Features:
 * - Real-time cURL parsing and code generation
 * - Support for 14+ programming languages
 * - Multiple library variants per language
 * - Quick examples for common HTTP methods
 * - Copy to clipboard functionality
 * - RequestBin integration
 * 
 * @component
 */
import React, { useEffect, useState } from 'react';
import { TARGETS, type TargetLang } from '../lib/languages';
import { EXAMPLE_CURL, QUICK_EXAMPLES } from '../lib/examples';
import CtaOpenInRequestBin from './CtaOpenInRequestBin';
import { parseCurlCommand } from '../lib/curlconverter';
import {
  getJavaScriptGenerators,
  getPythonGenerators,
  getNodejsGenerators,
  getGoGenerators,
  getPhpGenerators,
  getJavaGenerators,
  getCSharpGenerators,
  getCurlGenerators,
  getRustGenerators,
  getSwiftGenerators,
  getDartGenerators,
  getPerlGenerators,
  getPowerShellGenerators,
  getWgetGenerators,
} from '../lib/generators';

interface Props {
  defaultLang?: TargetLang;
}

export default function ConverterIsland({ defaultLang = 'python' }: Props) {
  const [curl, setCurl] = useState(EXAMPLE_CURL);
  const [selectedLang, setSelectedLang] = useState<TargetLang>(defaultLang);
  const [variants, setVariants] = useState<Record<string, any>>({});
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Auto-convert when language or curl changes
  useEffect(() => {
    const convert = async () => {
      if (!curl.trim()) {
        setCode('');
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Parse cURL command
        const result = parseCurlCommand(curl);
        
        if (result.error || !result.request) {
          setError(result.error || 'Failed to parse cURL command');
          setCode('');
          setVariants({});
          setLoading(false);
          return;
        }

        // Get generators for selected language
        let generators: Record<string, any> = {};
        
        switch (selectedLang) {
          case 'javascript':
            generators = await getJavaScriptGenerators();
            break;
          case 'python':
            generators = await getPythonGenerators();
            break;
          case 'php':
            generators = await getPhpGenerators();
            break;
          case 'nodejs':
            generators = await getNodejsGenerators();
            break;
          case 'go':
            generators = await getGoGenerators();
            break;
          case 'java':
            generators = await getJavaGenerators();
            break;
          case 'csharp':
            generators = await getCSharpGenerators();
            break;
          case 'curl':
            generators = await getCurlGenerators();
            break;
          case 'rust':
            generators = await getRustGenerators();
            break;
          case 'swift':
            generators = await getSwiftGenerators();
            break;
          case 'dart':
            generators = await getDartGenerators();
            break;
          case 'perl':
            generators = await getPerlGenerators();
            break;
          case 'powershell':
            generators = await getPowerShellGenerators();
            break;
          case 'wget':
            generators = await getWgetGenerators();
            break;
        }

        setVariants(generators);

        // Generate code using first variant
        const variantNames = Object.keys(generators);
        if (variantNames.length > 0) {
          const firstVariant = generators[variantNames[0]];
          const generatedCode = firstVariant(result.request);
          setCode(generatedCode);
          setSelectedVariant(0);
        }

        setLoading(false);
      } catch (err: any) {
        setError(err?.message || 'Conversion failed');
        setCode('');
        setVariants({});
        setLoading(false);
      }
    };

    const timer = setTimeout(convert, 300); // Debounce
    return () => clearTimeout(timer);
  }, [curl, selectedLang]);

  // Handle variant change
  useEffect(() => {
    const variantNames = Object.keys(variants);
    if (variantNames.length > 0 && variants[variantNames[selectedVariant]]) {
      try {
        const result = parseCurlCommand(curl);
        if (result.request) {
          const generator = variants[variantNames[selectedVariant]];
          const generatedCode = generator(result.request);
          setCode(generatedCode);
        }
      } catch (err) {
        // Ignore
      }
    }
  }, [selectedVariant, variants, curl]);

  const copy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const variantNames = Object.keys(variants);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
      {/* Left Panel - Input */}
      <div className="space-y-6">
        {/* cURL Input */}
        <div className="card">
          <label className="label mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd"/>
            </svg>
            Paste Your cURL Command
          </label>
          <textarea
            className="input min-h-[280px] resize-y"
            value={curl}
            onChange={(e) => setCurl(e.target.value)}
            placeholder="curl -X GET https://api.example.com/users -H 'Authorization: Bearer token'"
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <CtaOpenInRequestBin curl={curl} to={selectedLang} />
          </div>
        </div>

        {/* Language Selection - Now as Links */}
        <div className="card">
          <label className="label mb-3">Select Target Language</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TARGETS.map((target) => (
              <a
                key={target.value}
                href={`/${target.value}`}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedLang(target.value);
                }}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all ${
                  selectedLang === target.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
                }`}
              >
                <span className="text-lg">{target.icon}</span>
                <span className="text-sm">{target.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Quick Examples */}
        <div className="card">
          <label className="label mb-3">Quick Examples</label>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_EXAMPLES.map((example) => (
              <button
                key={example.name}
                onClick={() => setCurl(example.curl)}
                className="flex flex-col items-start px-3 py-2.5 rounded-lg border border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    example.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                    example.method === 'POST' ? 'bg-green-100 text-green-700' :
                    example.method === 'PUT' ? 'bg-amber-100 text-amber-700' :
                    example.method === 'DELETE' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {example.method}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                  {example.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Output */}
      <div>
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <label className="label flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
              Generated Code
              {loading && (
                <span className="ml-2 flex items-center gap-1 text-blue-600 text-xs font-normal">
                  <span className="inline-block w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="inline-block w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="inline-block w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </span>
              )}
            </label>
            <div className="flex gap-2">
              <button
                className="btn text-xs"
                onClick={copy}
                disabled={!code || loading}
                title="Copy to clipboard"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Library/Variant Tabs */}
          {variantNames.length > 1 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {variantNames.map((name, index) => (
                <button
                  key={name}
                  onClick={() => setSelectedVariant(index)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedVariant === index
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          {/* Code Output */}
          <div className="code-block min-h-[320px] relative">
            {error ? (
              <div className="flex items-start gap-3 text-red-400">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                <div>
                  <div className="font-semibold mb-1">Conversion Error</div>
                  <div className="text-sm opacity-90">{error}</div>
                </div>
              </div>
            ) : code ? (
              <pre className="text-slate-100 text-sm leading-relaxed overflow-x-auto"><code>{code}</code></pre>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                  </svg>
                  <p>Your converted code will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
