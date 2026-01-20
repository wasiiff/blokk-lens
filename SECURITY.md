# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Reporting a Vulnerability

We take the security of BLOKK LENS seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please Do Not:

- **Do not** open a public GitHub issue for security vulnerabilities
- **Do not** disclose the vulnerability publicly until it has been addressed
- **Do not** exploit the vulnerability for malicious purposes

### How to Report:

**Please report security vulnerabilities by emailing: security@blokklens.com**

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

- Never hardcode credentials or API keys
- Use environment variables for sensitive data
- Implement proper session management
- Validate user permissions on all protected routes
- Use HTTPS in production
- Implement secure wallet connection flows

### Input Validation

- Sanitize all user inputs
- Validate data on both client and server side
- Prevent SQL/NoSQL injection attacks
- Protect against XSS (Cross-Site Scripting)
- Implement CSRF protection
- Validate cryptocurrency addresses

### Database Security

- Use parameterized queries with Mongoose
- Implement proper access controls
- Never expose database credentials in code
- Regularly backup database
- Monitor for suspicious activities
- Encrypt sensitive user data

### API Security

- Rate limit API endpoints (especially CoinGecko calls)
- Implement proper authentication
- Validate all request data
- Use secure headers
- Log API access for monitoring
- Protect API keys (CoinGecko, OpenAI)
- Implement request throttling

### Dependencies

- Keep all dependencies up to date
- Regularly audit dependencies for vulnerabilities
- Use `npm audit` to check for known issues
- Remove unused dependencies
- Monitor security advisories

### Code Security

- Avoid exposing sensitive information in error messages
- Implement proper error handling
- Use secure randomness for tokens
- Sanitize file uploads (if implemented)
- Validate URLs before redirects
- Secure AI prompt injection vulnerabilities

### Web3 Security

- Validate wallet signatures properly
- Never request unnecessary permissions
- Implement proper wallet connection flows
- Validate smart contract interactions
- Protect against wallet draining attacks
- Use secure RPC endpoints

## Security Measures We Implement

### Infrastructure

- HTTPS encryption for all traffic
- Secure database connections
- Environment variable management
- Regular security updates
- CDN with DDoS protection

### Application

- NextAuth.js for authentication
- Input validation and sanitization
- Content Security Policy (CSP)
- Rate limiting on API routes
- Secure session management
- Zod schema validation
- Secure wallet integration (RainbowKit)

### API Protection

- CoinGecko API key protection
- OpenAI API key security
- Rate limiting per user/IP
- Request validation
- Response sanitization

### Monitoring

- Error tracking and logging
- Suspicious activity monitoring
- Regular security audits
- Dependency vulnerability scanning
- API usage monitoring

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
- [ ] Wallet connections are secure
- [ ] AI prompts are sanitized

## Common Security Concerns

### API Key Exposure

- Never commit `.env` files
- Use `.env.example` for templates
- Rotate keys if exposed
- Use server-side API calls for sensitive keys

### Rate Limiting

- CoinGecko free tier: 10-50 calls/minute
- Implement caching to reduce API calls
- Use React Query for client-side caching
- Implement server-side caching

### User Data Protection

- Hash passwords with bcrypt
- Encrypt sensitive user data
- Implement proper session management
- Follow GDPR guidelines
- Allow users to delete their data

### Web3 Security

- Validate wallet signatures
- Never request private keys
- Use reputable wallet providers
- Implement proper error handling
- Warn users about transaction risks

## Contact

For security concerns, contact:

- **Email**: security@blokklens.com
- **GitHub**: [Create a security advisory](https://github.com/wasiiff/blokk-lens/security/advisories/new)

## Acknowledgments

We appreciate the security research community and acknowledge those who help keep BLOKK LENS secure:

- Security researchers who report vulnerabilities responsibly
- Contributors who follow security best practices
- Tools and services that help us maintain security

---

**Last Updated**: January 2026

Thank you for helping keep BLOKK LENS and its users safe! 🔒
