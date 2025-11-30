---
layout: ../../layouts/DocsLayout.astro
title: "Open in RequestBin"
description: "Learn how to use the Open in RequestBin feature to test converted code with real HTTP endpoints and inspect requests."
---

# Open in RequestBin

The **Open in RequestBin** feature lets you test your converted code with real HTTP endpoints, inspect requests, and debug API calls - all without writing a single line of backend code.

## What is RequestBin?

[RequestBin](https://requestbin.net) is a tool that gives you unique URLs to:

- 📥 **Inspect HTTP requests** - See headers, body, query params
- 🔍 **Debug webhooks** - Test webhook payloads without a server
- 🧪 **Validate API calls** - Ensure your code sends correct data
- 📊 **Monitor traffic** - Track all incoming requests in real-time

## How It Works

### 1. Convert Your cURL Command

Paste your cURL command into the converter:

```bash
curl -X POST https://api.example.com/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer secret_token" \
  -d '{"event":"user.created","data":{"id":123}}'
```

### 2. Click "Open in RequestBin"

The button automatically:
- Creates a unique RequestBin URL (e.g., `https://requestbin.net/r/abc123xyz`)
- Replaces the original URL with your RequestBin URL
- Preserves all headers and body data

### 3. Get Your Unique URL

RequestBin generates a URL like:

```
https://requestbin.net/r/abc123xyz
```

### 4. Run the Converted Code

Use the generated Python, JavaScript, or any language code:

```python
# Python example
import requests

url = "https://requestbin.net/r/abc123xyz"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer secret_token"
}
data = {
    "event": "user.created",
    "data": {"id": 123}
}

response = requests.post(url, headers=headers, json=data)
```

### 5. Inspect the Request

Visit your RequestBin URL to see:
- **Method**: POST
- **Headers**: Content-Type, Authorization, etc.
- **Body**: Full JSON payload
- **Query Params**: If any
- **Timestamp**: When the request was received

## Common Use Cases

### Debugging Authentication Headers

```bash
curl -X GET https://api.example.com/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Problem**: Not sure if your auth header is correct?
**Solution**: Open in RequestBin to inspect the exact header format sent.

### Testing Webhook Payloads

```bash
curl -X POST https://your-server.com/webhook \
  -H "Content-Type: application/json" \
  -d '{"event":"payment.success","amount":100}'
```

**Problem**: Need to test webhook logic without a live server?
**Solution**: Use RequestBin as a temporary webhook endpoint.

### Validating Form Data

```bash
curl -X POST https://api.example.com/upload \
  -F "file=@photo.jpg" \
  -F "description=My vacation photo"
```

**Problem**: Unsure if form data is encoded correctly?
**Solution**: RequestBin shows you the exact multipart/form-data structure.

## Privacy Warning

⚠️ **Important**: RequestBin URLs are public and accessible by anyone who knows the URL. 

**Never send**:
- Production API keys
- Real passwords
- Sensitive personal data
- Credit card information

**Safe to send**:
- Test/dummy data
- Development API keys
- Mock webhook payloads
- Sample JSON structures

## Advanced Features

### Monitor Multiple Requests

RequestBin keeps a history of all requests to your unique URL:

```bash
# First request
curl -X POST https://requestbin.net/r/abc123xyz -d '{"test":1}'

# Second request  
curl -X POST https://requestbin.net/r/abc123xyz -d '{"test":2}'

# View both in RequestBin dashboard
```

### Full Stack Example

```python
# Backend sends webhook
import requests

webhook_url = "https://requestbin.net/r/abc123xyz"
payload = {
    "event": "charge.succeeded",
    "amount": 5000,
    "currency": "usd"
}

requests.post(webhook_url, json=payload)
```

```bash
# Frontend polls for webhook
curl -X POST https://your-server.com/webhooks/payment \
  -d '{"event":"charge.succeeded","amount":5000}'
```

## Try It Now

1. [Open the converter](/) 
2. Paste any cURL command
3. Click **"Open in RequestBin"**
4. Run the generated code
5. Inspect your request in RequestBin

Or use [RequestBin's curl-converter app](https://requestbin.net/apps/curl-converter) for advanced features like:
- Saved request history
- Team collaboration
- Custom domain bins
- Webhook forwarding

---

**Related docs:** [How It Works](/docs/how-it-works/) | [Headers & JSON](/docs/headers-and-json-body/) | [Python](/docs/convert-curl-to-python/)
