---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - docs/specifications/07-pricing-intelligence-system.md
---
# Pricing Intelligence System - Epic Breakdown

## Overview

This document decomposes 07-pricing-intelligence-system into implementation-ready epics and stories for BMAD execution.

## Requirements Inventory

### Functional Requirements

- Market Data Aggregation & Analysis
- AI-Powered Price Predictions
- Portfolio Tracking & Management
- Market Intelligence & Research
- Price Alerts & Notifications
- Market Reporting & Analytics

### NonFunctional Requirements

- Technical requirements are synchronized from the source specification.
- Security and performance constraints are synchronized from the source specification.

### Additional Requirements

- Business rules and integration constraints remain authoritative in the source specification.

### FR Coverage Map

- Epic-to-story coverage is represented by the complete story list below.

## Epic List

- Market Data Aggregation & Analysis
- AI-Powered Price Predictions
- Portfolio Tracking & Management
- Market Intelligence & Research
- Price Alerts & Notifications
- Market Reporting & Analytics

## Story Index

- Multi-Source Price Aggregation
- Advanced Market Analytics
- Real-Time Price Monitoring
- Machine Learning Price Forecasting
- Intelligent Market Insights
- Predictive Portfolio Management
- Comprehensive Portfolio Tracking
- Advanced Portfolio Analytics
- Investment Goal Management
- Comprehensive Market Research Tools
- Educational Content & Market Commentary
- Custom Research & Analysis Tools
- Intelligent Price Alert System
- Market Opportunity Detection
- Professional Market Reports
- Performance Benchmarking

## Full Epic and Story Breakdown

### Epic 1: Market Data Aggregation & Analysis

#### User Story 1.1: Multi-Source Price Aggregation

_As a collector, I want accurate pricing information from multiple sources so that I can make informed buying and selling decisions._

**UI/UX Implementation:**

- **Pages**: `/pricing/dashboard` (Pricing overview), `/cards/:cardId/pricing` (Individual card pricing)
- **Components**:
  - PriceAggregator component with multi-source data visualization
  - MarketComparison component showing vendor price differences
  - ConditionPricing component with grade-specific valuations
  - HistoricalChart component with interactive price timeline
  - DataQuality component with source reliability indicators
- **Price Overview Dashboard**:
  - Multi-source price comparison table with vendor logos and last updated timestamps
  - Volume-weighted average price prominently displayed with confidence indicators
  - Price range visualization showing min/max with outlier flagging
  - "Best deal" highlighting with shipping cost integration
- **Source Integration Display**:
  - Data source badges showing TCGPlayer, eBay, Card Kingdom, local stores
  - Source reliability scoring with visual trust indicators
  - Real-time update status with "last refreshed" timestamps
  - Data quality metrics with accuracy percentages and validation status
- **Condition-Based Pricing Interface**:
  - Condition selector with visual condition guide (Near Mint, Lightly Played, etc.)
  - Price impact visualization showing condition premium/discount
  - Professional grading integration (PSA, BGS) with certified prices
  - Community condition consensus with photo verification
- **Historical Price Visualization**:
  - Interactive price charts with customizable time ranges (1D, 1W, 1M, 1Y, All)
  - Event correlation markers showing tournament results, set releases, ban announcements
  - Volume overlay showing trading activity patterns
  - Price milestone markers with significant price level annotations
- **International Market Integration**:
  - Multi-currency display with real-time exchange rate integration
  - Regional price variations with geographic heat maps
  - Import/export cost calculations for international purchasing
  - Local market insights with country-specific vendor integration
- **Data Validation Interface**:
  - Outlier detection with flagged suspicious prices
  - Community reporting system for incorrect pricing data
  - Automated data quality checks with confidence scoring
  - Manual override system for verified pricing corrections
- **Mobile Pricing Interface**:
  - Simplified price comparison with swipeable vendor cards
  - Quick price check with barcode/camera scanning
  - Price alert setup with customizable notification thresholds
  - Voice search for rapid card price lookup

**Acceptance Criteria:**

- ✅ Real-time price scraping from major TCG marketplaces (TCGPlayer, eBay, Card Kingdom, etc.) (IMPLEMENTED)
  - Location: Price scraping system with multiple sources in pricing types
- ✅ Integration with auction sites for completed sale price tracking (IMPLEMENTED)
  - Location: `PriceHistory` entity tracks sale data with source attribution
- ✅ Local game store pricing integration for regional market insights (IMPLEMENTED)
  - Location: Multiple price source integration with vendor pricing
- ✅ Condition-based pricing with accurate grading and assessment (IMPLEMENTED)
  - Location: Condition-specific pricing in `MarketPrice` entity and pricing API
- ✅ Volume-weighted average pricing for better market representation (IMPLEMENTED)
  - Location: `market_price` field with weighted calculations in pricing system
- ✅ Historical price tracking with trend analysis and pattern recognition (IMPLEMENTED)
  - Location: `PriceHistoryChart` component and price history API endpoints
- 🔄 Multi-currency support for international market data (PARTIAL)
  - Location: Currency field exists in types but implementation needs verification
- ✅ Data quality validation and outlier detection for pricing accuracy (IMPLEMENTED)
  - Location: `is_outlier` flag and `confidence_score` in price data validation
- 🔄 API integration with official publisher pricing when available (PARTIAL)
  - Location: Publisher pricing structure exists but integration unclear
- ✅ Community-contributed pricing data with verification and weighting systems (IMPLEMENTED)
  - Location: Price source weighting and community data integration

#### User Story 1.2: Advanced Market Analytics

_As an investor, I want detailed market analytics so that I can identify trends and investment opportunities in the TCG market._

**UI/UX Implementation:**

- **Pages**: `/analytics/market` (Market analytics dashboard), `/analytics/trends` (Trend analysis)
- **Components**:
  - MarketTrends component with multi-timeframe analysis
  - VolatilityAnalysis component with risk assessment visualization
  - CorrelationMatrix component showing inter-card relationships
  - SeasonalPatterns component with predictive overlays
  - MarketCap component with trading volume integration
- **Market Analytics Dashboard**:
  - Key performance indicators: Total market cap, daily volume, volatility index
  - Market trend visualization with bull/bear/sideways indicators
  - Top gainers/losers with percentage change and volume data
  - Market breadth indicators showing advancing vs. declining card prices
- **Trend Analysis Interface**:
  - Multi-timeframe chart switcher (1D, 1W, 1M, 3M, 1Y, 5Y)
  - Trend line drawing tools with automatic support/resistance detection
  - Moving average overlays with customizable periods
  - Technical indicators (RSI, MACD, Bollinger Bands) with parameter adjustment
- **Volatility and Risk Assessment**:
  - Volatility heatmap showing risk levels across different card categories
  - Risk-return scatter plots with efficient frontier visualization
  - Value-at-Risk calculations with confidence intervals
  - Correlation matrices with color-coded relationship strength
- **Seasonal Pattern Analysis**:
  - Calendar heatmap showing seasonal price performance
  - Holiday and tournament event impact visualization
  - Cyclical pattern detection with prediction overlays
  - Year-over-year comparison with statistical significance testing
- **Market Segment Analysis**:
  - Game-by-game performance comparison (MTG vs. Pokémon vs. Yu-Gi-Oh!)
  - Format-specific analysis with rotation impact assessment
  - Rarity tier performance with luxury vs. accessible card tracking
  - Regional market comparison with cultural and economic factors
- **Economic Integration Dashboard**:
  - Macro-economic indicator correlation (inflation, GDP, gaming industry health)
  - Tournament schedule integration with competitive format impact
  - Social media sentiment analysis with market correlation
  - News event impact analysis with automatic categorization
- **Manipulation Detection Interface**:
  - Unusual activity alerts with investigation prompts
  - Pump and dump pattern recognition with historical examples
  - Coordinated buying/selling detection across multiple cards
  - Market maker identification and their impact analysis
- **Mobile Analytics Experience**:
  - Simplified analytics with key insights and trend summaries
  - Swipeable chart interface with gesture-based navigation
  - Voice-activated market queries ("How is MTG performing this month?")
  - Push notifications for significant market movements and opportunities

**Acceptance Criteria:**

- ✅ Comprehensive market trend analysis with multiple time horizons (daily, weekly, monthly, yearly) (IMPLEMENTED)
  - Location: `MarketReport` entity with trend analysis and `getTrendingCards` API
- 🔄 Volatility analysis and risk assessment for individual cards and collections (PARTIAL)
  - Location: `volatility_score` in MarketPrice but advanced risk assessment unclear
- ❌ Correlation analysis between different cards, sets, and market segments (NOT BUILT)
- ❌ Seasonal pattern detection and holiday/event impact analysis (NOT BUILT)
- 🔄 Market cap calculations and trading volume analysis for popular cards (PARTIAL)
  - Location: Volume tracking exists but market cap calculations need verification
- ❌ Comparative analysis between different TCG games and their market performance (NOT BUILT)
- ❌ Economic indicator integration (inflation, gaming industry trends, tournament schedules) (NOT BUILT)
- ❌ Market manipulation detection and unusual activity alerts (NOT BUILT)
- ❌ Demographic analysis of buyer and seller behavior patterns (NOT BUILT)
- ❌ Predictive modeling for format rotation impact and set release effects (NOT BUILT)

#### User Story 1.3: Real-Time Price Monitoring

_As an active trader, I want real-time price monitoring so that I can act quickly on market opportunities and price changes._

**UI/UX Implementation:**

- **Pages**: `/monitoring/live` (Real-time monitoring dashboard), `/alerts/manage` (Alert management)
- **Components**:
  - LivePriceFeed component with streaming data visualization
  - ArbitrageOpportunity component highlighting cross-platform price differences
  - AuctionMonitor component with ending auction alerts
  - PortfolioTracker component with real-time value updates
  - AlertManager component for notification customization
- **Live Price Feed Dashboard**:
  - Real-time price ticker showing actively traded cards with live updates
  - Color-coded price changes (green: up, red: down) with percentage indicators
  - Volume indicators with "Hot" badges for high-activity cards
  - Flash change notifications with brief highlight animations
- **Arbitrage Opportunity Interface**:
  - Cross-platform price comparison with profit margin calculations
  - "Quick profit" highlighting with shipping cost and fee considerations
  - Automated opportunity detection with customizable profit threshold filters
  - Historical arbitrage success rates with vendor-specific performance data
- **Auction Monitoring System**:
  - Live auction tracker with countdown timers and current bid displays
  - "Ending soon" alerts with customizable time thresholds (5min, 1hr, 24hr)
  - Bid history analysis with bidder pattern recognition
  - Snipe protection alerts for last-minute bidding opportunities
- **Real-Time Portfolio Tracking**:
  - Portfolio value updates with real-time market price integration
  - Daily P&L tracking with detailed gain/loss breakdowns
  - Position-level monitoring with individual card performance
  - Portfolio heat map showing which holdings are driving performance
- **Alert and Notification System**:
  - Customizable alert thresholds with percentage and dollar amount triggers
  - Multi-channel notifications: in-app, email, SMS, push notifications
  - Alert categories: Price movements, volume spikes, arbitrage opportunities
  - Smart notification bundling to prevent alert fatigue
- **Market Depth Visualization**:
  - Order book display showing buy/sell pressure at different price levels
  - Liquidity assessment with market impact calculations
  - Support and resistance level identification with automated marking
- **Emergency Alert System**:
  - Flash crash detection with immediate high-priority notifications
  - Market halt notifications for significant events or data issues
  - System status indicators with uptime and data feed health monitoring
- **Mobile Real-Time Experience**:
  - Simplified live feed with essential price movements
  - Push notification management with priority levels and quiet hours
  - Quick trade execution links to partnered marketplaces
  - Voice alerts for hands-free monitoring during other activities

**Acceptance Criteria:**

- ✅ Live price feeds with sub-minute update frequencies for actively traded cards (IMPLEMENTED)
  - Location: Real-time price monitoring with automated scraping jobs
- ✅ Instant price change notifications with customizable threshold settings (IMPLEMENTED)
  - Location: `PriceAlert` system with customizable thresholds and notification methods
- ✅ Real-time arbitrage opportunity detection across multiple marketplaces (IMPLEMENTED)
  - Location: Price comparison system across multiple sources
- ❌ Live auction monitoring with bid tracking and ending alerts (NOT BUILT)
- ❌ Market depth analysis showing buy/sell order distribution (NOT BUILT)
- 🔄 Flash crash and spike detection with immediate user notifications (PARTIAL)
  - Location: Price spike alerts exist but flash crash detection needs verification
- ✅ Integration with mobile push notifications for urgent market movements (IMPLEMENTED)
  - Location: Price alert notification system with multiple methods
- ✅ Real-time portfolio value updates reflecting current market conditions (IMPLEMENTED)
  - Location: Portfolio tracking with real-time value calculations
- ✅ Live trading volume and activity indicators for market liquidity assessment (IMPLEMENTED)
  - Location: Volume tracking in `MarketPrice` entity
- ❌ Emergency alert system for significant market events or data anomalies (NOT BUILT)

### Epic 2: AI-Powered Price Predictions

#### User Story 2.1: Machine Learning Price Forecasting

_As a collector and investor, I want AI-powered price predictions so that I can anticipate market movements and plan my collecting strategy._

**UI/UX Implementation:**

- **Pages**: `/predictions/dashboard` (AI prediction overview), `/cards/:cardId/forecast` (Individual card predictions)
- **Components**:
  - PredictionChart component with confidence intervals and multiple model outputs
  - ModelPerformance component showing accuracy metrics and model comparison
  - FeatureImportance component highlighting prediction drivers
  - ForecastCalendar component with time-based prediction visualization
  - UncertaintyIndicator component for risk assessment
- **Prediction Dashboard Layout**:
  - AI prediction summary with key forecasted movements and confidence levels
  - Model ensemble display showing how different algorithms agree/disagree
  - Performance leaderboard ranking models by accuracy and recent predictions
  - "Today's AI Picks" featuring high-confidence predictions with reasoning
- **Interactive Prediction Charts**:
  - Multi-timeframe prediction visualization (1 day, 1 week, 1 month, 3 months)
  - Confidence interval shading with darker colors for higher confidence
  - Historical accuracy overlay showing where predictions matched actual outcomes
  - Interactive tooltips explaining prediction drivers and model reasoning
- **Model Comparison Interface**:
  - Model performance comparison table with accuracy metrics (MAE, RMSE, R²)
  - Individual model prediction display with methodology explanations
  - Ensemble weighting visualization showing how models are combined
  - Model retraining indicators showing when algorithms were last updated
- **Feature Analysis Dashboard**:
  - Feature importance ranking with visual bars showing prediction drivers
  - "Why this prediction?" explanations with plain language reasoning
  - Factor sensitivity analysis showing how changes in inputs affect predictions
  - Market context integration showing external factors (tournaments, releases)
- **Prediction Accuracy Tracking**:
  - Historical prediction vs. actual price comparison charts
  - Accuracy heat map showing which time horizons and card types predict best
  - Prediction error analysis with bias detection and correction
  - Model confidence calibration ensuring uncertainty matches actual accuracy
- **Tournament and Event Integration**:
  - Tournament schedule overlay showing competitive format impact predictions
  - Set release countdown with predicted price impact
  - Ban list speculation integration with community sentiment analysis
  - Rotation schedule with predicted format shift impacts
- **Uncertainty Quantification**:
  - Prediction confidence scoring with clear uncertainty communication
  - Scenario analysis showing bull/base/bear case predictions
  - Risk assessment with "what could go wrong" analysis
  - Model disagreement indicators highlighting uncertain predictions
- **Mobile AI Predictions**:
  - Simplified prediction interface with key forecasts and confidence levels
  - Push notifications for high-confidence AI predictions matching user interests
  - Voice queries for prediction information ("What does AI predict for Black Lotus?")
  - Quick prediction sharing with social media integration

**Acceptance Criteria:**

- Multiple machine learning models (LSTM, Random Forest, XGBoost) for price prediction accuracy
- Short-term (1-7 days), medium-term (1-4 weeks), and long-term (3-12 months) forecasting
- Confidence intervals and uncertainty quantification for all predictions
- Model performance tracking with accuracy metrics and continuous improvement
- Feature importance analysis showing which factors drive price predictions
- Ensemble modeling combining multiple algorithms for improved accuracy
- Tournament schedule integration affecting competitive format card prices
- Set rotation and ban list prediction impact on card valuations
- Market sentiment analysis from social media, forums, and community discussions
- Continuous model retraining with new data and performance optimization

#### User Story 2.2: Intelligent Market Insights

_As a market participant, I want intelligent insights and recommendations so that I can understand market dynamics and make better decisions._

**UI/UX Implementation:**

- **Pages**: `/insights/daily` (Daily market insights), `/insights/personalized` (Personal recommendations)
- **Components**:
  - DailyInsight component with AI-generated market summaries
  - PersonalizedRecommendations component based on user portfolio and behavior
  - MarketRegime component showing current market conditions
  - AnomalyDetector component highlighting unusual movements
  - EducationalContent component explaining AI insights and methodology
- **Daily Market Summary Interface**:
  - AI-generated daily briefing with key market movements and explanations
  - "Market Mood" indicator with sentiment analysis from multiple sources
  - Top stories affecting TCG markets with relevance scoring
  - "3-minute read" format with expandable details for deeper analysis
- **Personalized Insights Dashboard**:
  - "For You" recommendations based on portfolio holdings and trading history
  - Custom insight categories: "Cards to Watch", "Selling Opportunities", "Market Timing"
  - Interest-based insights matching user's favorite games and formats
  - Learning path recommendations for improving market understanding
- **Market Regime Detection**:
  - Visual market condition indicator (Bull, Bear, Sideways, Volatile)
  - Regime change alerts with strategy adjustment recommendations
  - Historical regime analysis showing typical duration and characteristics
  - Portfolio impact analysis for different market conditions
- **Anomaly Detection Interface**:
  - "Something's Different" alerts highlighting unusual market behavior
  - Anomaly explanation with potential causes and historical precedents
  - Community verification system for anomaly confirmation
  - Follow-up tracking showing how anomalies resolved
- **Intelligent Recommendations Engine**:
  - AI-powered buy/sell/hold recommendations with reasoning
  - Timing suggestions based on seasonal patterns and market cycles
  - Risk-adjusted recommendations considering user's risk tolerance
  - Alternative card suggestions for diversification and opportunity
- **Market Timing Intelligence**:
  - "Best time to buy/sell" recommendations with confidence intervals
  - Seasonal timing analysis with historical performance data
  - Event-driven timing (before/after tournaments, set releases)
  - Dollar-cost averaging vs. lump sum timing analysis
- **Educational AI Integration**:
  - "Learn why" explanations for all AI recommendations
  - Interactive tutorials on market analysis and prediction interpretation
  - Glossary integration with AI term explanations
  - Video content explaining complex market concepts
- **News and Event Integration**:
  - AI-curated news feed with market relevance scoring
  - Event impact analysis (tournament results, player signings, game updates)
  - Social media sentiment integration with market correlation analysis
  - Predictive event impact modeling
- **Custom Alert Intelligence**:
  - AI-powered alert customization based on user behavior and preferences
  - Smart alert bundling to prevent information overload
  - Learning alerts that adapt to user response patterns
  - Predictive alerts for opportunities matching user criteria
- **Mobile Insights Experience**:
  - Condensed daily insights optimized for mobile consumption
  - Push notification summaries with key insights and opportunities
  - Voice-activated insight queries with natural language processing
  - Quick action buttons for acting on AI recommendations

**Acceptance Criteria:**

- Daily market summary with key movers, trends, and notable events
- Personalized recommendations based on user portfolio and trading history
- Market regime detection (bull, bear, sideways) with strategy recommendations
- Anomaly detection for unusual price movements with explanatory analysis
- Comparative analysis between predicted and actual prices with accuracy reporting
- Market timing recommendations for buying, selling, and holding decisions
- Risk assessment and portfolio optimization suggestions
- Educational content explaining prediction methodology and market factors
- Integration with news and events affecting TCG market performance
- Custom alert system for AI-identified opportunities matching user preferences

#### User Story 2.3: Predictive Portfolio Management

_As a portfolio manager, I want predictive analytics for my collection so that I can optimize my holdings and investment strategy._

**UI/UX Implementation:**

- **Pages**: `/portfolio/analytics` (Portfolio analytics dashboard), `/portfolio/optimizer` (Portfolio optimization tools)
- **Components**:
  - PortfolioOptimizer component with efficient frontier visualization
  - RiskReturnAnalysis component with interactive risk/return plotting
  - RebalancingRecommendations component with actionable suggestions
  - ScenarioAnalysis component for stress testing
  - TaxOptimization component for tax-efficient strategies
- **Portfolio Optimization Dashboard**:
  - Current portfolio allocation with risk/return metrics
  - Efficient frontier chart showing optimal risk/return combinations
  - "Improve Portfolio" recommendations with expected return impact
  - Diversification score with breakdown by game, format, and card type
- **Risk-Return Analysis Interface**:
  - Interactive scatter plot with cards plotted by risk vs. expected return
  - Portfolio position on efficient frontier with improvement suggestions
  - Correlation matrix heat map showing portfolio diversification
  - Risk contribution analysis identifying portfolio risk drivers
- **Predictive Rebalancing Tools**:
  - AI-powered rebalancing suggestions based on predicted price movements
  - "Smart Rebalance" automation with user-defined rules and thresholds
  - Transaction cost analysis showing impact of rebalancing on returns
  - Tax-loss harvesting integration with capital gains optimization
- **Scenario Analysis Interface**:
  - Monte Carlo simulation with thousands of potential market outcomes
  - Stress testing for adverse market conditions (crashes, format changes)
  - "What if" analysis for major market events (ban announcements, rotation)
  - Portfolio resilience scoring with survival probability metrics
- **Performance Attribution Dashboard**:
  - Detailed breakdown showing which holdings drive portfolio performance
  - Alpha generation analysis separating skill from market beta
  - Factor exposure analysis (growth vs. value, competitive vs. casual)
  - Attribution over time showing consistent vs. lucky performance
- **Dynamic Hedging Strategies**:
  - Hedge recommendation engine for high-value portfolio protection
  - Diversification strategies across uncorrelated TCG markets
  - Synthetic hedging using format-specific card relationships
  - Options-like strategies using card correlation and timing
- **Tax Optimization Tools**:
  - Tax-loss harvesting recommendations with wash sale rule compliance
  - Long-term vs. short-term capital gains optimization
  - Tax-efficient rebalancing with minimal taxable events
  - Year-end tax planning with projected gains/losses
- **Automated Monitoring System**:
  - Portfolio drift detection with automatic rebalancing alerts
  - Performance milestone tracking with achievement notifications
  - Risk threshold monitoring with breach alerts and recommendations
  - Opportunity alerts when market conditions favor portfolio adjustments
- **Trading Cost Analysis**:
  - Transaction cost estimation for different rebalancing strategies
  - Market impact analysis for large trades in illiquid cards
  - Timing optimization to minimize market impact and costs
  - Broker comparison for optimal execution strategies
- **Mobile Portfolio Management**:
  - Simplified portfolio overview with key metrics and performance
  - Quick rebalancing actions with one-tap execution
  - Push notifications for important portfolio alerts and opportunities
  - Voice commands for portfolio queries and basic management tasks

**Acceptance Criteria:**

- Portfolio optimization using modern portfolio theory adapted for TCG markets
- Risk-return analysis with efficient frontier calculations for card collections
- Diversification recommendations across games, formats, and card types
- Rebalancing suggestions based on market conditions and prediction models
- Tax optimization strategies for collection buying and selling decisions
- Performance attribution analysis showing which holdings drive portfolio returns
- Scenario analysis for different market conditions and their portfolio impact
- Dynamic hedging strategies for high-value collections
- Integration with trading cost analysis for optimal execution strategies
- Automated portfolio monitoring with alert-based rebalancing recommendations

### Epic 3: Portfolio Tracking & Management

#### User Story 3.1: Comprehensive Portfolio Tracking

_As a collector, I want detailed portfolio tracking so that I can monitor my collection's value and performance over time._

**Acceptance Criteria:**

- Complete collection import from multiple sources (CSV, API, manual entry)
- Automatic card recognition using image scanning and OCR technology
- Multi-condition inventory tracking with detailed grading and assessment
- Real-time portfolio valuation with market price integration
- Historical performance tracking with detailed analytics and reporting
- Cost basis tracking for tax reporting and investment analysis
- Portfolio categorization by game, set, format, and custom user categories
- Insurance valuation reports with detailed condition documentation
- Integration with popular collection management apps and software
- Bulk editing tools for efficient collection updates and maintenance

**UI/UX Implementation:**

- **Pages/Screens**: Portfolio dashboard at `/portfolio/overview`, collection import at `/portfolio/import`, card scanner at `/portfolio/scan`, portfolio details at `/portfolio/details/{portfolioId}`
- **Key Components**:
  - `PortfolioDashboard` - Main overview with value charts and performance metrics
  - `CollectionImporter` - Multi-step wizard for CSV/API/manual imports
  - `CardScanner` - Camera interface with OCR overlay and card recognition
  - `PortfolioGrid` - Sortable/filterable grid of collection items
  - `ValueChart` - Interactive time-series chart showing portfolio value over time
  - `CategoryTabs` - Filter tabs for game, set, format, and custom categories
- **Layout**: Dashboard layout with sidebar navigation for portfolio sections, main content area with value overview cards, and interactive charts below
- **Interactions**: Drag-and-drop for bulk operations, real-time value updates, expandable card details with condition photos, bulk edit modal with batch actions
- **Visual Elements**: Clean card grid with high-quality images, color-coded condition indicators, sparkline charts for individual card performance, progress bars for collection completion
- **Mobile Considerations**: Responsive grid layout, swipe gestures for card actions, camera integration for mobile scanning, optimized charts for touch interaction

#### User Story 3.2: Advanced Portfolio Analytics

_As an investor, I want sophisticated analytics for my portfolio so that I can understand its performance and make strategic decisions._

**Acceptance Criteria:**

- Detailed return analysis including realized and unrealized gains/losses
- Risk metrics including volatility, maximum drawdown, and value-at-risk calculations
- Performance benchmarking against market indices and peer portfolios
- Attribution analysis showing performance drivers by category and holding
- Correlation analysis between portfolio holdings and market segments
- Liquidity analysis with market depth and trading volume considerations
- Portfolio concentration analysis with diversification recommendations
- Stress testing under different market scenarios and economic conditions
- Custom reporting with exportable analytics and performance summaries
- Integration with financial planning tools and investment tracking software

**UI/UX Implementation:**

- **Pages/Screens**: Analytics dashboard at `/portfolio/analytics`, performance reports at `/portfolio/reports`, risk analysis at `/portfolio/risk`, benchmarking at `/portfolio/benchmark`
- **Key Components**:
  - `AnalyticsDashboard` - Comprehensive analytics overview with key metrics
  - `PerformanceChart` - Multi-line chart comparing portfolio vs benchmarks
  - `RiskMetrics` - Card-based layout showing volatility, VaR, and drawdown metrics
  - `AttributionAnalysis` - Tree map and pie charts for performance attribution
  - `CorrelationMatrix` - Interactive heatmap showing portfolio correlations
  - `StressTest` - Scenario analysis with configurable market conditions
  - `ReportBuilder` - Drag-and-drop interface for custom report creation
- **Layout**: Multi-tab interface with analytics sections, full-width charts with overlay controls, sidebar filters for time periods and categories
- **Interactions**: Hover tooltips on charts, drill-down capabilities from summary to detail views, interactive filters for date ranges and categories, export options for all analytics
- **Visual Elements**: Professional financial charts with dark theme option, color-coded performance indicators, animated transitions between time periods, clear typography for financial data
- **Mobile Considerations**: Horizontal scrolling for wide charts, simplified metrics cards for mobile, touch-optimized chart interactions, condensed report layouts

#### User Story 3.3: Investment Goal Management

_As a long-term collector, I want goal-based portfolio management so that I can work toward specific collecting and investment objectives._

**Acceptance Criteria:**

- Custom goal setting for collection completion, value targets, and investment returns
- Progress tracking with milestone alerts and achievement recognition
- Goal-based portfolio allocation recommendations and optimization
- Timeline-based planning with milestone targets and progress monitoring
- Automated savings and investment suggestions to reach collection goals
- Risk tolerance assessment and goal-appropriate portfolio construction
- Integration with budget management and spending tracking tools
- Goal prioritization system for multiple concurrent collecting objectives
- Educational content for goal setting and long-term collection planning
- Community features for sharing goals and celebrating achievements

**UI/UX Implementation:**

- **Pages/Screens**: Goals overview at `/portfolio/goals`, goal creation at `/portfolio/goals/new`, goal tracking at `/portfolio/goals/{goalId}`, achievement gallery at `/portfolio/achievements`
- **Key Components**:
  - `GoalsOverview` - Dashboard showing all active goals with progress indicators
  - `GoalCreator` - Step-by-step wizard for setting up collection/investment goals
  - `ProgressTracker` - Visual progress bars and milestone timeline
  - `RecommendationEngine` - AI-powered suggestions for goal achievement
  - `RiskAssessment` - Interactive questionnaire for risk tolerance
  - `BudgetIntegration` - Spending tracker with goal allocation visualization
  - `AchievementBadges` - Gamified achievement system with unlock animations
- **Layout**: Card-based goal layout with progress visualizations, timeline view for long-term goals, modal overlays for goal creation and editing
- **Interactions**: Drag-and-drop goal prioritization, milestone celebration animations, progress updates with confetti effects, social sharing for achievements
- **Visual Elements**: Progress circles and bars with gradient fills, timeline with milestone markers, achievement badges with metallic effects, motivational messaging and quotes
- **Mobile Considerations**: Swipe navigation between goals, pull-to-refresh for progress updates, thumb-friendly action buttons, optimized goal creation flow

### Epic 4: Market Intelligence & Research

#### User Story 4.1: Comprehensive Market Research Tools

_As a serious collector, I want access to comprehensive market research so that I can understand market dynamics and make informed decisions._

**Acceptance Criteria:**

- Detailed market reports with analysis of trends, drivers, and outlook
- Set-by-set analysis with investment potential and collectibility assessment
- Format impact analysis showing how competitive play affects card values
- Reprinting risk analysis and prediction for high-value cards
- Market cycle analysis with timing recommendations for major purchases
- Competitive analysis between different TCG games and their market performance
- Supply and demand analysis with scarcity metrics and availability tracking
- Professional grading impact analysis on card values and market liquidity
- Tournament meta analysis and its effect on competitive format card prices
- Integration with industry news, announcements, and official communications

**UI/UX Implementation:**

- **Pages/Screens**: Market research hub at `/research/overview`, detailed reports at `/research/reports/{reportId}`, set analysis at `/research/sets`, format analysis at `/research/formats`, news integration at `/research/news`
- **Key Components**:
  - `ResearchDashboard` - Central hub with latest research, trending topics, and quick insights
  - `MarketReport` - Rich text reports with embedded charts, graphs, and interactive data
  - `SetAnalysis` - Comprehensive set breakdown with investment scores and collectibility metrics
  - `FormatTracker` - Tournament meta analysis with card performance correlation
  - `ReprintRisk` - Risk assessment cards with probability indicators and historical data
  - `NewsIntegration` - Curated news feed with impact analysis on market trends
  - `CompetitiveAnalysis` - Side-by-side comparison charts for different TCG markets
- **Layout**: Research-focused layout with article-style content, embedded interactive charts, sidebar navigation for research categories, tabbed interface for different analysis types
- **Interactions**: Bookmark and save research reports, annotation tools for personal notes, social sharing of insights, filtering and search across research content
- **Visual Elements**: Professional report styling with charts and graphs, color-coded risk indicators, trend arrows and performance badges, clean typography optimized for reading
- **Mobile Considerations**: Responsive article layout, collapsible sections for long reports, thumb navigation for charts, offline reading capability for saved reports

#### User Story 4.2: Educational Content & Market Commentary

_As a new collector, I want educational content and expert commentary so that I can learn about the market and improve my collecting knowledge._

**Acceptance Criteria:**

- Regular market commentary from industry experts and experienced collectors
- Educational articles covering market basics, valuation methods, and collecting strategies
- Video content including market analysis, collection reviews, and educational tutorials
- Glossary and reference materials for market terms and collecting concepts
- Case studies of successful collections and investment strategies
- Interactive tools for learning about market analysis and valuation techniques
- Community-driven content with user-generated guides and insights
- Expert interviews and industry leader perspectives on market trends
- Beginner guides for new collectors entering different TCG markets
- Advanced strategy content for experienced collectors and investors

**UI/UX Implementation:**

- **Pages/Screens**: Education center at `/education/hub`, article library at `/education/articles`, video courses at `/education/videos`, glossary at `/education/glossary`, case studies at `/education/cases`, tools at `/education/tools`
- **Key Components**:
  - `EducationHub` - Learning pathway dashboard with progress tracking and recommendations
  - `ArticleLibrary` - Searchable article collection with categories and skill levels
  - `VideoPlayer` - Enhanced video player with bookmarks, notes, and transcripts
  - `InteractiveGlossary` - Searchable glossary with contextual definitions and examples
  - `CaseStudyViewer` - Rich media case studies with interactive timelines and data
  - `LearningTools` - Interactive calculators, quizzes, and simulation tools
  - `ExpertCommentary` - Expert profile pages with latest insights and analysis
- **Layout**: Learning-focused design with clear navigation, progress indicators, bookmark system, categorized content with skill level badges
- **Interactions**: Bookmark content for later, take notes on articles/videos, track learning progress, quiz interactions, social features for sharing insights
- **Visual Elements**: Educational design with clear hierarchy, progress bars and achievement badges, expert author profiles with photos, interactive elements and hover states
- **Mobile Considerations**: Optimized video playback, offline content downloading, swipe navigation between lessons, responsive article layout with readable typography

#### User Story 4.3: Custom Research & Analysis Tools

_As an advanced user, I want custom research tools so that I can conduct my own market analysis and develop investment strategies._

**Acceptance Criteria:**

- Custom charting tools with technical analysis indicators and overlays
- Data export capabilities for external analysis and modeling
- API access for programmatic data retrieval and analysis
- Custom screening tools for finding cards matching specific criteria
- Backtesting capabilities for investment strategies and market timing
- Statistical analysis tools for correlation, regression, and trend analysis
- Custom alert builder for complex market conditions and opportunities
- Integration with spreadsheet applications for advanced modeling

**UI/UX Implementation:**

- **Pages/Screens**: Research tools at `/research/tools`, custom charts at `/research/charts`, screening tools at `/research/screening`, backtesting at `/research/backtest`, API console at `/research/api`
- **Key Components**:
  - `ChartingTool` - Advanced financial charting with customizable indicators and overlays
  - `ScreeningBuilder` - Query builder interface with drag-and-drop criteria
  - `BacktestingEngine` - Strategy builder with visual backtesting results
  - `DataExporter` - Export wizard with format selection and data customization
  - `APIConsole` - Developer-friendly API testing interface with documentation
  - `AlertBuilder` - Complex alert configuration with logical operators and conditions
  - `StatisticalTools` - Advanced analytics with correlation matrices and regression analysis
- **Layout**: Professional trading platform design with multi-panel workspace, dockable tool windows, customizable dashboard layout, advanced control panels
- **Interactions**: Drag-and-drop for building queries and strategies, real-time chart updates, collaborative features for sharing analyses, keyboard shortcuts for power users
- **Visual Elements**: Professional dark theme with financial styling, complex data visualizations, technical indicator overlays, advanced chart types and customizations
- **Mobile Considerations**: Simplified mobile interface focusing on key features, responsive chart viewing, essential tools accessible on mobile, tablet optimization for advanced features
- Custom dashboard creation with personalized metrics and visualizations
- Advanced filtering and sorting capabilities across all market data

### Epic 5: Price Alerts & Notifications

#### User Story 5.1: Intelligent Price Alert System

_As an active trader, I want intelligent price alerts so that I can be notified of market opportunities and important price movements._

**Acceptance Criteria:**

- Multi-condition alert system with price, percentage change, and volume triggers
- AI-powered smart alerts using predictive models and market analysis
- Customizable notification delivery via email, SMS, push notifications, and in-app alerts
- Alert templates for common scenarios (price drops, spike detection, arbitrage opportunities)
- Portfolio-wide alerting for significant value changes and risk events
- Market event alerts for tournaments, set releases, and format changes
- Snooze and alert management features for controlling notification frequency
- Alert performance tracking showing successful opportunities and missed chances
- Community alert sharing for collaborative market monitoring
- Integration with calendar applications for timing-based alerts and reminders

#### User Story 5.2: Market Opportunity Detection

_As an opportunistic buyer, I want automatic opportunity detection so that I can find good deals and arbitrage opportunities across the market._

**Acceptance Criteria:**

- Cross-platform arbitrage detection with profit potential calculations
- Undervalued card identification using predictive models and market analysis
- Bulk purchase opportunities with discount threshold detection
- Auction ending alerts for cards on user watchlists
- New listing alerts for rare cards and high-demand items
- Market inefficiency detection with profit opportunity quantification
- Seasonal opportunity alerts based on historical patterns and predictions
- Format rotation opportunities with timing recommendations
- Integration with user budget and purchase planning tools
- Success rate tracking for opportunity alerts and user feedback

### Epic 6: Market Reporting & Analytics

#### User Story 6.1: Professional Market Reports

_As a business owner, I want professional-grade market reports so that I can make strategic business decisions and track industry trends._

**Acceptance Criteria:**

- Weekly, monthly, and quarterly market reports with comprehensive analysis
- Custom report generation with user-specified metrics and focus areas
- Executive summary format for high-level business decision making
- Detailed appendices with supporting data and methodology explanations
- Industry benchmarking against traditional collectibles and investment markets
- Market size estimation and growth projections for TCG markets
- Regional analysis comparing different geographic markets
- Format and game-specific reports for specialized business needs
- White-label reporting options for business customers and partners
- Integration with business intelligence tools and dashboard applications

#### User Story 6.2: Performance Benchmarking

_As an investor, I want performance benchmarking so that I can compare my portfolio performance against market indices and peer groups._

**Acceptance Criteria:**

- TCG market indices for different games, formats, and card categories
- Peer group comparison based on collection size, focus, and investment style
- Risk-adjusted performance metrics including Sharpe ratio and alpha calculations
- Benchmark tracking with regular updates and historical data maintenance
- Custom benchmark creation for specific investment strategies and focuses
- Performance attribution analysis showing portfolio performance drivers
- Market timing analysis comparing buy/sell decisions to optimal timing
- Integration with financial analysis tools and portfolio management software
- Regular benchmark reports with performance analysis and recommendations
- Community features for sharing performance and comparing strategies

