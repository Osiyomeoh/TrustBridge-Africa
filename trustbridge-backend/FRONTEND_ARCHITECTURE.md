# TrustBridge Frontend Architecture

## 🏗️ Overall Architecture

### **Technology Stack**
- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS + Shadcn/ui
- **State Management**: Zustand + React Query
- **Blockchain**: Wagmi + Viem (Hedera integration)
- **Charts**: Recharts + TradingView widgets
- **Maps**: Mapbox GL JS
- **Authentication**: NextAuth.js + WalletConnect
- **Real-time**: Socket.io client
- **Mobile**: React Native (shared components)

### **Project Structure**
```
trustbridge-frontend/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── (auth)/            # Auth routes
│   │   ├── (dashboard)/       # Protected dashboard
│   │   ├── (public)/          # Public pages
│   │   └── api/               # API routes
│   ├── components/            # Reusable components
│   │   ├── ui/               # Base UI components
│   │   ├── forms/            # Form components
│   │   ├── charts/           # Chart components
│   │   ├── maps/             # Map components
│   │   └── blockchain/       # Blockchain components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities and configs
│   ├── stores/               # Zustand stores
│   ├── types/                # TypeScript types
│   └── styles/               # Global styles
├── public/                   # Static assets
└── docs/                     # Documentation
```

## 🎨 User Interface Design

### **Design System**
- **Primary Colors**: 
  - Green (#10B981) - Trust, Growth, Agriculture
  - Blue (#3B82F6) - Technology, Blockchain
  - Gold (#F59E0B) - Value, Investment
- **Typography**: Inter (Primary), JetBrains Mono (Code)
- **Spacing**: 4px base unit (Tailwind default)
- **Border Radius**: 8px (Cards), 12px (Modals)
- **Shadows**: Subtle elevation system

### **Component Library (Shadcn/ui)**
```typescript
// Core UI Components
- Button (Primary, Secondary, Ghost, Destructive)
- Card (Default, Elevated, Interactive)
- Input (Text, Number, Search, Password)
- Select (Single, Multi, Searchable)
- Modal (Dialog, Sheet, Popover)
- Table (Sortable, Filterable, Paginated)
- Chart (Line, Bar, Pie, Area)
- Map (Interactive, Markers, Clusters)
- Wallet (Connect, Disconnect, Switch)
- Notification (Toast, Alert, Banner)
```

## 🏠 Page Architecture

### **1. Landing Page (`/`)**
```typescript
// Hero Section
- Compelling headline: "Tokenize Real-World Assets in Africa"
- Value proposition: "Connect African assets to global investors"
- CTA buttons: "Start Investing", "List Your Asset"
- Live stats: TVL, Active Assets, Verified Attestors

// Features Section
- Asset Tokenization
- Professional Verification
- Global Investment Access
- Real-time Analytics

// How It Works
- Step 1: Asset Owner lists property
- Step 2: Professional verification
- Step 3: Tokenization on Hedera
- Step 4: Global investors participate

// Live Market Data
- Real-time price feeds (BTC, ETH, HBAR)
- Market TVL and statistics
- Recent transactions

// Testimonials
- Asset owner success stories
- Investor testimonials
- Attestor endorsements
```

### **2. Authentication (`/auth`)**
```typescript
// Login Options
- Email/Password
- Wallet Connect (MetaMask, HashPack)
- Social Login (Google, LinkedIn)

// Registration
- User type selection (Asset Owner, Investor, Attestor, Buyer)
- KYC/AML verification
- Wallet connection
- Profile setup

// Onboarding
- Role-specific tutorials
- Feature walkthroughs
- Sample data exploration
```

### **3. Dashboard (`/dashboard`)**
```typescript
// Layout
- Sidebar navigation
- Header with user profile
- Main content area
- Real-time notifications

// Dashboard Cards
- Portfolio value
- Active investments
- Pending verifications
- Recent activity
- Market performance
```

### **4. Asset Management (`/assets`)**
```typescript
// Asset List View
- Filterable table/grid
- Search functionality
- Status filters (Pending, Verified, Tokenized)
- Map view toggle

// Asset Detail View
- Property information
- Verification status
- Investment details
- Location map
- Documents gallery
- Performance charts

// Asset Creation Form
- Step 1: Basic information
- Step 2: Location and details
- Step 3: Financial information
- Step 4: Document upload
- Step 5: Verification submission
```

### **5. Investment Platform (`/investments`)**
```typescript
// Investment Discovery
- Asset marketplace
- Advanced filters
- Risk assessment
- ROI calculator

// Investment Detail
- Asset information
- Financial projections
- Risk analysis
- Investment form

// Portfolio Management
- Investment overview
- Performance tracking
- Transaction history
- Dividend tracking
```

### **6. Verification System (`/verification`)**
```typescript
// Attestor Dashboard
- Pending verifications
- Verification queue
- Tools and resources
- Performance metrics

// Verification Process
- Evidence review
- Site visit tools
- Document analysis
- Scoring system
- Attestation submission

// Verification Status
- Real-time updates
- Progress tracking
- Communication tools
```

### **7. Analytics (`/analytics`)**
```typescript
// Market Overview
- TVL trends
- Asset performance
- Geographic distribution
- Sector analysis

// Portfolio Analytics
- Investment performance
- Risk metrics
- Diversification analysis
- Return projections

// Real-time Data
- Live price feeds
- Market indicators
- News and updates
- Social sentiment
```

## 🔧 Technical Implementation

### **State Management Architecture**
```typescript
// Zustand Stores
interface AppStore {
  user: User | null;
  wallet: WalletState;
  assets: Asset[];
  investments: Investment[];
  notifications: Notification[];
}

// React Query for Server State
const useAssets = () => useQuery({
  queryKey: ['assets'],
  queryFn: fetchAssets,
  staleTime: 30000,
});

// Real-time Updates
const useWebSocket = () => {
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL);
    socket.on('asset:updated', updateAsset);
    socket.on('investment:created', addInvestment);
    return () => socket.disconnect();
  }, []);
};
```

### **Blockchain Integration**
```typescript
// Wagmi Configuration
const config = createConfig({
  chains: [hederaTestnet],
  connectors: [
    new MetaMaskConnector(),
    new WalletConnectConnector(),
  ],
});

// Hedera Integration
const useHedera = () => {
  const { data: account } = useAccount();
  const { data: balance } = useBalance({ address: account?.address });
  
  const createAsset = useMutation({
    mutationFn: (assetData) => hederaService.createAsset(assetData),
  });
  
  return { account, balance, createAsset };
};
```

### **Real-time Features**
```typescript
// Live Price Feeds
const usePriceFeeds = () => {
  return useQuery({
    queryKey: ['priceFeeds'],
    queryFn: fetchPriceFeeds,
    refetchInterval: 10000,
  });
};

// WebSocket Integration
const useRealTimeUpdates = () => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL);
    
    socket.on('price:updated', (data) => {
      queryClient.setQueryData(['priceFeeds'], data);
    });
    
    socket.on('asset:verified', (asset) => {
      queryClient.invalidateQueries(['assets']);
    });
  }, [queryClient]);
};
```

## 📱 Mobile Architecture

### **React Native Implementation**
```typescript
// Shared Components
- UI components (Button, Card, Input)
- Blockchain components (Wallet, Transaction)
- Chart components (Performance, Analytics)

// Mobile-Specific Features
- Push notifications
- Offline sync
- Camera integration
- GPS location
- Biometric authentication

// Navigation
- Tab navigation (Home, Assets, Portfolio, Profile)
- Stack navigation (Asset details, Investment flow)
- Modal navigation (Wallet connect, Verification)
```

## 🎯 User Experience Flow

### **Asset Owner Journey**
1. **Landing** → Sign up as Asset Owner
2. **Onboarding** → Complete profile and KYC
3. **Asset Creation** → List property with details
4. **Verification** → Submit documents and evidence
5. **Tokenization** → Convert to tradeable tokens
6. **Management** → Monitor performance and investors

### **Investor Journey**
1. **Discovery** → Browse available assets
2. **Analysis** → Review details and performance
3. **Investment** → Purchase tokens
4. **Portfolio** → Track investments
5. **Returns** → Monitor dividends and growth

### **Attestor Journey**
1. **Registration** → Apply as professional attestor
2. **Verification** → Complete credential verification
3. **Dashboard** → View pending verifications
4. **Assessment** → Review and score assets
5. **Attestation** → Submit professional opinion

## 🔐 Security & Performance

### **Security Measures**
- JWT token authentication
- Wallet signature verification
- Input validation and sanitization
- Rate limiting
- CSRF protection
- Content Security Policy

### **Performance Optimization**
- Next.js Image optimization
- Code splitting and lazy loading
- Service worker for offline support
- CDN for static assets
- Database query optimization
- Real-time data caching

## 🚀 Deployment Architecture

### **Frontend Deployment**
- **Platform**: Vercel (Primary) / Netlify (Backup)
- **CDN**: Cloudflare
- **Monitoring**: Sentry + Vercel Analytics
- **Testing**: Playwright + Jest

### **Environment Configuration**
```typescript
// Environment Variables
NEXT_PUBLIC_API_URL=https://api.trustbridge.africa
NEXT_PUBLIC_WS_URL=wss://ws.trustbridge.africa
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_CHAINLINK_FEEDS=btc,eth,link,hbar
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx
```

## 📊 Analytics & Monitoring

### **User Analytics**
- Page views and user flows
- Feature usage tracking
- Conversion funnels
- A/B testing framework

### **Performance Monitoring**
- Core Web Vitals
- API response times
- Error tracking
- Real user monitoring

## 🎨 Design Mockups

### **Key Screens**
1. **Landing Page**: Hero + Features + Market Data
2. **Dashboard**: Portfolio overview + Quick actions
3. **Asset Marketplace**: Grid/List view + Filters
4. **Asset Detail**: Information + Investment form
5. **Portfolio**: Performance charts + Transaction history
6. **Verification**: Attestor tools + Evidence review
7. **Analytics**: Market trends + Portfolio insights

### **Mobile Screens**
1. **Home**: Dashboard + Quick stats
2. **Discover**: Asset browsing + Search
3. **Portfolio**: Investment overview + Performance
4. **Profile**: Settings + Wallet management
5. **Notifications**: Real-time updates + Alerts

This architecture provides a comprehensive, scalable, and user-friendly frontend that leverages our 100% working backend to create a world-class RWA tokenization platform for the Hedera Africa Hackathon 2025.
