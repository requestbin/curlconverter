---
layout: ../../layouts/DocsLayout.astro
title: "Convert cURL to JavaScript"
description: "Convert cURL commands to JavaScript Fetch API or XMLHttpRequest. Browser-ready code for frontend applications."
---

# Convert cURL to JavaScript

Generate browser-ready JavaScript code from cURL commands. Supports both modern **Fetch API** and legacy **XMLHttpRequest** for maximum compatibility.

## Quick Example

Convert this cURL command:

```bash
curl -X GET https://api.example.com/users/123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Into JavaScript (Fetch):

```javascript
fetch('https://api.example.com/users/123', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
})
  .then(response => response.json())
  .then(data => console.log(data));
```

## Fetch vs XMLHttpRequest

| Feature | Fetch API | XMLHttpRequest |
|---------|-----------|----------------|
| **Modern** | ✅ Promise-based | ❌ Callback-based |
| **Syntax** | ✅ Clean & simple | ❌ Verbose |
| **Browser Support** | ⚠️ IE11 not supported | ✅ All browsers |
| **Streaming** | ✅ Built-in | ❌ Limited |

## Common Patterns

### POST with JSON Body

```bash
curl -X POST https://api.example.com/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"pass"}'
```

Converts to:

```javascript
fetch('https://api.example.com/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'user',
    password: 'pass'
  })
})
  .then(response => response.json())
  .then(data => console.log(data));
```

### With Async/Await

```javascript
async function login() {
  try {
    const response = await fetch('https://api.example.com/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'user',
        password: 'pass'
      })
    });
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### File Upload with FormData

```bash
curl -X POST https://api.example.com/upload \
  -F "file=@image.jpg" \
  -F "title=My Photo"
```

Converts to:

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('title', 'My Photo');

fetch('https://api.example.com/upload', {
  method: 'POST',
  body: formData
})
  .then(response => response.json())
  .then(data => console.log(data));
```

## Browser Compatibility

- **Fetch API**: Chrome 42+, Firefox 39+, Safari 10.1+, Edge 14+
- **XMLHttpRequest**: All browsers including IE6+

## Try It Live

[Open the converter](/javascript) to transform your cURL commands, or use [RequestBin](https://requestbin.net/apps/curl-converter) to test the code with real endpoints.

---

**Related docs:** [Python](/docs/convert-curl-to-python/) | [Node.js](/docs/convert-curl-to-nodejs/) | [Headers & JSON](/docs/headers-and-json-body/)
