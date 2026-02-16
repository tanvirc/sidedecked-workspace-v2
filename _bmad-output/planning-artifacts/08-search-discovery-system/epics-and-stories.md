---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - docs/specifications/08-search-discovery-system.md
---
# Search & Discovery System - Epic Breakdown

## Overview

This document decomposes 08-search-discovery-system into implementation-ready epics and stories for BMAD execution.

## Requirements Inventory

### Functional Requirements

- Universal Search Infrastructure
- Personalized Discovery Engine
- Visual & Semantic Search
- Marketplace Integration & Shopping Discovery
- Social & Community Discovery

### NonFunctional Requirements

- Technical requirements are synchronized from the source specification.
- Security and performance constraints are synchronized from the source specification.

### Additional Requirements

- Business rules and integration constraints remain authoritative in the source specification.

### FR Coverage Map

- Epic-to-story coverage is represented by the complete story list below.

## Epic List

- Universal Search Infrastructure
- Personalized Discovery Engine
- Visual & Semantic Search
- Marketplace Integration & Shopping Discovery
- Social & Community Discovery

## Story Index

- Lightning-Fast Universal Search
- Advanced Card Search & Discovery
- Intelligent Search Suggestions & Autocomplete
- AI-Powered Content Recommendations
- Smart Collection Management Integration
- Contextual Discovery & Browsing
- Visual Card Recognition & Search
- Semantic Understanding & Natural Language Search
- Advanced Search Analytics & Optimization
- Intelligent Shopping Discovery
- Vendor & Seller Discovery
- Social Discovery Features
- Community-Generated Content Discovery

## Full Epic and Story Breakdown

### Epic 1: Universal Search Infrastructure

#### User Story 1.1: Lightning-Fast Universal Search

_As a user, I want to search across all platform content (cards, decks, users, listings) so that I can quickly find anything I'm looking for in one place._

**Acceptance Criteria:**

- ✅ Universal search bar accessible from all pages with intelligent auto-focus (IMPLEMENTED)
  - Location: `NavbarSearch` component accessible from header across all pages
- ✅ Sub-100ms search response times for all queries with real-time suggestions (IMPLEMENTED)
  - Location: Algolia integration in `SearchService` with optimized performance settings
- ✅ Unified results displaying cards, decks, users, listings, and forum content (IMPLEMENTED)
  - Location: `SmartSearchResults` component with multiple content types
- ✅ Advanced filtering by content type, game, format, price range, and availability (IMPLEMENTED)
  - Location: `AdvancedSearchModal` with comprehensive filtering system
- ✅ Search result ranking based on relevance, popularity, and user personalization (IMPLEMENTED)
  - Location: Custom ranking in Algolia with popularity scores and user metrics
- ✅ Infinite scroll with lazy loading for large result sets (IMPLEMENTED)
  - Location: Pagination system with hasMore logic in SearchService
- ✅ Search analytics tracking for query optimization and performance monitoring (IMPLEMENTED)
  - Location: `SearchAnalytics` component and analytics tracking in SearchService
- 🔄 Search history with quick access to recent and frequent searches (PARTIAL)
  - Location: Search suggestions include recent searches but full history needs verification
- ✅ Typo tolerance and fuzzy matching for misspelled card names and terms (IMPLEMENTED)
  - Location: Algolia typo tolerance settings and fuzzy matching configuration

**UI/UX Implementation:**

- **Pages/Screens**: Universal search overlay at `/search`, search results at `/search/results`, advanced search at `/search/advanced`, search history at `/search/history`
- **Key Components**:
  - `UniversalSearchBar` - Omnipresent search input with intelligent auto-focus and voice activation
  - `SearchOverlay` - Full-screen search interface with instant results and suggestions
  - `UnifiedResults` - Tabbed results display with cards, decks, users, and listings sections
  - `SearchFilters` - Collapsible filter sidebar with game, format, and price range options
  - `InfiniteResultsGrid` - Optimized infinite scroll with lazy loading and virtualization
  - `SearchHistory` - Recent searches with quick re-search and delete options
- **Layout**: Prominent search bar in header across all pages, full-screen overlay for active search, results page with filters sidebar and main content area
- **Interactions**: Instant search with debounced queries, keyboard navigation through results, filter chips with quick removal, voice activation with visual feedback
- **Visual Elements**: Search suggestions with icons for content types, loading animations during search, highlighting of search terms in results, clean typography for readability
- **Mobile Considerations**: Slide-up search overlay, voice search prominence on mobile, optimized touch targets for filters, gesture-based result navigation

#### User Story 1.2: Advanced Card Search & Discovery

_As a player, I want sophisticated card search capabilities so that I can find specific cards based on various attributes and discover new cards for my collection._

**Acceptance Criteria:**

- ✅ Comprehensive card attribute search (name, set, rarity, type, cost, power, toughness, etc.) (IMPLEMENTED)
  - Location: `AdvancedSearchModal` with extensive field options and attribute filtering
- ✅ Boolean search operators for complex queries (AND, OR, NOT, parentheses) (IMPLEMENTED)
  - Location: Query builder in advanced search with boolean operator support
- ❌ Saved search functionality with alert notifications for new matching results (NOT BUILT)
- 🔄 Semantic search understanding card abilities and synergies across different wordings (PARTIAL)
  - Location: Oracle text search exists but semantic understanding unclear
- ✅ Price range filtering with real-time market data integration (IMPLEMENTED)
  - Location: Price range filtering in SearchService with market data
- ✅ Format legality filtering with current ban list and rotation information (IMPLEMENTED)
  - Location: Format filtering integrated with card legality system
- ✅ Advanced text search within card abilities and flavor text (IMPLEMENTED)
  - Location: Oracle text search in Algolia searchable attributes
- ✅ Card collection status integration (owned, wanted, missing from deck) (IMPLEMENTED)
  - Location: Collection integration in search with ownership status
- ✅ Multi-game search with game-specific syntax and terminology support (IMPLEMENTED)
  - Location: Game-specific search attributes and terminology in SearchService

**UI/UX Implementation:**

- **Pages/Screens**: Advanced card search at `/search/cards`, saved searches at `/search/saved`, visual search at `/search/visual`, search alerts at `/search/alerts`
- **Key Components**:
  - `AdvancedCardSearch` - Multi-field search form with attribute-specific inputs
  - `QueryBuilder` - Visual query builder supporting boolean operators and parentheses
  - `SavedSearchManager` - Saved search dashboard with alert configuration
  - `VisualCardSearch` - Image upload interface with drag-and-drop and camera integration
  - `SemanticSearchBox` - Natural language search input with intent detection
  - `PriceRangeSlider` - Dual-handle slider with real-time price updates
  - `FormatLegalityFilter` - Multi-select with current legality indicators
  - `CollectionStatusBadges` - Visual indicators for owned/wanted/missing cards
- **Layout**: Advanced search form with collapsible sections for different attribute groups, results grid with detailed card information and collection status
- **Interactions**: Real-time search preview, drag-and-drop for visual search, toggle switches for boolean operators, saved search templates with one-click application
- **Visual Elements**: Card attribute icons and labels, collection status color coding, price trend arrows and indicators, legality badges with format colors
- **Mobile Considerations**: Accordion-style collapsible search sections, optimized camera interface for visual search, touch-friendly filter controls

#### User Story 1.3: Intelligent Search Suggestions & Autocomplete

_As a user, I want intelligent search suggestions so that I can quickly find what I'm looking for and discover related content._

**Acceptance Criteria:**

- ✅ Real-time autocomplete with suggestions appearing within 50ms of typing (IMPLEMENTED)
  - Location: `getAutocompleteSuggestions` in SearchService with optimized performance
- ✅ Contextual suggestions based on current page, user history, and popular searches (IMPLEMENTED)
  - Location: `SearchSuggestions` component with contextual suggestion logic
- ✅ Card name completion with set information and alternate printings (IMPLEMENTED)
  - Location: Card suggestions with set and printing information in autocomplete
- ✅ Suggested searches for popular decks, formats, and trending cards (IMPLEMENTED)
  - Location: Popular search suggestions integrated in search components
- ✅ Correction suggestions for misspelled queries with confidence scoring (IMPLEMENTED)
  - Location: Algolia typo tolerance with correction suggestions
- ✅ Query completion for partial searches with intelligent prediction (IMPLEMENTED)
  - Location: Autocomplete prediction in SearchService
- ✅ Category-specific suggestions (cards, decks, users) with visual indicators (IMPLEMENTED)
  - Location: Type-specific suggestions in `EnhancedSearchBar` with visual indicators
- ✅ Trending searches and popular queries prominently featured (IMPLEMENTED)
  - Location: Popular search tracking and display in search suggestions

**UI/UX Implementation:**

- **Pages/Screens**: Search suggestions appear inline with search bar, trending searches at `/search/trending`, personalized suggestions at `/search/for-you`
- **Key Components**:
  - `AutocompleteSuggestions` - Real-time dropdown with categorized suggestions
  - `TrendingSearches` - Popular search showcase with trend indicators
  - `PersonalizedSuggestions` - AI-powered suggestions based on user behavior
  - `SearchCorrections` - Typo detection with "Did you mean?" suggestions
  - `QueryCompletion` - Predictive text completion with confidence indicators
  - `CategorySuggestions` - Grouped suggestions with content type icons
  - `VoiceSuggestionFeedback` - Visual feedback for voice input processing
- **Layout**: Dropdown suggestions panel below search bar, trending searches in dedicated section, personalized suggestions on homepage and search pages
- **Interactions**: Keyboard navigation through suggestions, click/tap to select suggestions, voice activation with visual feedback, suggestion history with quick access
- **Visual Elements**: Category icons for different content types, trending indicators with flame icons, confidence scores for corrections, smooth animations for suggestion appearances
- **Mobile Considerations**: Touch-optimized suggestion selection, voice input prominence, optimized suggestion layout for small screens

### Epic 2: Personalized Discovery Engine

#### User Story 2.1: AI-Powered Content Recommendations

_As a user, I want personalized recommendations so that I can discover cards, decks, and content that matches my interests and playing style._

**Acceptance Criteria:**

- Machine learning recommendations based on collection, deck building, and browsing history
- Collaborative filtering using similar users' preferences and behaviors
- Content-based recommendations analyzing card attributes and deck archetypes
- Personalized homepage with recommended cards, decks, deals, and content
- Dynamic recommendation refresh based on recent activity and market changes
- Explanation system showing why specific items were recommended
- Recommendation categories (similar cards, deck upgrades, budget alternatives, trending picks)
- A/B testing framework for optimizing recommendation algorithms
- User feedback integration with thumbs up/down for recommendation improvement
- Cross-game recommendations for users interested in multiple TCGs

**UI/UX Implementation:**

- **Pages/Screens**: Personalized homepage at `/discover`, recommendations feed at `/discover/for-you`, recommendation settings at `/discover/preferences`
- **Key Components**:
  - `PersonalizedHomepage` - AI-curated content sections with dynamic updates
  - `RecommendationCarousel` - Horizontal scrolling cards with "More like this" functionality
  - `ExplanationTooltips` - Hover/tap explanations for why items were recommended
  - `RecommendationFeedback` - Thumbs up/down with immediate learning integration
  - `CategoryRecommendations` - Grouped recommendations by type (cards, decks, deals)
  - `CrossGameSuggestions` - Multi-TCG recommendations with game indicators
  - `RecommendationHistory` - Previously shown recommendations with re-engagement options
- **Layout**: Homepage with multiple recommendation sections, each with horizontal scroll and "See more" options, clear category headers and navigation
- **Interactions**: Infinite horizontal scroll within categories, immediate feedback on thumbs up/down, expandable explanations, quick preview on hover/long press
- **Visual Elements**: Card previews with recommendation scores, explanation badges, feedback animations, category icons with game-specific colors
- **Mobile Considerations**: Touch-optimized horizontal scrolling, swipe gestures for feedback, optimized card sizes for mobile viewing

#### User Story 2.2: Smart Collection Management Integration

_As a collector, I want search and discovery features integrated with my collection so that I can easily find missing cards and optimize my collection._

**Acceptance Criteria:**

- Collection gap analysis showing missing cards from sets or decks
- Intelligent collection completion suggestions with priority scoring
- Price alert integration for cards on user wishlists
- Collection value optimization recommendations for upgrades and trades
- Duplicate detection with consolidation and selling suggestions
- Collection-based search filtering (owned, not owned, quantity ranges)
- Set completion tracking with progress visualization and missing card identification
- Investment opportunity recommendations based on collection focus
- Trade opportunity matching with other users' collections and wishlists
- Collection statistics and analytics integration with search and discovery features

**UI/UX Implementation:**

- **Pages/Screens**: Collection gaps at `/collection/gaps`, completion tracker at `/collection/complete`, trade matcher at `/collection/trades`, price alerts at `/collection/alerts`
- **Key Components**:
  - `CollectionGapAnalysis` - Visual set completion with missing card highlighting
  - `CompletionSuggestions` - Priority-ranked missing cards with acquisition recommendations
  - `PriceAlertDashboard` - Wishlist items with price tracking and alert configuration
  - `ValueOptimizer` - Upgrade suggestions with before/after value comparisons
  - `DuplicateManager` - Duplicate detection with selling and trading recommendations
  - `CollectionFilters` - Advanced filtering by ownership status and quantities
  - `SetProgressTracker` - Progress bars and completion visualizations for sets
  - `TradeMatchmaker` - Compatible trading partner suggestions with mutual benefits
- **Layout**: Collection management dashboard with multiple widgets, detailed gap analysis with visual set representation, trade matching with user profiles
- **Interactions**: Clickable progress bars to view missing cards, quick actions for adding alerts, drag-and-drop for trade proposals, filter toggles with instant updates
- **Visual Elements**: Progress bars with completion percentages, missing card placeholders, price trend indicators, trade value comparisons
- **Mobile Considerations**: Swipe navigation between sets, touch-friendly progress indicators, optimized trade interface for mobile negotiations

#### User Story 2.3: Contextual Discovery & Browsing

_As a player exploring the platform, I want contextual discovery features so that I can naturally explore related content and make new discoveries._

**Acceptance Criteria:**

- "More like this" functionality on all card, deck, and content pages
- Related content suggestions based on current viewing context
- Trending content discovery with time-sensitive and format-specific trends
- Serendipitous discovery features introducing users to unexpected but relevant content
- Breadcrumb navigation with discovery opportunities at each level
- Tag-based exploration with intelligent tag suggestions and clustering
- Social discovery integration showing what friends and followed users are viewing
- Format and meta-specific discovery for competitive players
- New release and spoiler integration with discovery features
- Cross-platform discovery suggesting related content from forums, social features, and marketplace

**UI/UX Implementation:**

- **Pages/Screens**: Contextual discovery sidebar on all content pages, trending content at `/discover/trending`, tag exploration at `/discover/tags`, social activity at `/discover/social`
- **Key Components**:
  - `MoreLikeThis` - Related content carousel on every card/deck/content page
  - `RelatedContentSidebar` - Contextual suggestions based on current viewing
  - `TrendingDiscovery` - Time-sensitive trending content with format filters
  - `SerendipityWidget` - Random but relevant discovery suggestions
  - `ContextualBreadcrumbs` - Enhanced breadcrumbs with discovery at each level
  - `TagExplorer` - Visual tag cloud with clustering and related tag suggestions
  - `SocialActivity` - Friend activity feed with content discovery integration
  - `MetaDiscovery` - Format-specific trending cards and decks
- **Layout**: Sidebar discovery on content pages, dedicated trending pages with filterable content, tag exploration with visual clustering
- **Interactions**: Hover previews for related content, expandable breadcrumb levels, clickable tag clouds, infinite scroll for trending content
- **Visual Elements**: Related content previews with similarity scores, trending indicators with time stamps, tag size variations for popularity, social activity avatars
- **Mobile Considerations**: Collapsible discovery sidebar, swipe navigation for related content, touch-optimized tag exploration, social activity cards optimized for mobile

### Epic 3: Visual & Semantic Search

#### User Story 3.1: Visual Card Recognition & Search

_As a user, I want to search for cards using images so that I can identify unknown cards and find similar artwork or designs._

**Acceptance Criteria:**

- Image upload functionality with automatic card recognition and identification
- Visual similarity search finding cards with similar artwork, colors, or themes
- Mobile camera integration for real-time card scanning and identification
- Card condition assessment from uploaded images with AI-powered grading suggestions
- Batch image processing for collection cataloging and organization
- Alternative artwork discovery for cards with multiple printings
- Visual search across user-generated content including deck photos and collection images
- OCR text recognition for searching card text and flavor text from images
- Integration with professional grading service images for condition comparison
- Visual search history and saved visual queries for future reference

**UI/UX Implementation:**

- **Pages/Screens**: Visual search at `/search/visual`, camera scan at `/search/camera`, batch processing at `/search/batch`, visual history at `/search/visual-history`
- **Key Components**:
  - `VisualSearchUploader` - Drag-and-drop image upload with preview and processing
  - `CameraScanner` - Real-time camera interface with overlay guides and focus assistance
  - `SimilarityResults` - Visual grid showing similar cards with confidence scores
  - `ConditionAssessment` - AI-powered condition analysis with grading suggestions
  - `BatchProcessor` - Multiple image upload with progress tracking and results management
  - `ArtworkDiscovery` - Alternative artwork browser with printing information
  - `OCRTextExtraction` - Text recognition results with searchable extracted content
  - `VisualSearchHistory` - Previously searched images with quick re-search options
- **Layout**: Camera interface with overlay guides, upload area with drag-and-drop, results grid with similarity scores and card details
- **Interactions**: Drag-and-drop image upload, camera controls with auto-focus, tap-to-focus on mobile, batch selection and processing controls
- **Visual Elements**: Camera overlay with card outline guides, similarity confidence indicators, condition assessment color coding, progress bars for batch processing
- **Mobile Considerations**: Native camera integration, touch-to-focus camera controls, optimized image preview for mobile, gesture-based result navigation

#### User Story 3.2: Semantic Understanding & Natural Language Search

_As a user, I want to search using natural language so that I can find cards and content without knowing exact names or technical terms._

**Acceptance Criteria:**

- Natural language query processing understanding user intent and context
- Semantic search understanding card abilities across different phrasings and rules text
- Synonym recognition and expansion for card types, abilities, and game terminology
- Contextual understanding of format-specific terms and meta references
- Multi-language support with translation and cross-language search capabilities
- Question-answering functionality for rules questions and card interactions
- Intent detection distinguishing between buying, collecting, deck building, and information seeking
- Concept-based search finding cards that fulfill specific deck roles or strategies
- Game state search finding cards useful in specific situations or against particular strategies
- Educational content integration with search queries about rules, strategies, and card interactions

**UI/UX Implementation:**

- **Pages/Screens**: Natural language search at `/search/natural`, Q&A interface at `/search/questions`, concept search at `/search/concepts`, multilingual search at `/search/translate`
- **Key Components**:
  - `NaturalLanguageInput` - Smart search bar with natural language processing indicators
  - `IntentDetection` - Visual feedback showing detected search intent (buy, collect, build, learn)
  - `SemanticResults` - Results with explanation of how the query was interpreted
  - `QuestionAnswering` - Q&A interface with rules explanations and card interactions
  - `ConceptualSearch` - Strategy-based search with role and archetype matching
  - `LanguageSelector` - Multi-language search with translation options
  - `GameStateSearch` - Situational search with scenario-based card recommendations
  - `EducationalIntegration` - Learning content suggestions based on search queries
- **Layout**: Natural language search bar with intent indicators, results with query interpretation explanations, Q&A format for educational content
- **Interactions**: Voice input for natural language queries, intent confirmation before showing results, expandable query interpretations, follow-up question suggestions
- **Visual Elements**: Intent icons (shopping cart, collection, deck builder, book), confidence indicators for interpretations, educational content badges, translation indicators
- **Mobile Considerations**: Voice input prominence, intent selection with large touch targets, optimized Q&A interface for reading, language switching with simple controls

#### User Story 3.3: Advanced Search Analytics & Optimization

_As a platform, I want sophisticated search analytics so that I can optimize search performance and understand user needs._

**Acceptance Criteria:**

- Comprehensive search analytics including query volume, success rates, and user satisfaction
- A/B testing framework for search algorithm and interface improvements
- Real-time search performance monitoring with automatic scaling and optimization
- User journey analysis from search through conversion (purchase, deck creation, engagement)
- Search result quality assessment with relevance scoring and user feedback integration
- Query analysis for content gaps and missing information identification
- Personalization effectiveness measurement with individual and cohort analysis
- Search abandonment analysis with intervention strategies for failed searches
- Competitive analysis benchmarking search performance against industry standards
- Machine learning model performance tracking with continuous improvement processes

**UI/UX Implementation:**

- **Pages/Screens**: Analytics dashboard at `/admin/search/analytics`, A/B test manager at `/admin/search/tests`, performance monitor at `/admin/search/performance`, quality assessment at `/admin/search/quality`
- **Key Components**:
  - `SearchAnalyticsDashboard` - Comprehensive analytics overview with key performance metrics
  - `ABTestManager` - A/B test configuration and results visualization
  - `PerformanceMonitor` - Real-time search performance tracking with alerts
  - `UserJourneyAnalyzer` - Conversion funnel analysis from search to action
  - `QualityAssessment` - Search result quality metrics with user feedback integration
  - `QueryAnalyzer` - Query analysis with gap identification and trend detection
  - `PersonalizationMetrics` - Effectiveness measurement for personalized results
  - `AbandonmentAnalyzer` - Failed search analysis with intervention recommendations
- **Layout**: Admin dashboard layout with multiple metric cards, detailed charts for performance tracking, A/B test results with statistical significance indicators
- **Interactions**: Interactive charts with drill-down capabilities, filter controls for date ranges and user segments, export options for analytics data, alert configuration for performance issues
- **Visual Elements**: Professional analytics styling with data visualizations, performance indicators with color coding, trend lines and statistical charts, alert badges for critical issues
- **Mobile Considerations**: Responsive analytics layout for mobile admin access, simplified metric cards for mobile viewing, touch-optimized chart interactions, essential metrics prioritized for small screens

### Epic 4: Marketplace Integration & Shopping Discovery

#### User Story 4.1: Intelligent Shopping Discovery

_As a buyer, I want intelligent shopping features so that I can find the best deals and discover products that match my needs and budget._

**Acceptance Criteria:**

- Price comparison across multiple sellers with shipping cost integration
- Deal discovery alerts for significant price drops and limited-time offers
- Budget-based recommendations with alternative suggestions for expensive cards
- Availability tracking with restock notifications and seller reliability indicators
- Bundle opportunity identification for combined purchases with shipping optimization
- Condition-based search with visual examples and grading explanations
- Seller reputation integration with search ranking and trust indicators
- Geographic search preferences for local pickup options and reduced shipping costs
- Marketplace trend integration showing hot items and emerging market opportunities
- Wishlist integration with automatic deal notifications and purchase suggestions

**UI/UX Implementation:**

- **Pages/Screens**: Shopping discovery at `/shop/discover`, deals dashboard at `/shop/deals`, price comparison at `/shop/compare`, bundle finder at `/shop/bundles`
- **Key Components**:
  - `ShoppingDiscovery` - AI-powered product recommendations with budget filtering
  - `DealDiscoveryFeed` - Real-time deals with price drop alerts and limited-time offers
  - `PriceComparisonTable` - Multi-seller price comparison with shipping cost integration
  - `BudgetRecommendations` - Alternative card suggestions within specified price ranges
  - `AvailabilityTracker` - Stock status with restock notifications and seller reliability
  - `BundleOpportunities` - Smart bundling suggestions with shipping optimization
  - `ConditionSelector` - Visual condition examples with grading explanations
  - `SellerReputationBadges` - Trust indicators and reputation scores
- **Layout**: Discovery feed with product cards, comparison table with sortable columns, deals dashboard with time-sensitive alerts
- **Interactions**: Price alerts setup with slider controls, wishlist integration with one-click adding, bundle builder with drag-and-drop, filter toggles for conditions and locations
- **Visual Elements**: Deal badges with countdown timers, price trend arrows, seller reputation stars, condition examples with photos, bundle savings indicators
- **Mobile Considerations**: Optimized product cards for mobile browsing, swipe gestures for price comparisons, touch-friendly deal alerts, location-based preferences with GPS integration

#### User Story 4.2: Vendor & Seller Discovery

_As a buyer, I want to discover reliable vendors and sellers so that I can find trusted sources for my purchases._

**Acceptance Criteria:**

- Vendor discovery based on specialization, location, reputation, and inventory
- Seller comparison tools showing prices, reputation, shipping options, and policies
- Specialty vendor identification for hard-to-find cards and specific formats
- Local game store discovery with integration for in-person pickup and events
- Seller reliability scoring based on transaction history, response times, and customer feedback
- Bulk purchase vendor recommendations for large orders and collection building
- International seller discovery with customs and shipping consideration
- New seller discovery with verified credentials and community recommendations
- Seller communication tools integrated with search for inquiries and negotiations
- Seller inventory preview with quick access to their full catalog and specializations

**UI/UX Implementation:**

- **Pages/Screens**: Vendor directory at `/sellers/directory`, seller profiles at `/sellers/{sellerId}`, local stores at `/sellers/local`, seller comparison at `/sellers/compare`
- **Key Components**:
  - `VendorDirectory` - Searchable seller directory with specialization filters
  - `SellerProfile` - Comprehensive seller information with ratings and reviews
  - `SellerComparison` - Side-by-side comparison of sellers with key metrics
  - `SpecialtyVendorFinder` - Search for vendors specializing in specific formats or rare cards
  - `LocalStoreDirectory` - Geographic search for local game stores with event integration
  - `ReliabilityScoring` - Visual reputation indicators with detailed metrics
  - `BulkVendorRecommendations` - Seller suggestions for large orders with volume discounts
  - `InternationalSellerTools` - International shipping calculators and customs information
  - `SellerCommunication` - Integrated messaging for inquiries and negotiations
- **Layout**: Directory with filter sidebar and seller cards, detailed seller profiles with sections for inventory, policies, and reviews, comparison tables with key metrics
- **Interactions**: Filter toggles for seller attributes, direct messaging from seller profiles, favorite seller management, bulk inquiry tools
- **Visual Elements**: Seller reputation badges and stars, specialization tags, location indicators with distance, verified seller checkmarks, response time indicators
- **Mobile Considerations**: Location-based seller discovery with GPS, tap-to-call for local stores, optimized seller profiles for mobile viewing, swipe navigation between sellers

### Epic 5: Social & Community Discovery

#### User Story 5.1: Social Discovery Features

_As a community member, I want to discover interesting users, content, and activities so that I can engage with the community and expand my network._

**Acceptance Criteria:**

- User discovery based on shared interests, location, collection overlap, and activity
- Community content discovery including popular decks, discussions, and user-generated content
- Social proof integration showing what friends and followed users are searching for and viewing
- Community-driven search with user reviews, ratings, and recommendations
- Expert user identification with verified credentials and community contributions
- Collaborative filtering for content discovery based on similar users' preferences
- Social media integration for discovering TCG-related content and connections
- Event and meetup discovery with social context and mutual attendee information
- Community challenge and contest discovery with participation tracking
- Influencer and content creator discovery with verified profiles and featured content

**UI/UX Implementation:**

- **Pages/Screens**: Social discovery at `/discover/social`, user directory at `/users/discover`, community content at `/discover/community`, events at `/discover/events`
- **Key Components**:
  - `SocialDiscovery` - User discovery based on shared interests and collection overlap
  - `CommunityContentFeed` - Popular community content with social engagement indicators
  - `SocialProofIndicators` - "Friends also viewed" and social activity indicators
  - `ExpertUserDirectory` - Verified experts with credentials and contribution history
  - `CollaborativeFiltering` - "Users like you also enjoyed" recommendations
  - `SocialMediaIntegration` - Connected social accounts and cross-platform discovery
  - `EventDiscovery` - Local and online events with attendee information
  - `ChallengeTracker` - Community challenges with participation and progress tracking
  - `InfluencerProfiles` - Featured content creators with verified profiles
- **Layout**: Social feed with user activity, community content cards with engagement metrics, event listings with social context
- **Interactions**: Follow/unfollow actions, social content sharing, event RSVP integration, challenge participation with progress tracking
- **Visual Elements**: User avatars and profile indicators, social engagement metrics (likes, shares, comments), verified badges for experts, event attendee photos
- **Mobile Considerations**: Optimized social feed for mobile scrolling, quick follow/unfollow actions, event discovery with location services, simplified user profiles

#### User Story 5.2: Community-Generated Content Discovery

_As a user, I want to discover high-quality community content so that I can learn from others and engage with valuable discussions and resources._

**Acceptance Criteria:**

- Community content ranking based on quality, engagement, and user feedback
- Expert content identification with verification and credibility indicators
- Educational content discovery including guides, tutorials, and strategy articles
- User-generated deck discovery with performance data and community feedback
- Forum discussion discovery with trending topics and valuable insights
- Community event discovery including tournaments, meetups, and online competitions
- User review and rating discovery for cards, products, and vendors
- Community-driven price validation and market insights
- Collaborative content creation discovery including shared decks and collection projects
- Community moderation and quality assurance with user reporting and verification systems

**UI/UX Implementation:**

- **Pages/Screens**: Community content at `/community/content`, educational resources at `/community/learn`, user reviews at `/community/reviews`, collaborative projects at `/community/projects`
- **Key Components**:
  - `CommunityContentRanking` - Quality-ranked content with engagement metrics and user feedback
  - `ExpertContentBadges` - Verified expert content with credibility indicators
  - `EducationalResourceLibrary` - Searchable guides, tutorials, and strategy content
  - `CommunityDeckshowcase` - User-generated decks with performance data and ratings
  - `ForumDiscoveryFeed` - Trending forum discussions with valuable insights
  - `CommunityEventListing` - Tournament and meetup discovery with community features
  - `ReviewAggregator` - User reviews and ratings for cards, products, and vendors
  - `CollaborativeProjects` - Shared deck building and collection projects
  - `ModerationTools` - Community reporting and verification systems
- **Layout**: Content feed with quality indicators, educational resource library with categories, collaborative project showcase with progress tracking
- **Interactions**: Upvote/downvote community content, bookmark valuable resources, join collaborative projects, report inappropriate content
- **Visual Elements**: Quality indicators and badges, expert verification checkmarks, engagement metrics (upvotes, comments, shares), collaboration project progress bars
- **Mobile Considerations**: Optimized content feed for mobile reading, touch-friendly voting and bookmarking, simplified educational resource access, mobile-optimized project collaboration

