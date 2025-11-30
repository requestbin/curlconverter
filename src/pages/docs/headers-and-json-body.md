---
layout: ../../layouts/DocsLayout.astro
title: "Headers and JSON Body"
description: "Complete guide to converting cURL commands with authentication headers, JSON request bodies, and complex data structures."
---

# Headers and JSON Body

Master the art of converting cURL commands with authentication headers, JSON request bodies, and nested data structures.

## Authentication Headers

### Bearer Token (Most Common)

```bash
curl https://api.example.com/data \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Converts to Python:

```python
import requests

url = "https://api.example.com/data"
headers = {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

response = requests.get(url, headers=headers)
```

### API Key Header

```bash
curl https://api.example.com/data \
  -H "X-API-Key: your_api_key_here"
```

## JSON Request Bodies

### Simple JSON POST

```bash
curl -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","age":30}'
```

Converts to Python:

```python
import requests

url = "https://api.example.com/users"
headers = {
    "Content-Type": "application/json"
}
data = {
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30
}

response = requests.post(url, headers=headers, json=data)
```

JavaScript (Fetch):

```javascript
fetch('https://api.example.com/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    age: 30
  })
})
  .then(response => response.json())
  .then(data => console.log(data));
```

### Bearer Token + JSON Body

```bash
curl -X GET https://api.example.com/user/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

Converts to Python:

```python
import requests

url = "https://api.example.com/user/profile"
headers = {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "Content-Type": "application/json"
}

response = requests.get(url, headers=headers)
```

### API Key in Header

```bash
curl -X GET https://api.example.com/data \
  -H "X-API-Key: YOUR_API_KEY_HERE"
```

Converts to Node.js (Axios):

```javascript
const axios = require('axios');

axios.get('https://api.example.com/data', {
  headers: {
    'X-API-Key': 'YOUR_API_KEY_HERE'
  }
})
  .then(response => console.log(response.data));
```

## Nested JSON Objects

```bash
curl -X POST https://api.example.com/orders \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "ORD-123",
    "customer": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "items": [
      {"product_id": "P1", "quantity": 2},
      {"product_id": "P2", "quantity": 1}
    ]
  }'
```

## Content-Type Headers

### JSON (Most Common)

```bash
curl https://api.example.com/data \
  -H "Content-Type: application/json"
```

### Form Data

```bash
curl https://api.example.com/submit \
  -H "Content-Type: application/x-www-form-urlencoded"
```

### GraphQL

```bash
curl -X POST https://api.example.com/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"query":"{ user(id: 1) { name email } }"}'
```

## Common Mistakes

### Wrong Quote Usage

```bash
# ❌ Wrong - Shell interprets the quotes
curl -X POST https://api.example.com/data -d '{"key":"value"}'
  -H "Content-Type: application/json"

# ✅ Correct - Headers before data
curl -X POST https://api.example.com/data \
  -H "Content-Type: application/json" \
  -d '{"key":"value"}'
```

### Escaping JSON in cURL

```bash
# ❌ Wrong - Shell interprets quotes
-d "{"key":"value"}"

# ✅ Correct - Single quotes preserve JSON
-d '{"key":"value"}'
```

### Missing Content-Type

```bash
# ❌ Wrong - Server might not parse JSON
curl -X POST https://api.example.com/data \
  -d '{"key":"value"}'

# ✅ Correct - Explicit Content-Type
curl -X POST https://api.example.com/data \
  -H "Content-Type: application/json" \
  -d '{"key":"value"}'
```

## Debugging Tips

1. **Use RequestBin** - Send requests to a [RequestBin URL](https://requestbin.net) to inspect headers and body
2. **Check quotes** - Always use single quotes for JSON data in cURL
3. **Validate JSON** - Ensure JSON is valid before converting
4. **Test incrementally** - Start with simple requests, then add complexity

## Try It Live

[Open the converter](/) to transform your cURL commands, or use [RequestBin](https://requestbin.net/apps/curl-converter) to test with real endpoints and inspect requests.

---

**Related docs:** [How It Works](/docs/how-it-works/) | [Python](/docs/convert-curl-to-python/) | [JavaScript](/docs/convert-curl-to-javascript/)
