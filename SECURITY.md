# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          | Status      |
| ------- | ------------------ | ----------- |
| 0.1.x   | :white_check_mark: | Beta        |
| < 0.1   | :x:                | Unsupported |

**Note**: This project is currently in beta. We recommend using the latest version from the main branch.

## Reporting a Vulnerability

We take the security of BLOKK LENS seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please Do Not:

- **Do not** open a public GitHub issue for security vulnerabilities
- **Do not** disclose the vulnerability publicly until it has been addressed
- **Do not** exploit the vulnerability for malicious purposes

### How to Report:

**Please report security vulnerabilities by:**

1. **Email**: Create a security advisory on GitHub (preferred)
   - Go to: https://github.com/wasiiff/blokk-lens/security/advisories/new
   
2. **Alternative**: Email the maintainer directly
   - Check the repository for contact information

**Do not use public GitHub issues for security vulnerabilities**

Include the following information:

1. **Type of vulnerability** (e.g., XSS, SQL injection, authentication bypass, API key exposure)
2. **Full paths of source file(s)** related to the vulnerability
3. **Location** of the affected source code (tag/branch/commit or direct URL)
4. **Step-by-step instructions** to reproduce the issue
5. **Proof-of-concept or exploit code** (if possible)
6. **Impact** of the vulnerability and potential attack scenarios
7. **Any potential solutions** you've identified

### What to Expect:

- **Acknowledgment**: We will acknowledge your email within 48 hours
- **Investigation**: We will investigate and validate the vulnerability
- **Updates**: We will keep you informed of our progress
- **Fix Timeline**: Critical vulnerabilities will be patched within 7 days
- **Credit**: We will credit you in the security advisory (unless you prefer to remain anonymous)

## Security Best Practices for Contributors

When contributing to BLOKK LENS, please follow these security guidelines:

### Authentication & Authorization

- Never hardcode credentials or API keys in code
- Use environment variables for all sensitive data
- Implement proper session management with NextAuth.js
- Validate user permissions on all protected routes
- Use HTTPS in production environments
- Implement secure wallet connection flows with signature verification
- Rotate API keys if compromised
- Use secure password hashing (bcrypt with appropriate salt rounds)
- Implement proper JWT token validation
- Add rate limiting to authentication endpoints

### Input Validation

- Sanitize all user inputs on both client and server
- Validate data on both client and server side
- Prevent SQL/NoSQL injection attacks with parameterized queries
- Protect against XSS (Cross-Site Scripting) with proper sanitization
- Implement CSRF protection for state-changing operations
- Validate cryptocurrency addresses before processing
- Use Zod schemas for comprehensive input validation
- Sanitize markdown and HTML content
- Validate file uploads (if implemented)
- Limit input sizes to prevent DoS attacks

### Database Security

- Use parameterized queries with Mongoose
- Implement proper access controls
- Never expose database credentials in code
- Regularly backup database
- Monitor for suspicious activities
- Encrypt sensitive user data

### API Security

- Rate limit API endpoints (especially CoinGecko and OpenAI calls)
- Implement proper authentication for protected endpoints
- Validate all request data with Zod schemas
- Use secure headers (CSP, HSTS, X-Frame-Options, etc.)
- Log API access for monitoring and debugging
- Protect API keys (CoinGecko, OpenRouter, Vercel AI Gateway, Google Gemini, OpenAI, WalletConnect)
- Implement request throttling per user/IP
- Use API key rotation strategies
- Monitor for unusual API usage patterns
- Implement proper CORS policies
- Validate webhook signatures (if applicable)
- Use environment-specific API keys (dev/staging/prod)

### Dependencies

- Keep all dependencies up to date regularly
- Regularly audit dependencies for vulnerabilities (`npm audit`)
- Use `npm audit fix` to automatically fix vulnerabilities
- Remove unused dependencies to reduce attack surface
- Monitor security advisories for critical packages
- Use Dependabot or similar tools for automated updates
- Review dependency licenses for compliance
- Pin dependency versions in production
- Use lock files (package-lock.json) for reproducible builds

### Code Security

- Avoid exposing sensitive information in error messages
- Implement proper error handling
- Use secure randomness for tokens
- Sanitize file uploads (if implemented)
- Validate URLs before redirects
- Secure AI prompt injection vulnerabilities

### Web3 Security

- Validate wallet signatures properly using cryptographic verification
- Never request or store private keys
- Implement proper wallet connection flows with user consent
- Validate smart contract interactions before execution
- Protect against wallet draining attacks
- Use secure RPC endpoints (avoid public endpoints for production)
- Implement proper error handling for wallet operations
- Warn users about transaction risks and gas fees
- Validate chain IDs to prevent wrong network transactions
- Use reputable wallet providers (RainbowKit supported wallets)
- Implement transaction simulation before execution
- Monitor for suspicious wallet activities

## Security Measures We Implement

### Infrastructure

- HTTPS encryption for all traffic (TLS 1.3)
- Secure database connections with encryption
- Environment variable management (never commit .env files)
- Regular security updates and patches
- CDN with DDoS protection
- Secure backup strategies
- Access control and authentication for admin functions
- Monitoring and alerting for security events
- Regular security audits and penetration testing

### Application

- NextAuth.js for secure authentication
- Input validation and sanitization with Zod
- Content Security Policy (CSP) headers
- Rate limiting on API routes (per user/IP)
- Secure session management with HTTP-only cookies
- Zod schema validation for all inputs
- Secure wallet integration (RainbowKit)
- XSS protection with proper escaping
- CSRF protection for state-changing operations
- Secure password hashing with bcrypt
- SQL/NoSQL injection prevention

### API Protection

- CoinGecko API key protection (server-side only)
- AI provider key security (OpenRouter/Gateway/Google/OpenAI - never exposed to client)
- WalletConnect Project ID management
- Rate limiting per user/IP address
- Request validation with Zod schemas
- Response sanitization to prevent data leaks
- API usage monitoring and alerting
- Implement API request quotas
- Use API proxies to hide implementation details

### Monitoring

- Error tracking and logging (without sensitive data)
- Suspicious activity monitoring and alerts
- Regular security audits and code reviews
- Dependency vulnerability scanning (automated)
- API usage monitoring and rate limit tracking
- Failed authentication attempt monitoring
- Unusual wallet activity detection
- Performance monitoring for DoS detection

## Vulnerability Disclosure Policy

Once a vulnerability is reported:

1. **Confirmation**: We confirm the vulnerability and its severity
2. **Fix Development**: We develop a fix in a private repository
3. **Testing**: We thoroughly test the fix
4. **Release**: We release a patch version
5. **Disclosure**: We publish a security advisory with:
   - Description of the vulnerability
   - Affected versions
   - Patches available
   - Credit to the reporter
   - Mitigation steps

## Security Updates

Security updates will be released as:

- **Critical**: Immediate patch release
- **High**: Patch within 7 days
- **Medium**: Patch within 30 days
- **Low**: Included in next regular release

## Third-Party Security Issues

If you discover a security issue in a third-party dependency:

1. Report it to the maintainer of that package
2. Notify us so we can track and update when patched
3. We will monitor the issue and update dependencies accordingly

## Security Checklist for Developers

Before submitting a PR, ensure:

- [ ] No credentials or API keys in code
- [ ] All user inputs are validated and sanitized
- [ ] Authentication and authorization properly implemented
- [ ] No SQL/NoSQL injection vulnerabilities
- [ ] XSS protection implemented
- [ ] CSRF tokens used where needed
- [ ] Error messages don't expose sensitive data
- [ ] Dependencies are up to date
- [ ] Secure headers configured
- [ ] Rate limiting on sensitive endpoints
- [ ] API keys stored in environment variables
- [ ] Secure wallet connections are implemented
- [ ] AI prompts are sanitized (prevent prompt injection)
- [ ] Multi-chain RPC endpoints are secure
- [ ] Portfolio data is properly validated
- [ ] Chat history is properly secured

## Common Security Concerns

### API Key Exposure

- Never commit `.env` files to version control
- Use `.env.example` for templates (without actual keys)
- Rotate keys immediately if exposed
- Use server-side API calls for sensitive keys
- Implement key rotation strategies
- Use different keys for dev/staging/production
- Monitor API usage for unauthorized access

### Rate Limiting

- CoinGecko free tier: 10-50 calls/minute (respect limits)
- OpenAI API: Monitor token usage and costs
- Implement caching to reduce API calls (React Query)
- Use server-side caching for frequently accessed data
- Implement exponential backoff for failed requests
- Set up rate limiting per user/IP on your endpoints
- Monitor and alert on rate limit violations

### User Data Protection

- Hash passwords with bcrypt (minimum 10 salt rounds)
- Encrypt sensitive user data at rest
- Implement proper session management (HTTP-only cookies)
- Follow GDPR and privacy regulations
- Allow users to delete their data (right to be forgotten)
- Implement data retention policies
- Use secure password reset flows
- Never log sensitive information (passwords, API keys)
- Implement proper access controls for user data

### Web3 Security

- Validate wallet signatures cryptographically
- Never request or store private keys
- Use reputable wallet providers (RainbowKit supported)
- Implement proper error handling for wallet operations
- Warn users about transaction risks and gas fees
- Validate chain IDs before transactions
- Use secure RPC endpoints
- Implement transaction simulation
- Monitor for suspicious wallet activities
- Protect against phishing attacks

## Contact

For security concerns, contact:

- **GitHub Security Advisories**: [Create a security advisory](https://github.com/wasiiff/blokk-lens/security/advisories/new) (preferred)
- **GitHub Issues**: For non-sensitive security discussions only
- **Repository**: https://github.com/wasiiff/blokk-lens

## Acknowledgments

We appreciate the security research community and acknowledge those who help keep BLOKK LENS secure:

- Security researchers who report vulnerabilities responsibly
- Contributors who follow security best practices
- Tools and services that help us maintain security

---

**Last Updated**: January 2026

**Version**: 0.1.0 (Beta)

Thank you for helping keep BLOKK LENS and its users safe! 🔒
