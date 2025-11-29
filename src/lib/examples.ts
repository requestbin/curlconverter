export const EXAMPLE_CURL = `curl -X POST https://httpbin.org/post \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer MY_TOKEN" \
  -d '{"hello":"world"}'`;

// Quick examples for common HTTP methods
export const QUICK_EXAMPLES = [
  {
    name: 'GET Request',
    method: 'GET',
    curl: `curl https://requestbin.net/examples/request.html`,
  },
  {
    name: 'POST JSON',
    method: 'POST',
    curl: `curl -X POST https://requestbin.net/examples/request.html \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com"}'`,
  },
  {
    name: 'PUT Request',
    method: 'PUT',
    curl: `curl -X PUT https://requestbin.net/examples/request.html \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"status":"updated"}'`,
  },
  {
    name: 'DELETE Request',
    method: 'DELETE',
    curl: `curl -X DELETE https://requestbin.net/examples/request.html \
  -H "Authorization: Bearer YOUR_TOKEN"`,
  },
  {
    name: 'Form Data',
    method: 'POST',
    curl: `curl -X POST https://requestbin.net/examples/request.html \
  -F "name=John" \
  -F "file=@document.pdf"`,
  },
  {
    name: 'Custom Headers',
    method: 'GET',
    curl: `curl https://requestbin.net/examples/request.html \
  -H "User-Agent: MyApp/1.0" \
  -H "Accept: application/json" \
  -H "X-API-Key: YOUR_API_KEY"`,
  },
] as const;
