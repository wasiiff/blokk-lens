# BLOKK LENS 🚀

A comprehensive cryptocurrency tracking and portfolio management platform built with Next.js 16, featuring real-time market data, AI-powered trading insights, multi-chain wallet integration, live analytics, and a modern glassmorphism UI.

## Features ✨

### Core Features
- **Real-time Market Data**: Live cryptocurrency prices, market caps, and 24h changes from CoinGecko API
- **Infinite Scroll Market View**: Load all coins progressively without pagination (optimized for rate limits)
- **Live Analytics**: Auto-refreshing coin data every 60 seconds with visual indicators
- **Multi-Timeframe Charts**: Analyze price trends across 7D, 30D, 90D, 1Y, and MAX periods
- **Trending & Popular Coins**: Discover what's hot in the crypto market
- **Advanced Search**: Fast, virtualized coin search with real-time filtering
- **Detailed Coin Pages**: Comprehensive coin information with interactive price charts and live market statistics
- **Crypto Converter**: Convert between cryptocurrencies with real-time exchange rates

### Portfolio & Wallet
- **Multi-Chain Portfolio Tracking**: Monitor your crypto holdings across multiple blockchains
  - Ethereum, Polygon, BNB Chain, Arbitrum, Optimism, Base, Avalanche, Fantom
- **Wallet Integration**: Connect via RainbowKit with support for major wallet providers
- **Real-time Balance Tracking**: Automatic detection of native tokens and popular ERC-20 tokens
- **Portfolio Analytics**: Total value calculation, asset distribution, and performance metrics

### AI Trading Assistant
- **AI-Powered Analysis**: Get intelligent trading insights powered by OpenAI
- **Technical Analysis**: Automated technical indicators (RSI, MACD, SMA) and market trend analysis
- **Backtesting**: Test trading strategies with historical data
- **Draggable & Resizable UI**: Modern floating assistant with minimization support
- **Session Continuity**: Seamlessly transition between the floating window and full-screen chat
- **Chat History**: Persistent conversation history for continuous learning
- **Market Predictions**: AI-driven price predictions and trading recommendations
- **Real-time Integration**: AI responses based on current market data and technical indicators

### User Experience
- **User Authentication**: Secure login with NextAuth.js (Credentials & Wallet-based auth)
- **Favorites System**: Save and track your favorite cryptocurrencies
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile
- **Modern UI**: Glassmorphism effects, BorderBeam animations, SVG decorations, and smooth transitions
- **Dark/Light Mode**: Theme support with system preference detection
- **Smooth Scrolling**: Lenis-powered smooth scroll experience

## Tech Stack 🛠️

### Frontend
- **Framework**: Next.js 16 (App Router with React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn/ui with Radix UI primitives
- **Animations**: Framer Motion
- **Smooth Scroll**: Lenis
- **Icons**: Lucide React
- **Charts**: Recharts

### Backend & Data
- **Authentication**: NextAuth.js v4
- **Database**: MongoDB with Mongoose
- **API Integration**: CoinGecko API for market data
- **State Management**: TanStack Query (React Query) v5
- **Form Handling**: React Hook Form + Zod v4 validation
- **Caching**: Advanced cache management with React Query

### Web3 & Blockchain
- **Wallet Connection**: RainbowKit v2
- **Web3 Library**: Wagmi v2 + Viem v2
- **Supported Chains**: Ethereum, Polygon, Optimism, Arbitrum, Base, BNB Chain
- **Multi-Chain Support**: EVM-compatible blockchain integration

### AI & Analysis
- **AI SDK**: Vercel AI SDK v6
- **AI Provider**: OpenAI (GPT models)
- **Technical Analysis**: Custom trading analysis service
- **Markdown Rendering**: React Markdown with GFM support

## Getting Started 🚀

### Prerequisites

- Node.js 20+ 
- MongoDB database (local or cloud)
- CoinGecko API access (free tier works)
- OpenAI API key (for AI Trading Assistant)
- WalletConnect Project ID (for wallet integration)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/wasiiff/blokk-lens.git
cd blokk-lens
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory (see `.env.example`):

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000

# CoinGecko API (optional - free tier available)
COINGECKO_API_KEY=your_coingecko_api_key

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
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure 📁

```
blokk-lens/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── register/         # User registration
│   │   │   ├── wallet/           # Wallet authentication
│   │   │   └── [...nextauth]/    # NextAuth configuration
│   │   ├── chat-history/         # AI chat history
│   │   ├── coins/                # Cryptocurrency data endpoints
│   │   │   ├── favorites/        # User favorites
│   │   │   ├── global/           # Global market stats
│   │   │   ├── market/           # Market data
│   │   │   ├── search/           # Coin search
│   │   │   ├── stats/            # Coin statistics
│   │   │   ├── trending/         # Trending coins
│   │   │   └── [id]/             # Individual coin data
│   │   ├── convert/              # Currency conversion
│   │   ├── favorites/            # Favorites management
│   │   ├── portfolio/            # Portfolio tracking
│   │   │   └── balances/         # Multi-chain balance fetching
│   │   ├── prices/               # Real-time prices
│   │   ├── trading-assistant/    # AI trading assistant
│   │   └── validate-api-key/     # API key validation
│   ├── auth/                     # Authentication pages
│   │   ├── login/                # Login page
│   │   └── register/             # Registration page
│   ├── coins/[id]/               # Dynamic coin detail pages
│   ├── convert/                  # Crypto converter page
│   ├── favorites/                # User favorites page
│   ├── portfolio/                # Portfolio tracking page
│   ├── trading-assistant/        # AI assistant page
│   ├── providers/                # React context providers
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/                   # React Components
│   ├── auth/                     # Authentication components
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   ├── WalletConnectButton.tsx
│   │   └── WalletLoginForm.tsx
│   ├── coins/                    # Cryptocurrency components
│   │   ├── CoinCard.tsx
│   │   ├── CoinDetailClient.tsx
│   │   ├── ConversionClient.tsx
│   │   ├── CurrencySelector.tsx
│   │   ├── DraggableTradingAssistant.tsx
│   │   ├── FavoritesClient.tsx
│   │   ├── MarketOverview.tsx
│   │   ├── SearchContainer.tsx
│   │   ├── TrendingSection.tsx
│   │   └── VirtualizedCoinSelector.tsx
│   ├── portfolio/                # Portfolio components
│   │   ├── ChainBalanceCard.tsx
│   │   ├── EmptyPortfolio.tsx
│   │   ├── PortfolioAssetsList.tsx
│   │   ├── PortfolioChart.tsx
│   │   ├── PortfolioClient.tsx
│   │   ├── PortfolioHeader.tsx
│   │   ├── PortfolioStats.tsx
│   │   └── WalletConnectPrompt.tsx
│   ├── trading-assistant/        # AI assistant components
│   │   ├── ChatMarkdown.tsx
│   │   ├── PriceChart.tsx
│   │   └── TradingAssistantRedesigned.tsx # Main Assistant Interface
│   ├── ui/                       # Reusable UI components
│   │   ├── background-patterns.tsx
│   │   ├── borderbeam.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── ... (more UI components)
│   └── theme-provider.tsx        # Theme management
├── lib/                          # Utility Libraries
│   ├── hooks/                    # Custom React hooks
│   │   ├── useCacheBuster.ts
│   │   ├── useDebounce.ts
│   │   ├── usePageVisibility.ts
│   │   └── usePortfolio.ts
│   ├── validators/               # Zod validation schemas
│   │   ├── auth.ts
│   │   └── favorite.ts
│   ├── ai-config.ts              # AI configuration
│   ├── auth.ts                   # NextAuth configuration
│   ├── cache-manager.ts          # Cache management
│   ├── db.ts                     # MongoDB connection
│   ├── middleware.ts             # API middleware
│   ├── password.ts               # Password hashing
│   ├── react-query.ts            # React Query setup
│   ├── utils.ts                  # Utility functions
│   └── wagmi.ts                  # Web3 configuration
├── models/                       # MongoDB Models
│   ├── ChatHistory.ts            # AI chat history
│   ├── Favorites.ts              # User favorites
│   └── User.ts                   # User model
├── services/                     # API Services
│   ├── api.ts                    # Frontend API client
│   ├── coingecko.ts              # CoinGecko integration
│   ├── queries.ts                # React Query hooks
│   └── trading-analysis.ts       # Technical analysis
├── types/                        # TypeScript Types
│   ├── next-auth.d.ts            # NextAuth type extensions
│   └── types.ts                  # Global types
└── public/                       # Static Assets
    └── ... (images, SVGs, etc.)
```

## Features in Detail 📝

### Market Data & Tracking
- **Real-time Price Updates**: Live cryptocurrency prices with automatic refresh every 60 seconds
- **Infinite Scroll Loading**: Progressive loading of all coins without pagination
- **Optimized Rate Limiting**: Smart caching strategy to prevent API rate limits
  - 5-minute fresh cache
  - 15-minute stale-while-revalidate
  - 80% reduction in API calls
- **24h Price Change Indicators**: Visual indicators for price movements
- **Market Cap Rankings**: Sort and filter by market capitalization
- **Trending Coins**: Discover trending cryptocurrencies
- **Global Market Stats**: Total market cap, volume, and dominance metrics (calculated from top 1,000 coins)
- **Advanced Search**: Fast, virtualized search across thousands of coins
- **Detailed Coin Information**: Interactive price charts, market data, supply info, and comprehensive analytics

### Live Coin Analytics
- **Auto-Refresh**: Data updates every 60 seconds automatically
- **Multi-Timeframe Analysis**: 
  - 24 Hours, 7 Days, 30 Days, 1 Year price changes
  - Color-coded trend indicators
- **Market Stats**:
  - 24h High/Low prices
  - Trading volume with Vol/MCap ratio
  - All-Time High with distance indicator
- **Supply & Valuation**:
  - Market Cap with 24h change
  - Fully Diluted Valuation
  - Circulating vs Total Supply
- **Price Performance**: Visual indicators across multiple timeframes

### Interactive Price Charts
- **Time Period Selector**: Choose from 7D, 30D, 90D, 1Y, or MAX
- **Technical Indicators**:
  - SMA 20 & SMA 50 (Simple Moving Averages)
  - RSI (Relative Strength Index)
  - MACD (Moving Average Convergence Divergence)
  - Volatility metrics
- **Smart Caching**: Each timeframe cached independently for instant loading
- **Responsive Design**: Optimized for all screen sizes
- **Error Recovery**: Graceful fallback with retry options

### Portfolio Management
- **Multi-Chain Support**: Track assets across 8+ EVM-compatible blockchains
  - Ethereum, Polygon, BNB Chain, Arbitrum, Optimism, Base, Avalanche, Fantom
- **Automatic Token Detection**: Detects native tokens and popular ERC-20 tokens
- **Real-time Valuation**: USD value calculation for all holdings
- **Asset Distribution**: Visual breakdown of portfolio composition
- **Chain-by-Chain View**: Organized display of assets per blockchain
- **Wallet Integration**: Seamless connection via RainbowKit

### AI Trading Assistant
- **Intelligent Analysis**: AI-powered market insights and trading recommendations
- **Technical Indicators**: Automated technical analysis (RSI, MACD, Moving Averages)
- **Backtesting Engine**: Test trading strategies with historical data
- **Market Sentiment**: AI-driven sentiment analysis
- **Price Predictions**: Data-driven price forecasts
- **Chat Interface**: Natural language interaction with the AI
- **Persistent History**: Save and review past conversations
- **Real-time Data Integration**: AI responses based on current market data
- **Draggable Interface**: Floating assistant that can be moved and resized

### Crypto Converter
- **Real-time Conversion**: Convert between any supported cryptocurrencies
- **Live Exchange Rates**: Up-to-date conversion rates from CoinGecko
- **Popular Pairs**: Quick access to commonly traded pairs
- **Bidirectional Conversion**: Instant swap between from/to currencies
- **Visual Design**: Beautiful UI with animated backgrounds

### Authentication & Security
- **Multiple Auth Methods**: Email/password and wallet-based authentication
- **Secure Password Hashing**: bcrypt encryption for user passwords
- **JWT Sessions**: Secure session management with NextAuth.js
- **Wallet Signatures**: Cryptographic signature verification for wallet login
- **Protected Routes**: Middleware-based route protection

### User Experience
- **Favorites System**: Save and quickly access your favorite coins
- **Persistent Storage**: User preferences saved in MongoDB
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Dark/Light Themes**: System preference detection with manual toggle
- **Smooth Animations**: Framer Motion powered transitions
- **Lenis Smooth Scroll**: Buttery smooth scrolling experience
- **Loading States**: Skeleton loaders and loading indicators
- **Error Handling**: Graceful error messages and fallbacks
- **Glassmorphism UI**: Modern frosted glass effects
- **BorderBeam Effects**: Animated border effects on key components
- **SVG Decorations**: Custom decorative elements throughout

## API Routes 🔌

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/wallet` - Wallet-based authentication
- `GET/POST /api/auth/[...nextauth]` - NextAuth endpoints

### Cryptocurrency Data
- `GET /api/coins/market` - Fetch market coins with infinite scroll support (supports up to 250 per request)
- `GET /api/coins/trending` - Fetch trending coins (cached)
- `GET /api/coins/search` - Search coins by name/symbol
- `GET /api/coins/[id]` - Fetch detailed coin information (auto-refreshes every 60s)
- `GET /api/coins/chart` - Fetch price chart data with timeframe support (7d, 30d, 90d, 1y, max)
- `GET /api/coins/stats` - Get aggregated coin statistics (top 1,000 coins)
- `GET /api/coins/global` - Global market statistics
- `GET /api/coins/favorites` - Get user's favorite coins with market data

### Portfolio & Wallet
- `GET /api/portfolio/balances` - Fetch multi-chain wallet balances
  - Supports: Ethereum, Polygon, BNB Chain, Arbitrum, Optimism, Base, Avalanche, Fantom
  - Detects native tokens and popular ERC-20 tokens
  - Returns USD values and portfolio analytics

### Conversion
- `GET /api/convert` - Convert between cryptocurrencies with real-time rates

### Favorites Management
- `GET /api/favorites` - Get user favorites list
- `POST /api/favorites` - Add coin to favorites
- `DELETE /api/favorites` - Remove coin from favorites

### AI Trading Assistant
- `POST /api/trading-assistant` - AI-powered trading analysis and chat
  - Streaming responses
  - Technical analysis integration
  - Market data integration
  - Backtesting support

### Backtesting
- `GET /api/backtest` - Run backtests on trading strategies
  - Historical data analysis
  - Strategy performance metrics
  - Risk/reward calculations

### Chat History
- `GET /api/chat-history` - Retrieve user's chat history
- `POST /api/chat-history` - Save chat messages

### Utilities
- `GET /api/prices` - Fetch real-time prices for multiple coins
- `POST /api/validate-api-key` - Validate CoinGecko API key

## Performance Optimizations ⚡

### Caching Strategy
- **React Query**: Client-side caching with configurable stale times
- **API Route Caching**: Advanced caching with stale-while-revalidate
  - Market data: 5-minute fresh, 15-minute stale
  - Chart data: 5-minute fresh, 15-minute stale
  - Stats data: 5-minute fresh cache
- **Cache Manager**: Custom cache management for frequently accessed data
- **Image Optimization**: Next.js Image component with automatic optimization
- **Rate Limit Protection**: 30 requests/minute client-side limiting

### Data Fetching
- **Parallel Requests**: Simultaneous API calls for faster loading
- **Infinite Scroll**: Progressive loading without pagination
- **Batch Loading**: 50-100 coins per request for optimal performance
- **Virtualization**: React Window for rendering large lists
- **Debouncing**: Optimized search with 300ms debounced inputs
- **Background Refresh**: Stale data returned immediately while fetching fresh data

### Code Optimization
- **React Compiler**: Babel plugin for automatic optimization
- **Tree Shaking**: Automatic removal of unused code
- **Code Splitting**: Dynamic imports for route-based splitting
- **Bundle Analysis**: Optimized bundle sizes
- **Memoization**: useMemo and useCallback for expensive computations

## Environment Variables 🔐

Required environment variables (see `.env.example`):

```env
# Database
MONGODB_URI=                      # MongoDB connection string

# Authentication
NEXTAUTH_SECRET=                  # Secret for NextAuth.js
NEXTAUTH_URL=                     # Application URL

# APIs
COINGECKO_API_KEY=               # CoinGecko API key (optional)
OPENAI_API_KEY=                  # OpenAI API key (required for AI features)

# Web3
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=  # WalletConnect project ID

# Optional: Custom RPC URLs
ETHEREUM_RPC_URL=
POLYGON_RPC_URL=
BSC_RPC_URL=
ARBITRUM_RPC_URL=
OPTIMISM_RPC_URL=
BASE_RPC_URL=
AVALANCHE_RPC_URL=
FANTOM_RPC_URL=
```

## Contributing 🤝

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

Quick start:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security 🔒

Security is a top priority. Please see [SECURITY.md](SECURITY.md) for:
- Reporting vulnerabilities
- Security best practices
- Supported versions

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 🙏

- [CoinGecko](https://www.coingecko.com/) - Cryptocurrency data API
- [Shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Next.js](https://nextjs.org/) - React framework
- [RainbowKit](https://www.rainbowkit.com/) - Wallet connection
- [Vercel](https://vercel.com/) - AI SDK and hosting
- [OpenAI](https://openai.com/) - AI-powered insights
- [TanStack Query](https://tanstack.com/query) - Data fetching and caching

## Support & Community 💬

- **Issues**: [GitHub Issues](https://github.com/wasiiff/blokk-lens/issues)
- **Discussions**: [GitHub Discussions](https://github.com/wasiiff/blokk-lens/discussions)
- **Documentation**: Check the `/docs` folder for detailed guides

## Roadmap 🗺️

### Completed ✅
- [x] Infinite scroll market view with rate limit optimization
- [x] Live analytics with auto-refresh (60s intervals)
- [x] Multi-timeframe price charts (7D, 30D, 90D, 1Y, MAX)
- [x] Advanced caching with stale-while-revalidate
- [x] Technical indicators (RSI, MACD, SMA)
- [x] Backtesting engine
- [x] AI trading assistant with chat history
- [x] Multi-chain portfolio tracking
- [x] Wallet integration with RainbowKit

### Upcoming Features
- [ ] Advanced portfolio analytics and reporting
- [ ] Real-time WebSocket price updates
- [ ] Candlestick charts (OHLC)
- [ ] More technical indicators (Bollinger Bands, Fibonacci)
- [ ] Price alerts and notifications
- [ ] Social trading features
- [ ] DeFi protocol integration
- [ ] NFT portfolio tracking
- [ ] News aggregation
- [ ] Mobile app (React Native)
- [ ] Multi-language support

## Development Status 🚧

Current Version: **0.1.0** (Beta)

This project is actively maintained and under continuous development. We release updates regularly with new features, improvements, and bug fixes.

---

**Built with ❤️ by [Wasif Bin Nasir](https://github.com/wasiiff)**

**Star ⭐ this repository if you find it helpful!**
