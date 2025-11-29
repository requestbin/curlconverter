/**
 * CtaOpenInRequestBin Component
 * 
 * Call-to-action button that integrates with RequestBin.net
 * for live HTTP request testing.
 * 
 * Workflow:
 * 1. Copy cURL command to clipboard
 * 2. Open RequestBin with target language parameter
 * 3. User can paste and test the request live
 * 
 * @component
 */
import React from 'react';
import type { TargetLang } from '../lib/languages';

interface Props {
  curl: string;
  to: TargetLang;
}

export default function CtaOpenInRequestBin({ curl, to }: Props) {
  // RequestBin.saas will accept lang param in URL
  // User can paste the cURL from clipboard
  // So we just open the curl-converter page with the language pre-selected
  const href = `https://requestbin.net/apps/curl-converter?src=curlconverter.net&lang=${to}`;
  
  const handleClick = (e: React.MouseEvent) => {
    // Copy curl to clipboard so user can paste it
    if (curl) {
      navigator.clipboard.writeText(curl);
    }
  };
  
  return (
    <a 
      className="btn" 
      href={href} 
      target="_blank" 
      rel="noreferrer"
      onClick={handleClick}
      title="Opens RequestBin Curl Converter (curl command copied to clipboard)"
    >
      Open in RequestBin
    </a>
  );
}
