# Contributing to cURL Converter

Thank you for your interest in contributing! 🎉

## 🚀 Quick Start

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/curlconverter.git`
3. **Install** dependencies: `npm install`
4. **Create** a branch: `git checkout -b feature/your-feature`
5. **Make** your changes
6. **Test** locally: `npm run dev`
7. **Build** to verify: `npm run build`
8. **Commit** your changes: `git commit -m "feat: add your feature"`
9. **Push** to your fork: `git push origin feature/your-feature`
10. **Create** a Pull Request

---

## 📋 Development Guidelines

### Code Style

- Use **TypeScript** for all new code
- Follow **existing code patterns** and naming conventions
- Add **JSDoc comments** for public functions
- Use **meaningful variable names**
- Keep functions **small and focused**

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add Python asyncio generator
fix: correct header parsing for multipart forms
docs: update README with new examples
refactor: simplify cURL parser logic
test: add test cases for Go generator
```

### Testing

Before submitting a PR:

1. Test with various cURL commands (GET, POST, headers, auth, etc.)
2. Verify responsive design on mobile/tablet/desktop
3. Ensure build succeeds: `npm run build`
4. Check TypeScript types: `npm run check`

---

## 🎯 Adding a New Language

### 1. Create Generator File

Create `src/lib/generators/yourlang.ts`:

```typescript
import type { Request } from '../curlconverter';

/**
 * Generate YourLang code using Library1
 */
export function generateYourLangLibrary1(request: Request): string {
  const { url, method = 'GET', headers, data } = request;
  
  let code = `// YourLang - Library1\n`;
  code += `import library1;\n\n`;
  
  // Add method and URL
  code += `const response = library1.${method.toLowerCase()}("${url}"`;
  
  // Add headers if present
  if (headers && Object.keys(headers).length > 0) {
    code += `, {\n  headers: {\n`;
    for (const [key, value] of Object.entries(headers)) {
      code += `    "${key}": "${value}",\n`;
    }
    code += `  }`;
  }
  
  // Add body if present
  if (data) {
    code += `,\n  body: ${JSON.stringify(data)}`;
  }
  
  code += `\n});\n`;
  return code;
}

/**
 * Generate YourLang code using Library2 (alternative)
 */
export function generateYourLangLibrary2(request: Request): string {
  // Alternative implementation
  return `// YourLang - Library2 implementation`;
}
```

### 2. Register Generators

Add to `src/lib/generators/index.ts`:

```typescript
export async function getYourLangGenerators() {
  const { generateYourLangLibrary1, generateYourLangLibrary2 } = await import('./yourlang');
  return {
    'Library1': generateYourLangLibrary1,
    'Library2': generateYourLangLibrary2,
  };
}

// Add to factory function
export async function getGenerators(language: string): Promise<Record<string, CodeGenerator> | null> {
  switch (language) {
    // ... existing cases
    case 'yourlang':
      return await getYourLangGenerators();
    default:
      return null;
  }
}

// Add to supported languages
export const supportedLanguages = [
  // ... existing languages
  'yourlang',
] as const;
```

### 3. Add Language Metadata

Update `src/lib/languages.ts`:

```typescript
export const TARGETS = [
  // ... existing languages
  { value: 'yourlang', label: 'YourLang', icon: '🔷' },
] as const;

export type TargetLang = 
  | 'python'
  | 'javascript'
  // ... existing types
  | 'yourlang';
```

### 4. Create Language Page

Create `src/pages/yourlang.astro`:

```astro
---
import Layout from './_layout.astro';
import ConverterIsland from '../components/ConverterIsland';
import { TARGETS } from '../lib/languages';

const lang = TARGETS.find(t => t.value === 'yourlang');
---
<Layout
  title={`Free cURL to ${lang?.label} Converter - Online Tool | CurlConverter.net`}
  description={`Convert cURL commands to ${lang?.label} code (Library1, Library2). Fast, secure, browser-based converter.`}
  ogTitle={`Free cURL to ${lang?.label} Converter`}
>
  <section class="text-center mb-12 md:mb-16">
    <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
      <span class="text-xl">{lang?.icon}</span>
      {lang?.label} Code Generator
    </div>
    
    <h1 class="heading mb-6">
      Convert cURL to <span class="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">{lang?.label}</span>
    </h1>
    <p class="subtle max-w-2xl mx-auto mb-8">
      Transform cURL commands into production-ready {lang?.label} code.
      Fast, secure, and runs entirely in your browser.
    </p>
  </section>

  <ConverterIsland client:load defaultLang="yourlang" />

  <section class="mt-12 text-center">
    <a href="/" class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
      ← Convert to other languages
    </a>
  </section>
</Layout>
```

### 5. Update Sitemap

Add to `public/sitemap.xml`:

```xml
<url>
  <loc>https://curlconverter.net/yourlang</loc>
  <lastmod>2025-11-29</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>
```

### 6. Update ConverterIsland

Add case to `src/components/ConverterIsland.tsx`:

```typescript
case 'yourlang':
  generators = await getYourLangGenerators();
  break;
```

---

## 🐛 Reporting Bugs

When reporting bugs, please include:

- **Description** of the issue
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **cURL command** that caused the issue (if applicable)
- **Browser & OS** information
- **Screenshots** (if relevant)

---

## 💡 Feature Requests

We welcome feature suggestions! Please:

1. Check if the feature already exists or is requested
2. Provide clear use cases
3. Explain why it would benefit users
4. Include example implementations (if applicable)

---

## 📝 Documentation

Improvements to documentation are always welcome:

- Fix typos and grammar
- Add examples
- Clarify explanations
- Add missing information
- Improve README structure

---

## ❓ Questions

Have questions? Feel free to:

- Open a [GitHub Discussion](https://github.com/requestbin/curlconverter/discussions)
- Check existing [Issues](https://github.com/requestbin/curlconverter/issues)
- Review the [README](README.md)

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for making cURL Converter better! 🚀
