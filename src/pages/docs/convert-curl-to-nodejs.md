---
layout: ../../layouts/DocsLayout.astro
title: "Convert cURL to Node.js"
description: "Transform cURL commands into Node.js code using HTTP, Axios, or Got libraries. Server-side API integration made easy."
---

# Convert cURL to Node.js

Generate server-side Node.js code from cURL commands. Choose from three popular HTTP libraries: **Native HTTP**, **Axios**, or **Got**.

## Library Comparison

### Native HTTP Module
- ✅ No dependencies - built into Node.js
- ✅ Lightweight and fast
- ❌ More verbose syntax
- ❌ Manual JSON parsing

### Axios
- ✅ Most popular HTTP client (50M+ downloads/week)
- ✅ Promise-based, clean API
- ✅ Automatic JSON transformation
- ✅ Request/response interceptors

### Got
- ✅ Modern, TypeScript-friendly
- ✅ Retry mechanism built-in
- ✅ Stream support
- ✅ Better error handling

## Quick Example with Axios

```bash
curl -X POST https://api.example.com/data \
  -H "Content-Type: application/json" \
  -d '{"key":"value"}'
```

Converts to:

```javascript
const axios = require('axios');

const url = 'https://api.example.com/data';
const data = {
  key: 'value'
};

axios.post(url, data, {
  headers: {
    'Content-Type': 'application/json'
  }
})
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error('Error:', error.message);
  });
```

## Installation

### Axios
```bash
npm install axios
```

### Got
```bash
npm install got
```

## Common Patterns

### GET with Query Parameters

```javascript
const axios = require('axios');

axios.get('https://api.example.com/search', {
  params: {
    q: 'nodejs',
    limit: 10
  }
})
  .then(response => console.log(response.data));
```

### File Upload

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const form = new FormData();
form.append('file', fs.createReadStream('document.pdf'));

axios.post('https://api.example.com/upload', form, {
  headers: form.getHeaders()
})
  .then(response => console.log(response.data));
```

### Authentication Headers

```javascript
const axios = require('axios');

const headers = {
  'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
  'Content-Type': 'application/json'
};

axios.get('https://api.example.com/protected', { headers })
  .then(response => console.log(response.data));
```

### Error Handling

```javascript
const axios = require('axios');

async function fetchData() {
  try {
    const response = await axios.get('https://api.example.com/data');
    console.log(response.data);
  } catch (error) {
    if (error.response) {
      // Server responded with error status
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('No response received');
    } else {
      // Error in request setup
      console.error('Error:', error.message);
    }
  }
}
```

## Try It Live

[Open the converter](/nodejs) to transform your cURL commands, or use [RequestBin](https://requestbin.net/apps/curl-converter) to test with real HTTP endpoints.

---

**Related docs:** [Python](/docs/convert-curl-to-python/) | [JavaScript](/docs/convert-curl-to-javascript/) | [How It Works](/docs/how-it-works/)
