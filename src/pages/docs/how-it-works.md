---
layout: ../../layouts/DocsLayout.astro
title: "How It Works"
description: "Understanding how cURL Converter parses cURL commands and generates production-ready code across 14+ programming languages."
---

# How It Works

cURL Converter is a **100% client-side tool** that transforms cURL commands into production-ready code in 14+ programming languages. Everything happens in your browser - no data is ever sent to our servers.

## The Conversion Process

### 1. Parse cURL Command

When you paste a cURL command, our parser analyzes it to extract:

- **URL** - The target endpoint
- **HTTP Method** - GET, POST, PUT, DELETE, etc.
- **Headers** - Content-Type, Authorization, custom headers
- **Request Body** - JSON data, form data, or raw content
- **Authentication** - Bearer tokens, Basic auth, API keys
- **Query Parameters** - URL parameters

### 2. Generate Language-Specific Code

Once parsed, the converter generates idiomatic code for your chosen language:

```bash
# Input cURL
curl -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John"}'
```

```python
# Output Python (Requests)
import requests

url = "https://api.example.com/users"
headers = {"Content-Type": "application/json"}
data = {"name": "John"}

response = requests.post(url, headers=headers, json=data)
```

### 3. Multiple Library Variants

For each language, we support multiple popular HTTP libraries:

- **Python:** Requests, HTTP Client
- **JavaScript:** Fetch API, XMLHttpRequest
- **Node.js:** HTTP, Axios, Got
- **Java:** HttpClient, OkHttp, HttpURLConnection
- And many more...

## Privacy & Security

### Client-Side Processing

All parsing and code generation happens **entirely in your browser**:

- ✅ Your cURL commands **never leave your computer**
- ✅ No server-side processing or logging
- ✅ No data collection or tracking
- ✅ Works offline after initial page load
- ✅ Safe for sensitive API keys and tokens

### Open Source

The converter is built on [curlconverter](https://github.com/curlconverter/curlconverter) - an open-source project with:

- 🔍 Transparent code review
- 🛡️ Community-vetted security
- 📝 Regular updates and improvements

## Technical Stack

- **Parser**: Custom cURL command parser
- **Generators**: Language-specific code templates
- **Runtime**: 100% client-side JavaScript
- **Framework**: Astro (static site generation)

## Supported cURL Flags

We support the most common cURL flags:

| Flag | Description | Example |
|------|-------------|---------|
| `-X, --request` | HTTP method | `-X POST` |
| `-H, --header` | Custom header | `-H "Authorization: Bearer token"` |
| `-d, --data` | Request body | `-d '{"key":"value"}'` |
| `-F, --form` | Form data | `-F "file=@photo.jpg"` |
| `-u, --user` | Basic auth | `-u username:password` |
| `-b, --cookie` | Cookie | `-b "session=abc123"` |
| `-A, --user-agent` | User agent | `-A "MyApp/1.0"` |

## Limitations

- Some advanced cURL flags may not be supported
- Complex shell variables are not evaluated
- File paths are converted to placeholders

## Try It Yourself

[Open the converter](/) to see it in action, or use [RequestBin](https://requestbin.net/apps/curl-converter) for advanced features like testing with real endpoints.

---

**Related docs:** [Headers & JSON](/docs/headers-and-json-body/) | [Python](/docs/convert-curl-to-python/) | [JavaScript](/docs/convert-curl-to-javascript/)
