# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-29

### 🎉 Initial Release

#### Added
- **14 Programming Languages Support**
  - Python (Requests, HTTP Client)
  - JavaScript (Fetch API, XMLHttpRequest)
  - Node.js (HTTP, Axios, Got)
  - Go (HTTP, Resty)
  - PHP (cURL, Guzzle)
  - Java (HttpClient, OkHttp, HttpURLConnection)
  - C# (HttpClient, RestSharp)
  - Rust (Reqwest, Ureq)
  - Swift (URLSession, Alamofire)
  - Dart (HTTP, Dio)
  - Perl (LWP, HTTP::Tiny)
  - PowerShell (Invoke-WebRequest, Invoke-RestMethod)
  - Wget (Standard, Mirror)
  - cURL (Windows CMD, PowerShell)

- **Core Features**
  - Real-time cURL to code conversion
  - Multiple library variants per language
  - Tab-based variant selection UI
  - Copy to clipboard functionality
  - Browser-based processing (no server required)
  - Responsive design for all devices

- **Quick Examples**
  - GET Request
  - POST JSON
  - PUT Request
  - DELETE Request
  - Form Data (multipart/form-data)
  - Custom Headers

- **SEO Optimization**
  - Individual pages for each language (/python, /javascript, etc.)
  - Optimized meta tags and descriptions
  - Sitemap.xml with all 15 pages
  - Robots.txt for search engines
  - Structured data markup

- **UI/UX Enhancements**
  - Modern gradient design system
  - Smooth animations and transitions
  - Language selection as clickable cards
  - Code syntax highlighting
  - Loading states and error handling
  - Mobile-first responsive layout

- **Integration Features**
  - "Open in RequestBin" CTA button
  - Language parameter support in URLs
  - Clipboard integration for cURL commands

- **Developer Experience**
  - TypeScript for type safety
  - Modular generator architecture
  - Clean separation of concerns
  - Comprehensive documentation
  - MIT License for open source

#### Technical Details
- **Framework**: Astro 4.15 with React Islands
- **Styling**: Tailwind CSS 3.4
- **Deployment**: Vercel with static site generation
- **Build Size**: ~185KB (gzipped client bundle)
- **Performance**: <1s Time to Interactive

---

## [Unreleased]

### Planned Features
- [ ] More languages (Ruby, Kotlin, R, Elixir)
- [ ] Advanced cURL features (cookies, redirects, SSL options)
- [ ] Code export to files
- [ ] Share converted code via URL
- [ ] Dark mode support
- [ ] Syntax highlighting themes
- [ ] History of recent conversions
- [ ] Favorites/bookmarks system

---

[1.0.0]: https://github.com/requestbin/curlconverter/releases/tag/v1.0.0
