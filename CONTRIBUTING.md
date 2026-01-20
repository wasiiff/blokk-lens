# Contributing to BLOKK LENS

Thank you for your interest in contributing to BLOKK LENS! We welcome contributions from the community to help make this the best real-time cryptocurrency tracking platform.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Guidelines](#development-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone. Please be kind and courteous in all interactions.

## Getting Started

1. **Fork the repository**

```bash
git clone https://github.com/wasiiff/blokk-lens.git
cd blokklens
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# CoinGecko API (optional - has free tier)
COINGECKO_API_KEY=your_api_key_optional

# OpenAI API (for AI Trading Assistant)
OPENAI_API_KEY=your_openai_api_key

# Wallet Connect (optional)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
```

4. **Run the development server**

```bash
npm run dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## How to Contribute

There are several ways you can contribute to BLOKK LENS:

### 1. Report Issues

Found a bug or have a suggestion? [Open an issue](https://github.com/wasiiff/blokk-lens/issues/new)

### 2. Improve Documentation

Help improve our docs, add examples, or clarify existing content

### 3. Code Contributions

Fix bugs, add features, or improve performance

### 4. Add New Features

- New cryptocurrency data sources
- Additional technical indicators
- Enhanced AI trading insights
- UI/UX improvements

## Development Guidelines

### Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI + Custom Components
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Animations**: Framer Motion
- **State Management**: TanStack Query (React Query)
- **AI**: Vercel AI SDK with OpenAI
- **Web3**: Wagmi + RainbowKit

### Code Style

- Use TypeScript for type safety
- Follow the existing code structure
- Use functional components with hooks
- Keep components small and focused
- Add comments for complex logic
- Use meaningful variable/function names

### Folder Structure

```
blokklens/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── coins/             # Coin detail pages
│   ├── convert/           # Conversion page
│   ├── favorites/         # Favorites page
│   └── trading-assistant/ # AI assistant page
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── coins/            # Crypto-related components
│   ├── layout/           # Layout components
│   ├── trading-assistant/# AI assistant components
│   └── ui/               # UI components
├── lib/                  # Utility functions
│   ├── hooks/           # Custom React hooks
│   └── validators/      # Zod validation schemas
├── models/              # MongoDB models
├── services/            # API services
│   ├── api.ts          # Frontend API client
│   ├── coingecko.ts    # CoinGecko integration
│   ├── queries.ts      # React Query hooks
│   └── trading-analysis.ts # Technical analysis
├── types/               # TypeScript types
└── public/              # Static assets
```

### Component Guidelines

- Use client components only when necessary (`"use client"`)
- Implement proper loading states
- Add error boundaries where appropriate
- Ensure responsive design (mobile-first)
- Use semantic HTML
- Optimize images with Next.js Image component
- Implement proper caching strategies

### Styling Guidelines

- Use Tailwind CSS v4 utility classes
- Follow the existing design system
- Maintain dark/light mode compatibility
- Use CSS variables for theming
- Ensure accessibility (WCAG 2.1 AA)
- Use BorderBeam for trading assistant and coin detail pages
- Use SVG patterns for other pages

### API Guidelines

- Implement proper error handling
- Use appropriate HTTP status codes
- Add rate limiting where necessary
- Cache responses when appropriate
- Validate all inputs with Zod
- Document API endpoints

## Pull Request Process

1. **Create a branch**

```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**

- Write clean, documented code
- Test thoroughly
- Ensure no layout shifts or visual bugs
- Test dark/light mode
- Test responsive design

3. **Commit your changes**

```bash
git add .
git commit -m "feat: add your feature description"
```

**Commit Message Format:**

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding tests
- `chore:` - Maintenance tasks

4. **Push to your fork**

```bash
git push origin feature/your-feature-name
```

5. **Open a Pull Request**

- Go to the repository
- Click "New Pull Request"
- Select your branch
- Fill in the PR template
- Add screenshots/videos if UI changes
- Link any related issues

### PR Checklist

- [ ] Code follows the project's style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] No console errors or warnings
- [ ] Responsive design tested (mobile, tablet, desktop)
- [ ] Dark/light mode tested
- [ ] No layout shift (CLS = 0)
- [ ] Images optimized
- [ ] Accessibility checked
- [ ] API rate limits respected
- [ ] Caching implemented where appropriate

## Reporting Bugs

When reporting bugs, please include:

1. **Bug Description**: Clear description of the issue
2. **Steps to Reproduce**: Detailed steps to reproduce the bug
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Screenshots**: If applicable
6. **Environment**:
   - Browser & version
   - OS & version
   - Device (if mobile)
7. **Additional Context**: Any other relevant information

**Example:**

```markdown
**Bug**: Coin prices not updating in real-time

**Steps to Reproduce**:
1. Go to homepage
2. Wait for 60 seconds
3. Notice prices remain static

**Expected**: Prices should update every 60 seconds

**Actual**: Prices don't update automatically

**Environment**:
- Browser: Chrome 120
- OS: Windows 11
- Device: Desktop

**Screenshot**: [attach screenshot]
```

## Feature Requests

We welcome feature suggestions! When requesting features:

1. **Search existing issues** to avoid duplicates
2. **Describe the feature** clearly and concisely
3. **Explain the use case** - why is this needed?
4. **Provide examples** - mockups, similar implementations
5. **Consider impact** - how does this benefit users?

### Feature Ideas

- Additional cryptocurrency exchanges integration
- Portfolio tracking
- Price alerts and notifications
- Advanced charting tools
- Social trading features
- News aggregation
- DeFi protocol integration
- NFT tracking

## Development Best Practices

### Performance

- Implement proper caching (React Query, API caching)
- Use pagination for large datasets
- Optimize images and assets
- Minimize API calls
- Use virtualization for long lists
- Implement proper loading states

### Security

- Never commit API keys or secrets
- Validate all user inputs
- Sanitize data before display
- Use environment variables
- Implement rate limiting
- Follow OWASP guidelines

### Testing

- Test all user flows
- Test error states
- Test loading states
- Test responsive design
- Test accessibility
- Test dark/light mode

## Questions?

If you have questions about contributing:

- Check existing [Issues](https://github.com/wasiiff/blokk-lens/issues)
- Review the documentation
- Reach out to maintainers

## Recognition

Contributors will be recognized in:

- GitHub contributors page
- Project README
- Release notes (for significant contributions)

## License

By contributing to BLOKK LENS, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to BLOKK LENS! 🚀**

Together, we're building the best real-time cryptocurrency tracking platform.
