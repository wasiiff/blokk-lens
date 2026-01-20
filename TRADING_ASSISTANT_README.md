# AI Trading Assistant - Complete Guide

## Overview

The AI Trading Assistant is an advanced chatbot interface that provides intelligent cryptocurrency trading insights, technical analysis, and market predictions. It leverages:

- **Vercel AI SDK** for streaming AI responses
- **OpenAI GPT-4** for intelligent analysis
- **CoinGecko API** for real-time market data
- **Technical Analysis Engine** for indicators (RSI, MACD, SMA, etc.)
- **MongoDB** for chat history persistence
- **Modern UI** with animations and suggested prompts

## Features

### 🤖 AI-Powered Analysis
- Real-time cryptocurrency analysis
- Technical indicator interpretation (RSI, MACD, Moving Averages)
- Market trend predictions based on historical data
- Risk management advice
- Portfolio recommendations

### 📊 Technical Analysis
- **RSI (Relative Strength Index)**: Identifies overbought/oversold conditions
- **MACD (Moving Average Convergence Divergence)**: Momentum indicator
- **SMA (Simple Moving Averages)**: 20-day and 50-day trends
- **Volatility Analysis**: Standard deviation calculations
- **Trend Detection**: Bullish, bearish, or neutral market conditions

### 💬 Chat Features
- Persistent chat history (saved to MongoDB)
- Context-aware conversations
- Suggested prompts for easy onboarding
- Copy message functionality
- Real-time streaming responses
- Session management

### 📈 Interactive Charts
- Price history visualization with Recharts
- Moving average overlays (SMA 20, SMA 50)
- Technical indicator displays
- Responsive and interactive tooltips

## Setup Instructions

### 1. Install Dependencies

```bash
npm install ai @ai-sdk/openai @ai-sdk/react recharts date-fns @radix-ui/react-dialog
```

### 2. Environment Variables

Add to your `.env` file:

```env
# OpenAI API Key (required)
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Vercel AI Gateway for production
AI_GATEWAY_URL=https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_ID

# MongoDB (for chat history)
MONGODB_URI=your_mongodb_connection_string

# CoinGecko API
COINGECKO_BASE_URL=https://api.coingecko.com/api/v3
```

### 3. Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy and add to `.env` file

### 4. Optional: Vercel AI Gateway Setup

For production use with rate limiting and caching:

1. Go to [Vercel AI Gateway](https://vercel.com/docs/ai-gateway)
2. Create a gateway
3. Get your gateway URL
4. Add to `.env` as `AI_GATEWAY_URL`

## Usage

### Standalone Trading Assistant Page

Access at: `/trading-assistant`

```tsx
import TradingAssistant from '@/components/trading-assistant/TradingAssistant';

export default function TradingAssistantPage() {
  return <TradingAssistant />;
}
```

### Coin-Specific Analysis

Integrated into coin detail pages with context:

```tsx
import CoinAnalysisChat from '@/components/trading-assistant/CoinAnalysisChat';

<CoinAnalysisChat 
  coinId="bitcoin" 
  coinSymbol="BTC" 
  coinName="Bitcoin"
/>
```

### Price Chart with Technical Indicators

```tsx
import PriceChart from '@/components/trading-assistant/PriceChart';

<PriceChart coinId="bitcoin" days={30} />
```

## Suggested Prompts

The assistant comes with pre-configured prompts to help users get started:

### Analysis Prompts
- "Analyze the current Bitcoin price trend and provide trading insights"
- "What are good entry and exit points for Cardano right now?"

### Educational Prompts
- "Explain RSI, MACD, and Moving Averages for Ethereum"
- "How should I manage risk when trading volatile altcoins?"

### Prediction Prompts
- "Based on historical data, what's your prediction for Solana in the next week?"

### Strategy Prompts
- "Suggest a balanced crypto portfolio for a moderate risk tolerance"

## Technical Architecture

### API Route: `/api/trading-assistant`

```typescript
POST /api/trading-assistant
Body: {
  messages: Message[],
  sessionId: string,
  coinId?: string
}
```

**Features:**
- Streams AI responses using Vercel AI SDK
- Fetches real-time market data from CoinGecko
- Performs technical analysis on price history
- Saves chat history to MongoDB
- Provides context-aware responses

### Trading Analysis Engine

Located in `services/trading-analysis.ts`:

```typescript
// Calculate technical indicators
const indicators = TradingAnalyzer.analyzePriceData(prices);

// Generate trading signals
const signals = TradingAnalyzer.generateSignals(indicators, currentPrice);
```

**Indicators Calculated:**
- SMA (20, 50)
- RSI (14)
- MACD
- Volatility
- Trend direction

### Chat History Model

```typescript
interface IChatHistory {
  userId: string;
  sessionId: string;
  messages: IChatMessage[];
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## API Endpoints

### Trading Assistant
- `POST /api/trading-assistant` - Stream AI responses with market context

### Chat History
- `GET /api/chat-history?sessionId=xxx` - Get specific chat session
- `GET /api/chat-history` - Get all user chat sessions
- `DELETE /api/chat-history?sessionId=xxx` - Delete chat session

## Customization

### Modify System Prompt

Edit `app/api/trading-assistant/route.ts`:

```typescript
const SYSTEM_PROMPT = `Your custom prompt here...`;
```

### Add More Suggested Prompts

Edit `components/trading-assistant/TradingAssistant.tsx`:

```typescript
const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    icon: <YourIcon />,
    title: "Your Title",
    prompt: "Your prompt text",
    category: "Category"
  },
  // Add more...
];
```

### Customize Technical Indicators

Edit `services/trading-analysis.ts` to add new indicators:

```typescript
static calculateNewIndicator(prices: number[]): number {
  // Your calculation logic
}
```

## Best Practices

### 1. Rate Limiting
Implement rate limiting for API calls to prevent abuse:

```typescript
// Use Vercel AI Gateway or implement custom rate limiting
```

### 2. Error Handling
Always handle API errors gracefully:

```typescript
try {
  const result = await streamText({ ... });
} catch (error) {
  console.error('Trading assistant error:', error);
  return new Response(JSON.stringify({ error: 'Failed' }), { status: 500 });
}
```

### 3. User Authentication
Protect sensitive features with authentication:

```typescript
const session = await getServerSession(authOptions);
if (!session?.user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### 4. Caching
Cache CoinGecko API responses to reduce API calls:

```typescript
next: { revalidate: 60 } // Cache for 60 seconds
```

## Troubleshooting

### Issue: AI responses not streaming
**Solution:** Ensure `OPENAI_API_KEY` is set correctly and you have API credits

### Issue: Chart not displaying
**Solution:** Check that CoinGecko API is accessible and returning data

### Issue: Chat history not saving
**Solution:** Verify MongoDB connection and user authentication

### Issue: Technical indicators showing NaN
**Solution:** Ensure sufficient price data (at least 50 data points for SMA 50)

## Performance Optimization

1. **Lazy Loading**: Components are loaded only when needed
2. **Memoization**: React.memo used for message components
3. **Streaming**: AI responses stream in real-time
4. **Caching**: API responses cached appropriately
5. **Debouncing**: Input debounced to prevent excessive API calls

## Security Considerations

1. **API Key Protection**: Never expose OpenAI API key to client
2. **Input Validation**: Validate all user inputs
3. **Rate Limiting**: Implement per-user rate limits
4. **Authentication**: Require auth for chat history
5. **Content Filtering**: Monitor for inappropriate content

## Future Enhancements

- [ ] Multi-coin comparison analysis
- [ ] Portfolio tracking integration
- [ ] Price alerts based on AI predictions
- [ ] Advanced charting with TradingView
- [ ] Voice input/output
- [ ] Multi-language support
- [ ] Export chat history as PDF
- [ ] Integration with trading platforms
- [ ] Backtesting capabilities
- [ ] Social sentiment analysis

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the code comments
3. Check OpenAI API status
4. Verify CoinGecko API availability

## License

This trading assistant is part of the CryptoPulse project.

---

**Disclaimer**: This AI assistant provides educational information only. It is NOT financial advice. Always do your own research (DYOR) and consult with financial professionals before making investment decisions. Cryptocurrency trading involves significant risk.
