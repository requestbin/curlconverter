# 🔄 cURL Converter

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/requestbin/curlconverter)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Astro](https://img.shields.io/badge/Astro-4.15-blueviolet)](https://astro.build)
[![GitHub stars](https://img.shields.io/github/stars/requestbin/curlconverter?style=social)](https://github.com/requestbin/curlconverter)

**Convert cURL commands to code in 14+ programming languages** - Fast, secure, and runs entirely in your browser. No server-side processing, no data collection.

🌐 **Live Demo:** [curlconverter.net](https://curlconverter.net)

---

## ✨ Features

- 🚀 **14+ Languages Supported** - Python, JavaScript, Node.js, Go, PHP, Java, C#, Rust, Swift, Dart, Perl, PowerShell, Wget, and cURL formatter
- 📦 **Multiple Library Variants** - Each language supports multiple popular HTTP libraries (e.g., Python: Requests & HTTP Client)
- 🎨 **Modern UI/UX** - Clean, professional design with gradient accents and smooth animations
- ⚡ **Instant Conversion** - Real-time code generation with 300ms debounce
- 🔒 **100% Client-Side** - All processing happens in your browser, no data sent to servers
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🎯 **Quick Examples** - Pre-built examples for GET, POST, PUT, DELETE, Form Data, and Custom Headers
- 🔗 **SEO Optimized** - Individual pages for each language (/python, /javascript, etc.)
- 🎪 **RequestBin Integration** - One-click "Open in RequestBin" for live testing

---

## 🎯 Supported Languages & Libraries

| Language | Libraries/Variants |
|----------|-------------------|
| **Python** | Requests, HTTP Client |
| **JavaScript** | Fetch API, XMLHttpRequest |
| **Node.js** | Native HTTP, Axios, Got |
| **Go** | HTTP, Resty |
| **PHP** | cURL, Guzzle |
| **Java** | HttpClient, OkHttp, HttpURLConnection |
| **C#** | HttpClient, RestSharp |
| **Rust** | Reqwest, Ureq |
| **Swift** | URLSession, Alamofire |
| **Dart** | HTTP, Dio |
| **Perl** | LWP, HTTP::Tiny |
| **PowerShell** | Invoke-WebRequest, Invoke-RestMethod |
| **Wget** | Standard, Mirror |
| **cURL** | Windows CMD, PowerShell |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- Modern web browser

### Installation

```bash
# Clone the repository
git clone https://github.com/requestbin/curlconverter.git
cd curlconverter

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:4321`

### Build for Production

```bash
# Build static site
npm run build

# Preview production build
npm run preview
```

---

## 📁 Project Structure

```
curlconverter-net/
├── src/
│   ├── components/
│   │   ├── ConverterIsland.tsx    # Main converter UI (React island)
│   │   └── CtaOpenInRequestBin.tsx # RequestBin integration
│   ├── lib/
│   │   ├── generators/             # Code generators for all languages
│   │   │   ├── index.ts
│   │   │   ├── python.ts
│   │   │   ├── javascript.ts
│   │   │   └── ... (14 generators)
│   │   ├── curlconverter.ts        # cURL parser
│   │   ├── languages.ts            # Language metadata
│   │   └── examples.ts             # Quick example templates
│   ├── pages/
│   │   ├── _layout.astro           # Global layout
│   │   ├── index.astro             # Homepage
│   │   ├── python.astro            # Language-specific pages
│   │   ├── javascript.astro
│   │   └── ... (14 language pages)
│   └── styles/
│       └── global.css              # Global styles + Tailwind
├── public/
│   ├── robots.txt
│   └── sitemap.xml
├── astro.config.mjs                # Astro configuration
├── tailwind.config.cjs             # Tailwind CSS config
└── package.json
```

---

## 🛠️ Tech Stack

- **[Astro](https://astro.build)** - Static Site Generator with Islands architecture
- **[React](https://react.dev)** - Interactive UI components
- **[TypeScript](https://www.typescriptlang.org)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first styling
- **[Vercel](https://vercel.com)** - Deployment platform

---

## 🎨 Design Philosophy

### Browser-First Processing
All cURL parsing and code generation happens entirely in the browser using TypeScript. No backend servers, no API calls, no data collection.

### SEO-Friendly Architecture
Each programming language has a dedicated page (`/python`, `/javascript`, etc.) with optimized meta tags and structured content for better search engine visibility.

### Modern UX Patterns
- **Tab-based Variants** - Switch between library implementations seamlessly
- **Quick Examples** - Pre-built examples for common HTTP methods
- **Real-time Conversion** - Instant feedback with debounced updates
- **Copy to Clipboard** - One-click code copying
- **Responsive Layout** - Mobile-first design principles

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Adding a New Language

1. Create generator in `src/lib/generators/yourlang.ts`:
```typescript
import type { Request } from '../curlconverter';

export function generateYourLangLibrary1(request: Request): string {
  // Implementation
  return `// Generated code`;
}

export function generateYourLangLibrary2(request: Request): string {
  // Alternative library implementation
  return `// Generated code`;
}
```

2. Export generators in `src/lib/generators/index.ts`:
```typescript
export async function getYourLangGenerators() {
  const { generateYourLangLibrary1, generateYourLangLibrary2 } = await import('./yourlang');
  return {
    'Library 1': generateYourLangLibrary1,
    'Library 2': generateYourLangLibrary2,
  };
}
```

3. Add language metadata to `src/lib/languages.ts`:
```typescript
export const TARGETS = [
  // ... existing languages
  { value: 'yourlang', label: 'Your Language', icon: '🔷' },
] as const;
```

4. Create language-specific page `src/pages/yourlang.astro`

5. Update sitemap.xml with new URL

### Development Guidelines

- Use TypeScript for type safety
- Follow existing code structure and naming conventions
- Test generators with various cURL commands
- Ensure responsive design on mobile devices
- Add JSDoc comments for public functions

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Inspired by the original [curlconverter](https://github.com/curlconverter/curlconverter) project
- Built with ❤️ for the developer community
- Part of the [RequestBin](https://requestbin.net) ecosystem

---

## 🔗 Related Projects

- **[RequestBin](https://requestbin.net)** - Inspect HTTP requests with custom endpoints

---

## 📧 Support

- 🐛 **Issues:** [GitHub Issues](https://github.com/requestbin/curlconverter/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/requestbin/curlconverter/discussions)
- 🌐 **Website:** [curlconverter.net](https://curlconverter.net)

---

<div align="center">

**Made with ☕ and ⚡ by the RequestBin Team**

[Website](https://curlconverter.net) • [RequestBin](https://requestbin.net) • [Report Bug](https://github.com/requestbin/curlconverter/issues)

</div>
