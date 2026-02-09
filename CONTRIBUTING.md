# Contributing to BLOKK LENS

Thank you for your interest in contributing to BLOKK LENS! We welcome contributions from the community to help make this the best cryptocurrency tracking and portfolio management platform.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Guidelines](#development-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)
- [Development Best Practices](#development-best-practices)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone. Please be kind and courteous in all interactions.

## Getting Started

1. **Fork the repository**

```bash
git clone https://github.com/wasiiff/blokk-lens.git
cd blokk-lens
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory (see `.env.example`):

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

# WalletConnect (for wallet integration)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Optional: Custom RPC URLs for better performance
ETHEREUM_RPC_URL=your_ethereum_rpc_url
POLYGON_RPC_URL=your_polygon_rpc_url
BSC_RPC_URL=your_bsc_rpc_url
ARBITRUM_RPC_URL=your_arbitrum_rpc_url
OPTIMISM_RPC_URL=your_optimism_rpc_url
BASE_RPC_URL=your_base_rpc_url
AVALANCHE_RPC_URL=your_avalanche_rpc_url
FANTOM_RPC_URL=your_fantom_rpc_url
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

Priority areas for contribution:
- Multi-chain portfolio enhancements
- Additional blockchain integrations
- Advanced technical indicators
- Enhanced AI trading insights
- Price alerts and notifications
- Social trading features
- DeFi protocol integration
- NFT portfolio tracking
- News aggregation
- Mobile responsiveness improvements
- Performance optimizations
- UI/UX enhancements

## Development Guidelines

### Tech Stack

- **Framework**: Next.js 16 (App Router with React 19)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI + Radix UI primitives
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js v4
- **Animations**: Framer Motion
- **Smooth Scroll**: Lenis
- **State Management**: TanStack Query (React Query) v5
- **Form Handling**: React Hook Form + Zod v4
- **AI**: Vercel AI SDK v6 with OpenAI
- **Web3**: Wagmi v2 + Viem v2 + RainbowKit v2
- **Charts**: Recharts
- **Markdown**: React Markdown with GFM support

### Code Style

- Use TypeScript for type safety
- Follow the existing code structure
- Use functional components with hooks
- Keep components small and focused
- Add comments for complex logic
- Use meaningful variable/function names

### Folder Structure

```
blokk-lens/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── chat-history/ # AI chat history
│   │   ├── coins/        # Cryptocurrency data
│   │   ├── convert/      # Currency conversion
│   │   ├── favorites/    # Favorites management
│   │   ├── portfolio/    # Portfolio tracking
│   │   ├── prices/       # Real-time prices
│   │   └── trading-assistant/ # AI assistant
│   ├── auth/              # Authentication pages
│   ├── coins/             # Coin detail pages
│   ├── convert/           # Conversion page
│   ├── favorites/         # Favorites page
│   ├── portfolio/         # Portfolio page
│   └── trading-assistant/ # AI assistant page
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── coins/            # Crypto-related components (MarketOverview, DraggableTradingAssistant, etc.)
│   ├── layout/           # Layout components
│   ├── portfolio/        # Portfolio components
│   ├── trading-assistant/# AI assistant components
│   ├── providers/        # Context providers
│   └── ui/               # Reusable UI components
├── lib/                  # Utility functions
│   ├── hooks/           # Custom React hooks
│   │   ├── useCacheBuster.ts
│   │   ├── useDebounce.ts
│   │   ├── usePageVisibility.ts
│   │   └── usePortfolio.ts
│   ├── validators/      # Zod validation schemas
│   ├── ai-config.ts     # AI configuration
│   ├── auth.ts          # NextAuth configuration
│   ├── cache-manager.ts # Cache management
│   ├── db.ts            # MongoDB connection
│   ├── password.ts      # Password hashing
│   ├── react-query.ts   # React Query setup
│   ├── utils.ts         # Utility functions
│   └── wagmi.ts         # Web3 configuration
├── models/              # MongoDB models
│   ├── ChatHistory.ts  # AI chat history
│   ├── Favorites.ts    # User favorites
│   └── User.ts         # User model
├── services/            # API services
│   ├── api.ts          # Frontend API client
│   ├── coingecko.ts    # CoinGecko integration
│   ├── queries.ts      # React Query hooks
│   └── trading-analysis.ts # Technical analysis
├── types/               # TypeScript types
│   ├── next-auth.d.ts  # NextAuth type extensions
│   └── types.ts        # Global types
└── public/              # Static assets
```

### Component Guidelines

- Use client components (`"use client"`) only when necessary (interactivity, hooks, browser APIs)
- Prefer server components for static content and data fetching
- Implement proper loading states with skeleton loaders
- Add error boundaries where appropriate
- Ensure responsive design (mobile-first approach)
- Use semantic HTML for accessibility
- Optimize images with Next.js Image component
- Implement proper caching strategies with React Query
- Use TypeScript for type safety
- Follow the existing component structure and naming conventions

### Styling Guidelines

- Use Tailwind CSS v4 utility classes
- Follow the existing design system and color palette
- Maintain dark/light mode compatibility
- Use CSS variables for theming (defined in globals.css)
- Ensure accessibility (WCAG 2.1 AA compliance)
- Use BorderBeam for premium features (trading assistant, coin details)
- Use SVG patterns and decorations for visual interest
- Implement glassmorphism effects consistently
- Test responsive design on multiple screen sizes
- Use Framer Motion for animations
- Implement Lenis for smooth scrolling where appropriate

### API Guidelines

- Implement proper error handling with try-catch blocks
- Use appropriate HTTP status codes (200, 400, 401, 404, 500, etc.)
- Add rate limiting where necessary (especially for external APIs)
- Cache responses when appropriate using Next.js revalidation
- Validate all inputs with Zod schemas
- Document API endpoints with JSDoc comments
- Use TypeScript for request/response types
- Implement proper authentication checks
- Handle edge cases and invalid inputs gracefully
- Log errors for debugging (but don't expose sensitive data)

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

Here are some areas where we'd love contributions:

**Portfolio & Tracking**
- Historical portfolio performance tracking
- Portfolio rebalancing suggestions
- Tax reporting and export features
- Transaction history tracking

**Market Data**
- Additional cryptocurrency exchanges integration
- Advanced charting tools with more indicators
- Custom watchlists and alerts
- Market sentiment analysis

**AI & Analysis**
- Enhanced technical analysis algorithms
- Pattern recognition (head & shoulders, triangles, etc.)
- Backtesting capabilities
- Risk assessment tools

**Social & Community**
- Social trading features
- Community sentiment tracking
- Shared portfolios and strategies
- Trading competitions

**DeFi & Web3**
- DeFi protocol integration (Uniswap, Aave, etc.)
- Yield farming tracking
- Staking rewards monitoring
- Gas fee optimization

**Additional Features**
- NFT portfolio tracking
- News aggregation and sentiment
- Price alerts and notifications
- Mobile app (React Native)
- Multi-language support
- Export/import portfolio data
- API for third-party integrations

## Development Best Practices

### Performance

- Implement proper caching (React Query with appropriate stale times)
- Use Next.js API route caching with revalidation
- Optimize images and assets (WebP format, proper sizing)
- Minimize API calls (batch requests when possible)
- Use pagination for large datasets
- Implement virtualization for long lists (React Window)
- Implement proper loading states and skeleton loaders
- Use dynamic imports for code splitting
- Optimize bundle size (tree shaking, remove unused dependencies)
- Monitor Core Web Vitals (LCP, FID, CLS)

### Security

- Never commit API keys or secrets (use .env files)
- Validate all user inputs (client and server side)
- Sanitize data before display (prevent XSS)
- Use environment variables for sensitive data
- Implement rate limiting on sensitive endpoints
- Follow OWASP security guidelines
- Hash passwords with bcrypt (never store plain text)
- Validate wallet signatures properly
- Protect against SQL/NoSQL injection
- Implement CSRF protection
- Use HTTPS in production
- Regularly update dependencies
- Monitor for security vulnerabilities (npm audit)

### Testing

While we don't require tests for all contributions, they are highly appreciated:

- Test all user flows and interactions
- Test error states and edge cases
- Test loading states and async operations
- Test responsive design on multiple devices
- Test accessibility with screen readers
- Test dark/light mode switching
- Test wallet connection flows
- Test API endpoints with various inputs
- Test performance with large datasets

**Testing Tools** (optional):
- Jest for unit tests
- React Testing Library for component tests
- Playwright or Cypress for E2E tests

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
