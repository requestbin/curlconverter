# Security Policy

## 🔒 Supported Versions

We actively support the latest version of cURL Converter:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## 🛡️ Security Features

### Client-Side Processing
All cURL parsing and code generation happens **entirely in your browser**. We:
- ✅ **Never send** your cURL commands to our servers
- ✅ **Never store** your data anywhere
- ✅ **Never track** individual requests or conversions
- ✅ Use **local JavaScript execution** only

### Data Privacy
- No cookies beyond essential functionality
- No third-party analytics (unless explicitly configured)
- No user accounts or authentication required
- No personal data collection

### Browser Security
- All external links use `rel="noopener noreferrer"`
- Content Security Policy headers configured
- HTTPS-only in production
- No inline scripts in production build

## 🚨 Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please:

### ✅ DO:
1. **Email us directly** at: security@requestbin.net
2. **Provide details:**
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
3. **Give us time** to respond (48-72 hours)
4. **Wait for confirmation** before public disclosure

### ❌ DON'T:
- Don't open a public GitHub issue for security vulnerabilities
- Don't share details publicly before we've addressed it
- Don't exploit the vulnerability beyond proof-of-concept testing

## 📞 Response Timeline

| Stage | Timeline |
|-------|----------|
| Initial Response | Within 48 hours |
| Triage & Assessment | Within 1 week |
| Fix Development | 2-4 weeks (depends on severity) |
| Public Disclosure | After fix is deployed |

## 🏆 Recognition

We appreciate security researchers who help us keep our users safe. With your permission, we'll:
- Credit you in our changelog
- Mention you in the fix commit
- Add you to our security acknowledgments

## 🔐 Security Best Practices

If you're self-hosting or forking this project:

### Environment Variables
- Never commit `.env` files
- Use `.env.example` as template
- Rotate secrets regularly

### Dependencies
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

### Build Security
- Use official Node.js versions only
- Verify package integrity with lock files
- Enable Dependabot alerts (GitHub)

### Deployment
- Use HTTPS only (no HTTP)
- Configure security headers:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Content-Security-Policy`
  - `Strict-Transport-Security`
- Keep deployment platform updated

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Astro Security](https://docs.astro.build/en/guides/security/)

## 📧 Contact

For security-related inquiries:
- **Email:** security@requestbin.net
- **PGP Key:** [Link to public key if available]

For general questions, use [GitHub Discussions](https://github.com/requestbin/curlconverter/discussions).

---

**Last Updated:** November 29, 2025
