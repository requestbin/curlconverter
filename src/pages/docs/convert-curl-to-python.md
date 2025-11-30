---
layout: ../../layouts/DocsLayout.astro
title: "Convert cURL to Python"
description: "Learn how to convert cURL commands to Python code using Requests library or HTTP client. Complete guide with examples."
---

# Convert cURL to Python

Transform cURL commands into production-ready Python code instantly. Our converter supports both the popular **Requests** library and Python's built-in **HTTP client**.

## Quick Example

Convert this cURL command:

```bash
curl -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"John Doe","email":"john@example.com"}'
```

Into Python (Requests):

```python
import requests

url = "https://api.example.com/users"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_TOKEN"
}
data = {
    "name": "John Doe",
    "email": "john@example.com"
}

response = requests.post(url, headers=headers, json=data)
```

## Why Use Python Requests?

- ✅ **Simple & Pythonic** - Clean, readable syntax
- ✅ **Battle-tested** - 50M+ downloads/month
- ✅ **Feature-rich** - Sessions, cookies, auth built-in
- ✅ **JSON support** - Automatic encoding/decoding

## Common Use Cases

### GET Request with Query Parameters

```bash
curl "https://api.example.com/search?q=python&limit=10"
```

Converts to:

```python
import requests

url = "https://api.example.com/search"
params = {
    "q": "python",
    "limit": "10"
}

response = requests.get(url, params=params)
```

### File Upload

```bash
curl -X POST https://api.example.com/upload \
  -F "file=@document.pdf" \
  -F "category=reports"
```

Converts to:

```python
import requests

url = "https://api.example.com/upload"
files = {
    'file': open('document.pdf', 'rb')
}
data = {
    'category': 'reports'
}

response = requests.post(url, files=files, data=data)
```

## Try It Live

[Open the converter](/python) to transform your cURL commands, or use [RequestBin's advanced converter](https://requestbin.net/apps/curl-converter) to test the generated code with real HTTP endpoints.

---

**Related docs:** [JavaScript](/docs/convert-curl-to-javascript/) | [Node.js](/docs/convert-curl-to-nodejs/) | [How It Works](/docs/how-it-works/)
