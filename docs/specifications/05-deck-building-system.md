# Deck Building System

## Executive Summary

The Deck Building System enables users to create, manage, and share card decks for all supported TCG games with format-specific validation, social sharing, and collection integration. It provides an intuitive drag-and-drop interface, comprehensive deck analysis tools, and seamless integration with the user's card collection and marketplace. The system supports both casual deck building and serious tournament preparation while fostering community interaction through deck sharing and collaboration features.

## User Stories & Acceptance Criteria

### Epic 1: Universal Deck Architecture

#### User Story 1.1: Multi-Game Deck Creation

_As a player, I want to create decks for different TCG games so that I can build decks for all the games I play in one platform._

**UI/UX Implementation:**

- **Pages**: `/decks/create` (Deck creation interface), `/decks` (Deck library)
- **Components**:
  - GameSelector component with distinctive visual styling per TCG
  - DeckTemplate component with archetype suggestions
  - UniversalDeckBuilder component adapting to selected game
  - ImportWizard component for external deck lists
  - FormatSelector component with game-specific options
- **Game Selection Interface**:
  - Large, visually distinctive game cards (MTG, Pokémon, Yu-Gi-Oh!, One Piece)
  - Game-specific color schemes and iconography
  - Quick stats showing user's collection size per game
  - Recent decks preview for each game with thumbnail images
  - "Create New Deck" prominent call-to-action for each game
- **Deck Creation Workflow**:
  - Step-by-step guided process: Game Selection → Format Selection → Template/Blank → Deck Building
  - Progress indicator showing current step with ability to go back
  - Game-specific UI adaptations (color schemes, terminology, layout)
  - Auto-detection of game when importing cards from external sources
- **Game-Specific Adaptations**:
  - MTG: Mana symbols, color identity, commander focus
  - Pokémon: Energy types, Pokémon types, trainer categories
  - Yu-Gi-Oh!: Monster/Spell/Trap organization, attribute symbols
  - One Piece: Color identity, character types, devil fruit themes
- **Import Integration**:
  - Direct import from MTG Arena, PTCGO, Master Duel, and other digital platforms
  - Text-based deck list parser with intelligent card matching
  - URL import from popular deck sharing sites
  - Clipboard detection for automatic import suggestions
- **Mobile Game Selection**:
  - Large, touch-friendly game selection tiles
  - Swipeable game carousel with detailed previews
  - Voice commands for game selection and deck creation
  - Simplified workflow optimized for mobile deck building

**Acceptance Criteria:**

- ✅ Support for Magic: The Gathering, Pokémon, Yu-Gi-Oh!, and One Piece deck building (IMPLEMENTED)
  - Location: Multi-game support in deck validation and components
- ✅ Game-specific deck structure recognition (main deck, sideboard, command zone, extra deck, etc.) (IMPLEMENTED)
  - Location: Zone system in `DeckCard` interface with multiple zones
- ✅ Automatic game detection when adding cards to new deck (IMPLEMENTED)
  - Location: Game detection logic in deck building system
- ✅ Game-specific card limits and restrictions enforcement (IMPLEMENTED)
  - Location: Deck validation system with format-specific rules
- ❌ Quick deck creation from popular meta decks and tournament winners (NOT BUILT)
- ✅ Game-specific terminology and interface adaptations (IMPLEMENTED)
  - Location: Game-specific components and UI adaptations
- ✅ Format selection affecting available cards and deck building rules (IMPLEMENTED)
  - Location: Format validation in deck building system
- ❌ Import functionality from game-specific digital platforms (MTG Arena, PTCGO, etc.) (NOT BUILT)

#### User Story 1.2: Format-Specific Validation

_As a competitive player, I want my deck to be validated against specific format rules so that I can ensure it's legal for tournaments._

**UI/UX Implementation:**

- **Components**:
  - FormatValidator component with real-time feedback
  - ValidationStatus component with traffic light indicators
  - BanListTracker component showing restricted cards
  - RotationWarning component for rotating formats
  - LegalityChecker component with detailed explanations
- **Format Selection Interface**:
  - Format dropdown with icons and descriptions for each format
  - Popular formats highlighted with usage statistics
  - Format legality preview showing available card pool size
  - Custom format creation for local tournament rules
  - Format comparison tool showing differences and card overlaps
- **Real-Time Validation Display**:
  - Traffic light system: Green (legal), Yellow (warnings), Red (illegal)
  - Validation sidebar showing all current issues with fix suggestions
  - Card-level validation with hover tooltips explaining restrictions
  - Deck legality score with improvement recommendations
- **Banned/Restricted Card Handling**:
  - Visual indicators on banned cards (red border, crossed out)
  - Restricted card quantity warnings with legal limit display
  - Ban list update notifications with deck impact analysis
  - Historical ban list view showing format evolution
- **Rotation Tracking Interface**:
  - Rotation calendar showing upcoming format changes
  - Rotating card warnings with replacement suggestions
  - Post-rotation deck preview showing what remains legal
  - Rotation-proof indicator for eternal format cards
- **Minimum Deck Size Visualization**:
  - Progress bar showing current deck size vs. minimum requirement
  - Visual deck counter with color coding (red: under, green: optimal)
  - Quick add suggestions when deck is under minimum size
- **Format Rules Documentation**:
  - Integrated rules reference with searchable format documentation
  - Visual format comparison showing key differences
  - Rules updates notification system with deck impact assessment
- **Custom Format Support**:
  - Custom format builder with rule configuration interface
  - Community format sharing with import/export functionality
  - Local tournament format templates with common rule sets
- **Validation History Tracking**:
  - Timeline showing how format changes affected deck legality
  - Version control for decks with format-specific snapshots
  - Impact analysis for major format updates
- **Mobile Validation Interface**:
  - Simplified validation status with swipe-to-detail
  - Quick fix suggestions with one-tap resolution
  - Voice alerts for critical validation issues
  - Offline validation using cached format data

**Acceptance Criteria:**

- ✅ Comprehensive format support (Standard, Modern, Legacy, Commander, etc.) (IMPLEMENTED)
  - Location: Format system in deck validation with multiple format support
- ✅ Real-time validation with immediate feedback on illegal cards or quantities (IMPLEMENTED)
  - Location: Deck validation system with real-time feedback
- ✅ Ban list integration with automatic updates from official sources (IMPLEMENTED)
  - Location: Legality tracking in card data with ban list integration
- ✅ Restricted list handling for formats with limited cards (IMPLEMENTED)
  - Location: Restriction handling in validation system
- ✅ Minimum deck size requirements with visual indicators (IMPLEMENTED)
  - Location: Deck size validation in deck building components
- ✅ Maximum copies per card enforcement based on format rules (IMPLEMENTED)
  - Location: Copy limit enforcement in deck validation
- 🔄 Format-specific rules explanation and documentation (PARTIAL)
  - Location: Basic rule enforcement exists but documentation needs verification
- ✅ Rotation tracking for rotating formats with warnings for rotating cards (IMPLEMENTED)
  - Location: Rotation handling in format validation
- 🔄 Custom format support for local tournament and casual play rules (PARTIAL)
  - Location: Format system exists but custom format support unclear

#### User Story 1.3: Deck Zone Management

_As a deck builder, I want to manage different deck zones so that I can properly organize my deck according to game rules._

**UI/UX Implementation:**

- **Components**:
  - ZoneManager component with tabbed or accordion interface
  - ZoneCard component showing card counts and summaries
  - ZoneTransfer component for moving cards between zones
  - ZoneStatistics component with analytics per zone
  - ZonePrinter component for tournament-ready exports
- **Zone Layout Interface**:
  - Tabbed interface for zone switching (Main Deck, Sideboard, Commander, etc.)
  - Visual zone headers with distinctive colors and icons
  - Card count badges on each zone tab with capacity indicators
  - Collapsible zones for focused editing on smaller screens
- **Game-Specific Zone Adaptations**:
  - MTG: Main Deck, Sideboard, Command Zone, Maybe Board
  - Pokémon: Deck, Prize Cards (visual reference)
  - Yu-Gi-Oh!: Main Deck, Extra Deck, Side Deck
  - One Piece: Leader, Deck, Life (Don!! deck)
- **Zone Transfer Interface**:
  - Drag-and-drop between zones with visual drop indicators
  - Right-click context menus with "Move to [Zone]" options
  - Quick transfer buttons on card hover (→ Sideboard, → Main)
  - Batch transfer tools for moving multiple cards simultaneously
- **Zone-Specific Validation**:
  - Zone capacity warnings with visual progress bars
  - Zone-specific card restrictions with immediate feedback
  - Color-coded validation per zone (green: good, yellow: warning, red: illegal)
- **Zone Statistics Display**:
  - Individual mana curves per zone with comparative analysis
  - Card type distribution specific to each zone
  - Zone efficiency metrics (sideboard versatility, main deck consistency)
  - Quick stats overlay showing key zone information
- **Zone Search and Filtering**:
  - Zone-specific search within current deck
  - Filter cards by zone with quick zone switching
  - "Show all zones" view for comprehensive deck overview
- **Zone Management Tools**:
  - Quick actions toolbar: Clear zone, Auto-organize, Import to zone
  - Zone templates for common configurations
  - Zone comparison tool showing differences between versions
- **Mobile Zone Interface**:
  - Swipeable zone tabs with gesture navigation
  - Simplified zone transfer with drag-and-drop or button actions
  - Collapsible zone views optimized for small screens
  - Zone-specific card grid with touch-friendly interactions
- **Zone Export and Printing**:
  - Zone-specific export options (print sideboard only, etc.)
  - Tournament-ready formatting with official layouts
  - QR codes for digital deck verification
  - Mobile sharing options for zone-specific lists

**Acceptance Criteria:**

- ✅ Zone-specific card management (main deck, sideboard, command zone, extra deck, maybe board) (IMPLEMENTED)
  - Location: Zone system in `DeckCard` interface with comprehensive zone support
- ✅ Visual separation of zones with clear labeling and card counts (IMPLEMENTED)
  - Location: Zone management components with visual indicators
- ✅ Zone-specific card limits and validation rules (IMPLEMENTED)
  - Location: Zone validation in deck building system
- ✅ Drag-and-drop between zones with automatic validation (IMPLEMENTED)
  - Location: Drag-and-drop functionality in deck builder components
- ✅ Zone statistics and analysis (mana curve per zone, card type distribution) (IMPLEMENTED)
  - Location: `DeckStats` component with zone-specific analysis
- ✅ Quick actions for moving cards between zones (IMPLEMENTED)
  - Location: Zone transfer functionality in deck builder
- ✅ Zone-based filtering and search within the deck (IMPLEMENTED)
  - Location: Zone filtering in deck management
- ✅ Collapsible zone views for focused editing (IMPLEMENTED)
  - Location: Zone layout management in deck builder
- 🔄 Zone printing and export options for tournament preparation (PARTIAL)
  - Location: Export functionality exists but tournament formatting needs verification
- ✅ Mobile-optimized zone switching and management (IMPLEMENTED)
  - Location: Mobile-optimized deck builder components

### Epic 2: Deck Construction Interface

#### User Story 2.1: Drag-and-Drop Deck Editor

_As a deck builder, I want an intuitive drag-and-drop interface so that I can easily add, remove, and reorganize cards in my deck._

**UI/UX Implementation:**

- **Pages**: `/decks/:id/edit` (Main deck building interface)
- **Components**:
  - DragDropEditor component with HTML5 drag API
  - CardGrid component with responsive layout
  - DeckOverview component showing current state
  - QuickActions component with keyboard shortcuts
  - UndoRedoManager component for change history
- **Drag-and-Drop Interface**:
  - Smooth drag animations with card preview following cursor
  - Visual drop zones with highlight effects on hover
  - Ghost card placeholder showing where card will be placed
  - Multi-select drag for batch card operations
  - Snap-to-grid alignment for organized card placement
- **Search-to-Deck Integration**:
  - Side-by-side layout: Card search (left) + Deck builder (right)
  - Search results with drag-enabled card thumbnails
  - Quick-add buttons on search results for non-drag users
  - Search filters that update based on current deck needs
- **Visual Feedback Systems**:
  - Drop zone highlighting with color-coded zones (main, sideboard, etc.)
  - Card quantity badges updating in real-time during drag
  - Validation feedback during drag (red border for illegal drops)
  - Success animations for successful card additions
- **Card Quantity Management**:
  - Automatic quantity increment when dropping duplicate cards
  - +/- buttons for precise quantity control
  - Direct input fields for large quantity changes
  - Maximum quantity warnings with format-specific limits
- **Context Menu Integration**:
  - Right-click menus on cards with common actions
  - Quick actions: Add to deck, Remove, Move to sideboard, View details
  - Contextual options based on card location and deck state
- **Keyboard Shortcuts**:
  - Ctrl+Click for quick add/remove
  - Delete key for removing selected cards
  - Ctrl+Z/Y for undo/redo operations
  - Number keys for quantity adjustment
- **Deck Overview Visualization**:
  - Grid view with card images and quantities
  - List view with detailed card information
  - Compact view for large decks on smaller screens
  - Sorting options: CMC, name, type, color, quantity
- **Auto-Save and Conflict Resolution**:
  - Automatic saving every 30 seconds with visual confirmation
  - Real-time collaboration conflict detection
  - Version history with rollback capabilities
  - Offline editing with sync when connection restored
- **Mobile Drag-and-Drop**:
  - Touch-optimized drag gestures with haptic feedback
  - Long-press to initiate drag with visual indication
  - Simplified drop targets optimized for finger interaction
  - Alternative button-based actions for users preferring taps

**Acceptance Criteria:**

- ✅ Smooth drag-and-drop functionality for adding cards from search results (IMPLEMENTED)
  - Location: Drag-and-drop implementation in deck builder components
- ✅ Visual feedback during drag operations with drop zone highlighting (IMPLEMENTED)
  - Location: Visual feedback in drag-and-drop system
- ✅ Automatic quantity adjustment when dropping duplicate cards (IMPLEMENTED)
  - Location: Quantity management in deck card system
- ✅ Right-click context menus for quick card actions (add, remove, move to sideboard) (IMPLEMENTED)
  - Location: Context menu functionality in deck builder
- ✅ Keyboard shortcuts for power users (Ctrl+click to add, Del to remove) (IMPLEMENTED)
  - Location: Keyboard shortcut handling in deck builder
- ✅ Undo/redo functionality for deck changes (IMPLEMENTED)
  - Location: Undo/redo system in deck builder state management
- ✅ Auto-save with conflict resolution for concurrent editing (IMPLEMENTED)
  - Location: Auto-save functionality in deck management
- ✅ Visual deck overview with card images in grid or list view (IMPLEMENTED)
  - Location: Multiple view modes in deck builder layout
- ✅ Quick quantity adjustment with +/- buttons or direct input (IMPLEMENTED)
  - Location: Quantity controls in deck card components
- ✅ Batch operations for adding/removing multiple cards simultaneously (IMPLEMENTED)
  - Location: Bulk operations in deck management system

#### User Story 2.2: Advanced Card Search Integration

_As a deck builder, I want powerful search capabilities so that I can quickly find cards that fit my deck strategy._

**UI/UX Implementation:**

- **Components**:
  - IntegratedSearch component within deck builder
  - AdvancedFilters component with format-specific options
  - SynergyFinder component suggesting card combinations
  - CollectionFilter component showing owned/missing cards
  - SearchHistory component with session-specific tracking
- **Integrated Search Interface**:
  - Persistent search bar at top of deck builder with real-time results
  - Search suggestions dropdown with card name autocomplete
  - Recent searches quick-access with one-click re-search
  - Search scope toggle: All cards, Format-legal, Collection only
- **Advanced Filter Panel**:
  - Collapsible filter sidebar with game-specific categories
  - Mana cost/Energy cost range sliders with visual symbols
  - Card type hierarchical checkboxes (Creature → Beast → Dragon)
  - Color/Attribute multi-select with visual color indicators
  - Keyword ability search with autocomplete and explanations
- **Format-Legal Filtering**:
  - Automatic format detection from current deck
  - "Legal in [Format]" toggle with card count indication
  - Rotation-safe filtering with "staying in format" option
  - Cross-format suggestions showing cards legal in multiple formats
- **Collection Integration**:
  - Collection status indicators: Owned (green), Missing (red), Wishlist (yellow)
  - Owned quantity display with deck quantity needed
  - "Cards I Own" filter for budget-conscious building
  - Missing card estimation with purchase suggestions
- **Search Results Display**:
  - Grid view with card images and key statistics
  - List view with detailed card information and prices
  - Infinite scroll with lazy loading for performance
  - Sort options: Relevance, Price, Power level, Community rating
- **Card Preview Integration**:
  - Hover preview with full card details and oracle text
  - Quick stats overlay: CMC, type, power/toughness
  - Price information with marketplace integration
  - Similar cards suggestions in preview popup
- **Bulk Operations**:
  - Multi-select search results with batch add functionality
  - Quantity selector for each card before adding to deck
  - "Add full playset" quick action for competitive building
- **Search Analytics**:
  - Search term highlighting in results for relevance clarity
  - "No results" helper with alternative search suggestions
  - Popular searches widget showing trending cards
  - Search performance optimization with caching
- **Mobile Search Experience**:
  - Full-screen search overlay with touch-optimized filters
  - Voice search integration with natural language processing
  - Simplified filter interface with essential options only
  - Swipe gestures for quick card preview and addition

**Acceptance Criteria:**

- ✅ Integrated card search within the deck builder interface (IMPLEMENTED)
  - Location: Card search integration in deck builder components
- ✅ Advanced filtering by mana cost, card type, abilities, and synergies (IMPLEMENTED)
  - Location: Advanced filtering in search system
- ✅ Format-legal filtering showing only cards legal in selected format (IMPLEMENTED)
  - Location: Format validation in card search
- ✅ Collection filtering showing owned cards, missing cards, and wishlist items (IMPLEMENTED)
  - Location: Collection integration in search system
- ✅ Recent searches and frequently used cards for quick access (IMPLEMENTED)
  - Location: Search history functionality
- ✅ Search history specific to current deck building session (IMPLEMENTED)
  - Location: Session-based search tracking
- ✅ Card preview on hover with full card details and pricing information (IMPLEMENTED)
  - Location: Card preview components with pricing integration
- ✅ Bulk add functionality from search results with quantity selection (IMPLEMENTED)
  - Location: Bulk operations in deck builder

#### User Story 2.3: Deck Statistics & Analysis

_As a deck builder, I want comprehensive deck analysis so that I can optimize my deck's performance._

**UI/UX Implementation:**

- **Pages**: Analysis panel within deck builder, `/decks/:id/analytics` (detailed analysis)
- **Components**:
  - ManaCurve component with interactive histogram
  - CardDistribution component with pie charts
  - DrawProbability component with simulation results
  - SynergyAnalyzer component detecting card interactions
  - PerformancePredictor component with meta comparison
- **Mana Curve Visualization**:
  - Interactive histogram with hover details for each CMC
  - Color-coded bars showing mana cost distribution by color
  - Overlay comparison with optimal curve for deck archetype
  - Click-to-filter showing cards at selected mana cost
  - Mobile-optimized touch interaction with detailed popups
- **Card Distribution Analytics**:
  - Animated pie charts for card types (creatures, spells, lands)
  - Color distribution wheel for multi-color deck analysis
  - Rarity breakdown with collection value estimation
  - Interactive legend with click-to-highlight functionality
- **Draw Probability Calculator**:
  - Card-specific draw probability with turn-by-turn breakdown
  - Combo probability calculator for multi-card interactions
  - Opening hand simulator with statistical analysis
  - "What are my chances of drawing X by turn Y?" interface
- **Opening Hand Simulator**:
  - Visual hand display with actual card images
  - Mulligan decision support with keep/mulligan recommendations
  - Multiple hand generation with statistical tracking
  - Hand evaluation scoring based on mana curve and threats
- **Deck Speed Analysis**:
  - Turn-by-turn threat deployment prediction
  - Aggro/midrange/control classification with confidence score
  - Speed comparison with meta decks in same format
  - Performance prediction against different archetypes
- **Synergy Detection Interface**:
  - Combo highlighting with visual connection lines
  - Synergy strength rating with detailed explanations
  - Missing synergy suggestions for incomplete combos
  - Interaction complexity scoring for competitive viability
- **Competitive Analysis Dashboard**:
  - Meta positioning with tier ranking estimation
  - Matchup prediction against popular deck archetypes
  - Weakness identification with improvement suggestions
  - Sideboard analysis with matchup-specific recommendations
- **Performance Metrics**:
  - Consistency rating based on mana base and curve analysis
  - Power level estimation with peer deck comparison
  - Budget analysis with alternative card suggestions
  - Deck uniqueness score compared to meta decks
- **Improvement Suggestions**:
  - Automated recommendations for mana base optimization
  - Missing archetype staples with explanation of inclusion
  - Overperforming/underperforming card identification
  - Budget upgrade path with incremental improvements
- **Analytics Export and Sharing**:
  - Comprehensive analysis report generation (PDF/Web)
  - Statistics sharing with deck when published
  - Performance tracking over deck iterations
  - Comparative analysis between deck versions
- **Mobile Analytics**:
  - Simplified charts optimized for mobile viewing
  - Swipeable analysis sections with key insights
  - Voice summary of key statistics and recommendations
  - Offline analytics calculation with cached meta data

**Acceptance Criteria:**

- ✅ Mana curve visualization with interactive histogram (IMPLEMENTED)
  - Location: `DeckStats` component with mana curve analysis
- ✅ Card type distribution pie charts and breakdowns (IMPLEMENTED)
  - Location: Card distribution analysis in deck statistics
- ✅ Color distribution and mana base analysis for multi-color decks (IMPLEMENTED)
  - Location: Color analysis in deck statistics system
- 🔄 Draw probability calculator for specific cards and combinations (PARTIAL)
  - Location: Basic probability functions exist but calculator UI needs verification
- ❌ Opening hand simulator with mulligan decision support (NOT BUILT)
- ❌ Deck speed analysis and turn-by-turn play probability (NOT BUILT)
- ❌ Synergy detection highlighting card interactions and combos (NOT BUILT)
- ❌ Competitive analysis comparing deck to meta decks in format (NOT BUILT)
- ❌ Weakness identification suggesting improvements and missing pieces (NOT BUILT)
- ❌ Performance prediction based on deck composition and meta analysis (NOT BUILT)

### Epic 3: Collection Integration

#### User Story 3.1: Owned Card Tracking

_As a collector, I want to see which cards I own so that I can build decks with my existing collection._

**UI/UX Implementation:**

- **Components**:
  - CollectionStatus component with visual ownership indicators
  - OwnershipBadge component showing owned/needed quantities
  - CompletionTracker component with progress visualization
  - AlternativeCards component suggesting replacements
  - WishlistIntegration component for missing cards
- **Ownership Visual Indicators**:
  - Color-coded borders: Green (owned sufficient), Yellow (partial), Red (missing)
  - Quantity badges showing "3/4" owned vs needed format
  - Checkmark overlay on fully owned cards
  - Semi-transparent overlay on missing cards with "missing" label
- **Collection Status Display**:
  - Deck completion percentage with circular progress indicator
  - Cards owned vs total needed summary at deck level
  - Value breakdown: owned value, missing value, total deck value
  - Collection status filter toggle showing owned/missing/partial cards only
- **Missing Card Management**:
  - "Missing Cards" dedicated panel with prioritized list
  - Alternative card suggestions with similarity scoring
  - Price comparison for missing cards across vendors
  - "Add to Wishlist" quick action for missing cards
- **Owned Quantity Management**:
  - Quantity selector showing owned vs deck requirements
  - "Use different copy" option for multiple printings
  - Location tracking integration showing where cards are stored
  - Condition tracking for owned cards (NM, LP, MP, etc.)
- **Collection Completion Tools**:
  - Completion percentage by card category (lands, spells, creatures)
  - "Buildable now" indicator showing if deck can be built with current collection
  - "Almost complete" highlighting showing decks close to completion
  - Timeline prediction for deck completion based on acquisition rate
- **Shopping Integration Preview**:
  - "Buy Missing Cards" button with total cost estimate
  - Vendor comparison showing best prices for missing cards
  - "Add All to Cart" functionality for complete missing card list
  - Budget tracker showing cost to complete deck
- **Trade Suggestions**:
  - "Available for trade" integration with community trading
  - Trade value calculation for owned extra cards
  - Trade suggestion engine for acquiring missing cards
  - Trade history tracking for completed card exchanges
- **Collection Sync Integration**:
  - Import from external collection management tools
  - Export deck requirements to collection tracking software
  - Real-time sync with inventory management systems
  - QR code scanning for quick collection updates
- **Mobile Collection Interface**:
  - Simplified ownership indicators optimized for small screens
  - Quick "mark as owned" toggle with quantity picker
  - Voice recognition for rapid collection updates
  - Offline collection tracking with sync when connected

**Acceptance Criteria:**

- Visual indicators on all cards showing ownership status (owned, missing, partial)
- Quantity owned vs. quantity needed display for each card
- Collection completion percentage for entire deck
- Alternative card suggestions for missing cards with similar effects
- Wishlist integration for cards needed to complete deck
- Price calculation for missing cards with shopping cart integration
- Collection value tracking showing total deck value and owned value
- Trade suggestions for acquiring missing cards from other users
- Inventory location tracking for physical card organization
- Collection sync with external inventory management systems

#### User Story 3.2: Shopping Integration

_As a deck builder, I want to easily purchase missing cards so that I can complete my deck builds._

**UI/UX Implementation:**

- **Components**:
  - ShoppingCart component integrated with deck builder
  - PriceComparison component showing vendor options
  - BundleOptimizer component for shipping efficiency
  - BudgetTracker component with spending limits
  - ConditionSelector component for card quality preferences
- **Shopping Integration Panel**:
  - "Missing Cards" shopping list with total cost display
  - One-click "Add All to Cart" with quantity verification
  - Individual "Add to Cart" buttons on each missing card
  - Shopping cart preview showing current selections and total
- **Price Comparison Interface**:
  - Vendor comparison table with price, condition, and shipping info
  - "Best Deal" highlighting with savings calculation
  - Vendor rating and reliability indicators
  - Stock availability status with low-stock warnings
- **Bundle Optimization Tools**:
  - "Optimize for Shipping" tool combining orders from same vendors
  - Shipping cost calculator with bundle savings display
  - "Free Shipping Threshold" indicators with suggestions to reach limits
  - Multi-vendor coordination for optimal total cost
- **Condition and Quality Management**:
  - Global condition preferences (NM, LP, MP, HP) with price impact
  - Per-card condition override for flexible purchasing
  - Condition impact on price with visual comparison
  - "Accept lower condition" option for budget-conscious building
- **Budget and Priority Tools**:
  - Budget limit setting with spending tracker
  - Card priority ranking for phased purchasing
  - "Essential vs. Optional" categorization with recommendation
  - Price alert setup for cards over budget
- **Shopping List Management**:
  - Persistent shopping lists across browser sessions
  - Multiple shopping list creation for different decks
  - Shopping list sharing with friends for group purchases
  - Export to external shopping platforms and price tracking tools
- **Alternative Card Suggestions**:
  - Budget alternatives with similar functionality
  - "Functional reprint" suggestions for expensive cards
  - Performance impact analysis of alternative choices
  - Community recommendations for budget replacements
- **Purchase Tracking**:
  - Order tracking integration with purchase history
  - Delivery tracking with deck completion status updates
  - Purchase analytics showing spending by deck and time period
  - Receipt management and expense tracking for collection building
- **Marketplace Integration**:
  - Direct integration with SideDecked marketplace
  - External marketplace comparison (TCGPlayer, Card Kingdom, etc.)
  - Local game store integration where available
  - International vendor support with currency conversion
- **Mobile Shopping Experience**:
  - Mobile-optimized shopping cart with touch-friendly interface
  - Quick price comparison with swipeable vendor cards
  - One-tap purchasing with stored payment methods
  - Push notifications for price drops on wishlist cards

**Acceptance Criteria:**

- One-click shopping cart addition for missing cards from deck
- Price comparison across multiple vendors for best deals
- Bundle optimization suggesting combined purchases for shipping savings
- Condition preference settings for purchasing cards
- Shopping list generation with priorities and budget constraints
- Vendor reputation integration for trusted seller selection
- Saved payment methods and shipping addresses for quick checkout
- Order tracking integration showing progress on deck completion
- Budget tracking and spending alerts for deck building projects
- Group purchase coordination for expensive cards with other users

### Epic 4: Deck Sharing & Social Features

#### User Story 4.1: Public Deck Sharing

_As a deck builder, I want to share my deck creations so that I can contribute to the community and get feedback._

**UI/UX Implementation:**

- **Pages**: `/decks/:id/share` (Deck sharing interface), `/decks/public` (Public deck gallery)
- **Components**:
  - SharingControls component with visibility settings
  - DeckPublication component with description editor
  - SocialVoting component with upvote/downvote functionality
  - CommentSystem component for community feedback
  - VersionHistory component with public changelog
- **Deck Sharing Interface**:
  - Visibility toggle: Private, Friends Only, Public with clear explanations
  - "Publish Deck" workflow with guided setup process
  - Share link generation with custom URLs and QR codes
  - Social media integration with platform-specific optimizations
  - Embed code generator for external websites and blogs
- **Deck Publication Wizard**:
  - Rich text editor for deck description with formatting options
  - Strategy guide section with gameplay tips and mulligan advice
  - Card choice explanations with hover tooltips on deck list
  - Meta positioning explanation and matchup discussion
  - Tags and category selection for discoverability
- **Social Interaction Features**:
  - Voting system with like/dislike and detailed feedback categories
  - "Favorite" system for bookmarking interesting decks
  - Share counter showing social media shares and views
  - "Try this deck" button for quick deck copying
- **Community Feedback System**:
  - Threaded comment system with reply functionality
  - Comment voting and moderation tools
  - Expert reviewer highlighting for recognized community members
  - Comment categories: Strategy, Card Choices, Improvements, Questions
- **Deck Versioning for Public Decks**:
  - Public changelog with update notifications to followers
  - Version comparison showing changes between iterations
  - "Stable" version marking for tournament-ready builds
  - Historical version access for tracking deck evolution
- **Featured Content System**:
  - "Deck of the Week" highlighting with community voting
  - Tournament winner showcase with match replays
  - Creator spotlights for innovative deck builders
  - Seasonal meta analysis with featured deck archetypes
- **Print and Export Options**:
  - Tournament-legal printout formatting with official layouts
  - QR codes for quick deck verification at events
  - Mobile-friendly deck viewing for on-the-go reference
  - Export to tournament management software
- **Discovery and Search**:
  - Advanced deck search with meta filters and popularity metrics
  - "Similar decks" recommendation engine
  - Tag-based browsing with visual tag clouds
  - Creator following with personalized deck feeds
- **Mobile Sharing Experience**:
  - Simplified sharing interface with essential options
  - Quick social media sharing with auto-generated deck images
  - Voice notes for strategy explanations
  - Mobile-optimized deck viewing with gesture navigation

**Acceptance Criteria:**

- ✅ Public/private deck visibility settings with granular sharing controls (IMPLEMENTED)
  - Location: `DeckPrivacyControls` component with visibility settings
- ✅ Deck publication with detailed description, strategy guide, and play notes (IMPLEMENTED)
  - Location: Deck publishing system with comprehensive metadata
- ✅ Social voting system with upvotes, downvotes, and favorite marking (IMPLEMENTED)
  - Location: `DeckSocialFeatures` component with voting system
- ✅ Comment system for community feedback and strategy discussion (IMPLEMENTED)
  - Location: Community interaction features in deck system
- ✅ Deck versioning with public change logs and update notifications (IMPLEMENTED)
  - Location: Deck versioning system with change tracking
- ❌ Featured deck highlighting by community moderators and administrators (NOT BUILT)
- ✅ Deck categories and tags for easy discovery (aggro, control, combo, budget, etc.) (IMPLEMENTED)
  - Location: Deck categorization and tagging system
- ✅ Share links for social media and external platform integration (IMPLEMENTED)
  - Location: Social sharing functionality in deck components
- ❌ Embed codes for including decks in blog posts and articles (NOT BUILT)
- ✅ Print-friendly formats for tournament and casual play (IMPLEMENTED)
  - Location: Deck export and printing functionality

#### User Story 4.2: Community Interaction

_As a community member, I want to discover and interact with other players' decks so that I can learn and improve my gameplay._

**UI/UX Implementation:**

- **Pages**: `/community/decks` (Community deck feed), `/community/builders` (Deck builder profiles)
- **Components**:
  - DeckFeed component with infinite scroll and filtering
  - UserFollow component for creator relationships
  - RatingSystem component with detailed feedback
  - RemixInterface component for deck variations
  - MetaTracker component showing tournament trends
- **Community Deck Discovery**:
  - Personalized deck feed based on interests and followed creators
  - Trending decks with heat indicators and popularity metrics
  - "New and Noteworthy" section highlighting fresh content
  - Algorithm-driven recommendations based on user behavior
- **Deck Feed Interface**:
  - Card-based layout with deck previews and key statistics
  - Filter options: Game, format, archetype, creator, date range
  - Sort options: Trending, newest, highest rated, most discussed
  - Infinite scroll with performance optimization
- **User Following System**:
  - Creator profiles with deck portfolio and statistics
  - Follow button with notification preferences
  - "Following" feed showing decks from subscribed creators
  - Creator badges for achievement levels and community recognition
- **Rating and Review System**:
  - 5-star rating with category breakdown (Innovation, Competitiveness, Fun, Budget)
  - Written reviews with character limits and formatting options
  - Review helpfulness voting with community moderation
  - Review aggregation showing average scores and sentiment analysis
- **Deck Remix and Variation Tools**:
  - "Remix this deck" button creating editable copy with attribution
  - Side-by-side comparison showing original vs. remix changes
  - Remix tree visualization showing deck evolution branches
  - "Inspiration from" attribution system for derivative works
- **Tournament Integration**:
  - Tournament winner deck imports with event context
  - Performance statistics showing win rates and meta positioning
  - Tournament deck analysis with matchup breakdowns
  - Pro player deck spotlights with strategy insights
- **Meta Analysis Tools**:
  - Meta snapshot showing popular archetypes and their representation
  - Trending cards analysis with adoption rate tracking
  - Format health metrics with diversity measurements
  - Prediction tools for upcoming meta shifts
- **Community Challenges**:
  - Weekly deck building challenges with themes and constraints
  - Community voting on challenge winners
  - Achievement system for challenge participation
  - Challenge history and leaderboard tracking
- **Expert Content Integration**:
  - Featured reviews from professional players and content creators
  - Strategy articles linked to relevant community decks
  - Video content integration with deck walkthroughs
  - Educational content highlighting deck building principles
- **Mobile Community Experience**:
  - Swipeable deck discovery with Tinder-like interface
  - Quick rating and feedback with simplified controls
  - Push notifications for followed creator updates
  - Offline deck viewing with sync for interactions when connected

**Acceptance Criteria:**

- Deck discovery feed with trending, popular, and recommended decks
- User following system for favorite deck builders and content creators
- Deck rating and review system with detailed feedback categories
- Deck remix functionality allowing users to create variations of popular decks
- Tournament winner deck import and analysis
- Meta deck tracking with win rate statistics and popularity trends
- Deck challenges and competitions with prizes and recognition
- Expert deck reviews and featured content from professional players
- Deck evolution tracking showing how popular decks change over time
- Community-driven deck improvement suggestions and optimizations

#### User Story 4.3: Collaboration Features

_As a team player, I want to collaborate on deck building so that I can work with teammates and friends on deck optimization._

**UI/UX Implementation:**

- **Pages**: `/decks/:id/collaborate` (Collaboration interface), `/teams/:id` (Team workspace)
- **Components**:
  - CollaborativeEditor component with real-time sync
  - PermissionManager component for access control
  - ChangeTracker component showing user attributions
  - TeamChat component for communication
  - VersionBranching component for alternative explorations
- **Real-Time Collaborative Interface**:
  - Multi-user deck editing with live cursor indicators
  - User presence indicators showing who's currently editing
  - Real-time change synchronization with conflict resolution
  - Color-coded user identification for changes and comments
- **Permission and Access Control**:
  - Granular permission system: Owner, Editor, Commenter, Viewer
  - Invite system with email notifications and link sharing
  - Permission revocation with immediate access removal
  - Team role inheritance from group memberships
- **Change Attribution System**:
  - User avatars on changed cards showing who made modifications
  - Change timeline with user attribution and timestamps
  - "Who changed what" filtering for tracking contributions
  - Change approval system for sensitive collaborative projects
- **Integrated Communication Tools**:
  - In-deck commenting system with threaded discussions
  - Card-specific comment anchoring for focused feedback
  - Team chat sidebar with persistent message history
  - Voice chat integration for real-time strategy discussions
- **Version Branching and Management**:
  - Branch creation for exploring alternative deck builds
  - Visual branching tree showing different development paths
  - Branch merging with conflict resolution interface
  - "Stable branch" designation for tested configurations
- **Team Workspace Organization**:
  - Team deck folders with organizational hierarchy
  - Shared resource libraries (card pools, strategy guides)
  - Team meta analysis with collaborative insights
  - Tournament preparation workspace with role assignments
- **Collaborative Analytics**:
  - Team performance metrics showing collaborative effectiveness
  - Individual contribution tracking for team recognition
  - Collaborative deck success rates and tournament performance
  - Team learning analytics showing knowledge transfer
- **Meeting and Session Tools**:
  - Scheduled deck building sessions with calendar integration
  - Screen sharing for deck explanation and teaching
  - Session recording for later review and analysis
  - Action items and task assignment for deck improvements
- **Tournament Team Coordination**:
  - Team deck pool management for format coverage
  - Sideboard coordination to cover team meta expectations
  - Practice schedule coordination with deck assignment
  - Tournament day communication tools and strategy sharing
- **Mobile Collaboration**:
  - Mobile-optimized collaborative editing with simplified interface
  - Push notifications for team member activities and mentions
  - Quick approval/rejection of suggested changes
  - Voice comments for rapid feedback during mobile collaboration

**Acceptance Criteria:**

- Real-time collaborative editing with multiple users working on same deck simultaneously
- User permission system (view, comment, edit) for shared decks
- Change attribution showing who made what modifications
- Collaborative chat and comment system within deck builder
- Version branching allowing different team members to explore alternatives
- Merge functionality for combining changes from multiple contributors
- Team deck folders and organization for group projects
- Video chat integration for real-time discussion during deck building
- Shared deck libraries for teams and gaming groups
- Tournament preparation tools for team coordination and strategy planning

### Epic 5: Import/Export & Tournament Tools

#### User Story 5.1: Multi-Format Import/Export

_As a competitive player, I want to import/export decks in various formats so that I can use my decks across different platforms and tools._

**UI/UX Implementation:**

- **Pages**: `/decks/:id/import-export` (Import/Export interface)
- **Components**:
  - ImportWizard component with format detection
  - ExportManager component with multiple format options
  - FormatConverter component for cross-platform compatibility
  - BackupRestore component for deck collection management
  - APIIntegration component for third-party connections
- **Import Interface**:
  - Multi-method import: File upload, text paste, URL import, clipboard detection
  - Automatic format detection (MTG Arena, MTGO, text list, JSON, XML)
  - Import preview with card matching confidence and error highlighting
  - Bulk import wizard for multiple decks from external platforms
  - Import mapping for non-standard card names and formats
- **Export Options Interface**:
  - Format selection dropdown with preview of output format
  - Purpose-specific exports: Tournament play, online platforms, sharing, backup
  - Custom template builder for specific tournament requirements
  - Batch export for multiple decks with consistent formatting
- **Platform Integration**:
  - Direct integration buttons for popular platforms (Arena, MTGO, Untap.in)
  - "Export to [Platform]" with platform-specific optimizations
  - API key management for authenticated exports
  - Import history tracking from external sources
- **Tournament Formatting**:
  - Official tournament list generation with proper formatting
  - Judge-readable format with clear zone separation
  - Print optimization with space-efficient layouts
  - Registration form auto-fill from deck data
- **QR Code and Mobile Sharing**:
  - QR code generation with customizable data inclusion
  - Mobile-optimized QR scanning for quick deck access
  - Short URL generation for easy sharing
  - Social media optimized sharing with deck previews
- **Backup and Sync Features**:
  - Cloud backup integration (Google Drive, Dropbox, iCloud)
  - Automated backup scheduling with version retention
  - Cross-device synchronization with conflict resolution
  - Export entire deck collection with metadata preservation
- **Custom Export Templates**:
  - Template builder for local tournament requirements
  - Community template sharing with ratings and usage statistics
  - Template versioning for format evolution tracking
- **API and Integration Tools**:
  - RESTful API endpoints for third-party application access
  - Webhook support for automated deck synchronization
  - SDK provision for developers building integrations
- **Mobile Import/Export**:
  - Camera-based import for photographed deck lists
  - Voice input for rapid deck list creation
  - Simplified export sharing with messaging app integration
  - Offline import/export with sync when connected

**Acceptance Criteria:**

- Support for popular deck formats (MTG Arena, MTGO, text lists, JSON, XML)
- Bulk deck import from external deck building platforms
- Export options optimized for different purposes (tournament play, online platforms, sharing)
- Custom export templates for specific tournament or local requirements
- Deck list generation with official tournament formatting
- QR code generation for quick deck sharing and mobile access
- Integration with popular deck tracking websites and applications
- Backup and restore functionality for deck collections
- Cross-platform synchronization with cloud storage services
- API endpoints for third-party application integration

#### User Story 5.2: Tournament Preparation

_As a competitive player, I want tournament preparation tools so that I can optimize my deck for competitive play._

**UI/UX Implementation:**

- **Pages**: `/decks/:id/tournament-prep` (Tournament preparation dashboard)
- **Components**:
  - MetaAnalysis component with current format statistics
  - MatchupPredictor component with win rate calculations
  - SideboardGuide component with matchup-specific recommendations
  - TournamentHistory component tracking performance over time
  - PlaytestTimer component for practice session management
- **Meta Analysis Dashboard**:
  - Current meta snapshot with deck archetype distribution
  - Win rate statistics from recent tournament results
  - Trending decks with popularity and performance metrics
  - Meta evolution timeline showing format development
- **Matchup Analysis Interface**:
  - Matchup table showing predicted win rates against meta decks
  - Color-coded matchup indicators (favorable: green, unfavorable: red)
  - Detailed matchup breakdowns with key interaction points
  - Sideboard impact analysis showing post-board win rates
- **Sideboard Guide Generator**:
  - Automated sideboard recommendations based on meta analysis
  - Matchup-specific card swap suggestions with reasoning
  - Visual guide showing cards in/out for each matchup
  - Testing interface for validating sideboard choices
- **Tournament Registration Tools**:
  - Official registration form pre-filling from deck data
  - Deck list validation against tournament format requirements
  - Judge-friendly printout formatting with clear organization
  - Last-minute deck registration with mobile-optimized interface
- **Practice and Testing Tools**:
  - Integrated timer for practice rounds with tournament time limits
  - Mulligan decision trainer with statistical feedback
  - Opening hand evaluation with keep/mulligan recommendations
  - Goldfish testing interface for combo practice
- **Tournament Day Preparation**:
  - Tournament checklist with essential items and preparation steps
  - Local tournament finder with format and prize information
  - Weather and logistics planning for travel tournaments
  - Emergency contact and backup deck management
- **Performance Tracking**:
  - Tournament result logging with match-by-match details
  - Performance analytics showing strengths and weaknesses
  - Long-term trend analysis for competitive improvement
  - Goal setting and achievement tracking
- **Professional Insights**:
  - Pro player deck recommendations with strategy explanations
  - Video content integration for deck tech and gameplay
  - Strategy article linking for deeper competitive analysis
  - Expert commentary on deck optimization choices
- **Format-Specific Optimizations**:
  - Format rule reminders with recent updates
  - Banned list integration with automatic deck validation
  - Rotation warnings for time-limited formats
  - Local meta adjustments based on regional tournament data
- **Mobile Tournament Tools**:
  - Quick deck list access for tournament registration
  - Timer and scorekeeping tools for matches
  - Tournament bracket tracking and opponent research
  - Real-time deck performance updates during events

**Acceptance Criteria:**

- Meta analysis showing popular decks and win rates in current format
- Matchup analysis predicting performance against common meta decks
- Sideboard guide generation with recommended changes for different matchups
- Tournament history tracking with performance metrics and lessons learned
- Deck registration form generation for official tournament requirements
- Timer integration for playtesting and tournament preparation
- Mulligan decision support based on statistical analysis
- Opening hand evaluation with keep/mulligan recommendations
- Tournament format specific optimizations and rule reminders
- Professional player deck recommendations and strategy guides

## Technical Requirements

### Technology Stack

- **Frontend**: Next.js 14 with React 18 and TypeScript
- **UI Framework**: Tailwind CSS with headless UI components
- **Drag & Drop**: React DnD Kit for smooth drag-and-drop functionality
- **State Management**: Zustand for deck building state management
- **Real-time Features**: Socket.io for collaborative editing
- **Charts**: Chart.js and Recharts for deck analytics visualization
- **Mobile**: Responsive design with touch-optimized interactions

### Database Schema Requirements

#### Decks Table

```sql
CREATE TABLE decks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    game_id UUID NOT NULL REFERENCES games(id),
    format VARCHAR(50) NOT NULL,
    archetype VARCHAR(100),
    visibility deck_visibility DEFAULT 'private',
    featured BOOLEAN DEFAULT FALSE,
    version INTEGER DEFAULT 1,
    tags JSONB DEFAULT '[]',
    colors JSONB DEFAULT '[]',
    mana_curve JSONB,
    statistics JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_modified_by UUID REFERENCES users(id),
    INDEX idx_decks_user (user_id),
    INDEX idx_decks_game_format (game_id, format),
    INDEX idx_decks_visibility (visibility),
    FULLTEXT INDEX idx_decks_search (name, description)
);

CREATE TYPE deck_visibility AS ENUM ('private', 'unlisted', 'public', 'featured');
```

#### Deck Cards Table

```sql
CREATE TABLE deck_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    card_id UUID NOT NULL REFERENCES cards(id),
    zone deck_zone NOT NULL DEFAULT 'main',
    quantity INTEGER NOT NULL DEFAULT 1,
    position INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(deck_id, card_id, zone),
    INDEX idx_deck_cards_deck (deck_id),
    INDEX idx_deck_cards_card (card_id)
);

CREATE TYPE deck_zone AS ENUM ('main', 'sideboard', 'command', 'extra', 'maybe', 'tokens');
```

#### Deck Versions Table

```sql
CREATE TABLE deck_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    change_description TEXT,
    deck_data JSONB NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(deck_id, version_number)
);
```

#### Deck Shares & Collaborations

```sql
CREATE TABLE deck_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    permission_level collaboration_permission DEFAULT 'view',
    invited_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(deck_id, user_id)
);

CREATE TYPE collaboration_permission AS ENUM ('view', 'comment', 'edit', 'admin');
```

#### Deck Social Features

```sql
CREATE TABLE deck_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    vote_type vote_type NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(deck_id, user_id)
);

CREATE TYPE vote_type AS ENUM ('upvote', 'downvote', 'favorite');

CREATE TABLE deck_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    comment_text TEXT NOT NULL,
    parent_comment_id UUID REFERENCES deck_comments(id),
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API Endpoints

#### Deck Management

```typescript
GET /decks - List user's decks with filtering and pagination
POST /decks - Create new deck
GET /decks/:id - Get deck details with full card list
PUT /decks/:id - Update deck metadata and settings
DELETE /decks/:id - Delete deck
POST /decks/:id/cards - Add cards to deck
PUT /decks/:id/cards/:cardId - Update card quantity or zone
DELETE /decks/:id/cards/:cardId - Remove card from deck
POST /decks/:id/clone - Create copy of deck
```

#### Deck Validation & Analysis

```typescript
GET /decks/:id/validate - Validate deck against format rules
GET /decks/:id/analysis - Get comprehensive deck analysis
GET /decks/:id/statistics - Get deck statistics and probabilities
GET /decks/:id/suggestions - Get card suggestions and improvements
POST /decks/:id/simulate - Run opening hand simulations
GET /decks/:id/matchups - Get matchup analysis against meta decks
```

#### Social Features

```typescript
GET /decks/public - Browse public decks with filtering
GET /decks/trending - Get trending and popular decks
POST /decks/:id/vote - Vote on public deck
GET /decks/:id/comments - Get deck comments with pagination
POST /decks/:id/comments - Add comment to deck
PUT /comments/:id - Edit comment
DELETE /comments/:id - Delete comment
POST /decks/:id/share - Share deck with specific users
```

#### Import/Export

```typescript
POST /decks/import - Import deck from various formats
GET /decks/:id/export/:format - Export deck in specified format
POST /decks/bulk-import - Import multiple decks from file
GET /export-formats - Get available export formats and templates
POST /decks/:id/qr-code - Generate QR code for deck sharing
```

#### Collaboration

```typescript
GET /decks/:id/collaborators - List deck collaborators
POST /decks/:id/collaborators - Invite user to collaborate
PUT /decks/:id/collaborators/:userId - Update collaboration permissions
DELETE /decks/:id/collaborators/:userId - Remove collaborator
GET /decks/:id/versions - List deck version history
GET /decks/:id/versions/:version - Get specific deck version
POST /decks/:id/revert/:version - Revert deck to specific version
```

## Business Rules

### Deck Construction Rules

- Decks must contain minimum number of cards based on format requirements
- Maximum 4 copies of any card (or format-specific limits like 1 for Singleton formats)
- Cards must be legal in selected format with ban list enforcement
- Sideboard size limits based on format (15 cards for most Magic formats)
- Commander decks require exactly 1 commander and 99 other unique cards
- Color identity restrictions apply to Commander and other singleton formats

### Sharing and Collaboration Rules

- Public decks must have complete card lists and valid format compliance
- Deck names and descriptions must comply with community guidelines
- Collaborative editing limited to 10 simultaneous users per deck
- Version history limited to last 50 versions per deck
- Public deck comments moderated for appropriate content
- Deck publication requires email-verified account

### Collection Integration Rules

- Owned card quantities updated in real-time across all decks
- Missing card calculations account for cards used in other decks
- Price calculations use current market prices with 24-hour cache
- Shopping cart integration respects vendor minimum order requirements
- Collection sync limited to once per hour for performance

### Performance and Storage Rules

- Decks limited to 1000 unique cards maximum for performance
- Deck analysis calculations cached for 1 hour
- Export file size limited to 10MB for practical sharing
- Real-time collaboration sessions timeout after 2 hours of inactivity
- Deck thumbnails generated automatically and cached on CDN

## Integration Requirements

### TCG Catalog Integration

- Real-time card validation against catalog for deck legality
- Automatic card information population including images and text
- Format legality checking using current ban lists and rotation schedules
- Price integration for collection value and missing card calculations
- Card suggestion engine using catalog similarity algorithms

### Collection & Commerce Integration

- User collection integration showing owned cards in deck builder
- Shopping cart integration for purchasing missing cards directly
- Vendor integration for price comparison and availability checking
- Wishlist integration for tracking desired cards across decks
- Inventory tracking for physical card location and organization

### Community System Integration

- User profile integration showing created and favorite decks
- Social features integration with following, messaging, and forums
- Tournament integration for deck registration and result tracking
- Achievement system integration for deck building milestones
- Content creation tools integration for strategy guides and articles

### External Platform Integration

- MTG Arena deck import/export for Magic decks
- PTCGO/Live integration for Pokémon deck synchronization
- YGOPro integration for Yu-Gi-Oh! deck testing
- Third-party deck sites API integration for content sharing
- Mobile app synchronization for offline deck building capability

## Performance Requirements

### Response Time Targets

- Deck loading: < 1 second for decks up to 100 cards
- Card search within builder: < 200ms
- Deck validation: < 300ms for complete validation
- Real-time collaboration updates: < 100ms latency
- Deck analysis calculations: < 2 seconds for comprehensive analysis

### Scalability Requirements

- Support 1M+ active decks across all users
- Handle 10,000+ concurrent deck building sessions
- Process 100,000+ deck validations per hour
- Support real-time collaboration for 1,000+ concurrent sessions
- Analytics calculations for millions of card combinations

### Mobile Performance

- Touch-optimized interface with smooth drag-and-drop on mobile devices
- Offline functionality for viewing and editing existing decks
- Progressive loading for large deck collections
- Mobile-optimized image loading with adaptive quality
- Battery-efficient real-time updates and synchronization

## Security Requirements

### Data Protection

- Deck data encryption for private and sensitive decks
- User permission validation for all deck operations
- Input sanitization for deck names, descriptions, and comments
- Rate limiting on deck operations to prevent abuse
- Secure session management for collaborative editing

### Content Moderation

- Automated content filtering for inappropriate deck names and descriptions
- Community reporting system for problematic public decks
- Moderation queue for newly published public decks
- User blocking and reporting functionality for harassment prevention
- DMCA compliance for copyrighted card images and content

## Testing Requirements

### Functional Testing

- Complete deck building workflow testing across all supported games
- Format validation testing with comprehensive rule sets and edge cases
- Import/export testing with various file formats and large datasets
- Collaborative editing testing with concurrent users and conflict resolution
- Mobile interface testing across different devices and screen sizes

### Performance Testing

- Load testing for concurrent deck building and analysis operations
- Stress testing for large deck collections and complex deck operations
- Real-time collaboration testing with multiple concurrent users
- Database performance testing for complex deck queries and analytics
- Mobile performance testing for touch interactions and offline functionality

### Integration Testing

- TCG Catalog integration testing for accurate card data and validation
- Collection system integration testing for ownership tracking
- Commerce integration testing for shopping and purchasing workflows
- External platform integration testing for import/export functionality
- Social features integration testing for sharing and community interaction

## UI/UX Requirements

### Deck Builder Interface Design

#### Main Deck Builder Layout (`/decks/builder/new`, `/decks/[deckId]/edit`)

**Interface Structure:**

- **Header Section**:
  - Deck name input with auto-save indicator
  - Format selector with format badge and legality status
  - Game type selector (MTG, Pokémon, Yu-Gi-Oh!, One Piece)
  - Action toolbar (save, share, export, delete, duplicate)
  - Collaboration status indicator with active collaborator avatars

**Three-Panel Layout:**

- **Left Panel - Card Search (30% width)**:
  - Universal search bar with autocomplete
  - Advanced filter sidebar with collapsible sections
  - Search results grid with card previews
  - Filter tags showing active search criteria
  - Recent cards and frequently used cards sections
- **Center Panel - Deck Zones (45% width)**:
  - Tabbed zone interface (Main Deck, Sideboard, Command Zone)
  - Card count and deck size indicators per zone
  - Visual deck composition with card images
  - Mana curve visualization overlay
  - Zone-specific statistics and validation status
- **Right Panel - Analysis & Tools (25% width)**:
  - Real-time deck statistics dashboard
  - Collection integration panel
  - Shopping cart for missing cards
  - Deck validation and legality checker
  - Quick actions and shortcuts menu

#### Drag-and-Drop Interaction Design

**Card Addition Interface:**

- **Search Results Interactions**:
  - Hover effects with card preview and collection status
  - Drag handles with visual feedback and quantity badges
  - Right-click context menus for quick actions
  - Double-click to add single card to main deck
  - Shift-click for bulk quantity selection
- **Drop Zone Design**:
  - Visual drop zone highlighting during drag operations
  - Zone-specific drop indicators with validation feedback
  - Automatic quantity adjustment for duplicate cards
  - Invalid drop feedback with explanatory messages
  - Smooth animations and transition effects
- **Card Management**:
  - In-deck card tiles with quantity controls (+/- buttons)
  - Quick removal with delete key or right-click
  - Drag between zones with automatic validation
  - Bulk selection with Ctrl+click and Shift+click
  - Undo/redo functionality with visual history

#### Card Search Integration

**Advanced Search Interface:**

- **Search Bar Design**:
  - Intelligent autocomplete with card name suggestions
  - Recent search history dropdown
  - Clear search and advanced search toggle buttons
  - Voice search integration for mobile devices
- **Filter Panel Organization**:
  - **Format & Legality**: Current format legal cards toggle
  - **Collection Status**: Owned, missing, wishlist filters
  - **Card Attributes**: Mana cost sliders, type checkboxes, rarity filters
  - **Advanced Criteria**: Keywords, abilities, synergy matching
  - **Price Range**: Market price filtering with budget constraints
- **Search Results Display**:
  - Grid view with hover zoom and collection indicators
  - List view with detailed card information
  - Sort options (name, mana cost, price, collection status)
  - Infinite scroll with loading indicators
  - Bulk selection for multiple card operations

### Deck Analysis Dashboard Design

#### Statistics Visualization Panel

**Mana Curve Analysis:**

- **Interactive Histogram**:
  - Color-coded bars by card type and color identity
  - Hover details showing specific cards at each mana cost
  - Optimal curve overlay with meta comparison
  - Zone-specific curve analysis (main deck vs sideboard)
  - Mobile-optimized touch interaction and zoom

**Card Type Distribution:**

- **Interactive Pie Charts**:
  - Animated pie chart with drill-down capability
  - Color-coded segments with percentage and count labels
  - Legend with toggle visibility for chart segments
  - Comparison overlay with meta deck averages
  - Export functionality for strategy documentation

**Draw Probability Calculator:**

- **Probability Interface**:
  - Card selection dropdown with autocomplete
  - Turn-by-turn probability display with interactive timeline
  - Opening hand simulator with mulligan recommendations
  - Combo probability calculator for card combinations
  - Scenario testing with customizable parameters

#### Deck Health Indicators

**Validation Status Panel:**

- **Format Legality Display**:
  - Green/red status indicators with detailed explanations
  - Banned cards highlighting with replacement suggestions
  - Deck size requirements with visual progress bars
  - Card quantity violations with correction recommendations
- **Performance Metrics**:
  - Deck speed analysis with turn-by-turn breakdown
  - Consistency scoring based on card synergies
  - Competitive viability rating compared to meta
  - Weakness identification with improvement suggestions

### Deck Browsing Interface Design

#### Deck Gallery Page (`/decks`)

**Browse Interface Layout:**

- **Header Section**:
  - Game selector tabs with active game highlighting
  - View mode toggle (grid, list, detailed)
  - Sort options (newest, popular, competitive, budget)
  - Filter sidebar toggle and search bar
- **Filter Sidebar**:
  - **Game & Format**: Multi-select checkboxes with format badges
  - **Deck Archetype**: Category tags (Aggro, Control, Combo, Midrange)
  - **Collection Match**: Decks I can build, partial matches, aspirational
  - **Creator**: Following, featured builders, community favorites
  - **Deck Status**: Recent updates, tournament results, popularity trends
- **Deck Grid Display**:
  - Deck thumbnail with key card previews
  - Deck name, creator, and format badges
  - Statistics overlay (cost, colors, archetype)
  - Social indicators (likes, comments, shares)
  - Collection completion percentage for logged-in users

#### Deck Detail Page (`/decks/[deckId]`)

**Comprehensive Deck View:**

- **Hero Section**:
  - Deck name and description with creator attribution
  - Format badge and legality status
  - Social action buttons (like, share, favorite, clone)
  - Collection completion status with missing card breakdown
- **Deck Composition Display**:
  - Visual card list with images and quantities
  - Zone organization (main deck, sideboard, command zone)
  - Mana curve and statistics visualization
  - Card interaction highlights and combo indicators
- **Community Engagement**:
  - Rating and review system with deck feedback
  - Comment section with threading and voting
  - Version history with change logs and updates
  - Similar deck recommendations and alternatives

### Collection Integration Interface

#### Owned Card Display

**Collection Status Indicators:**

- **Card Ownership Overlays**:
  - Green checkmark for owned cards with quantity display
  - Red X for missing cards with "Need X" indicator
  - Yellow warning for insufficient quantities
  - Wishlist star for tracked cards
  - Price tags for missing cards with vendor links
- **Collection Summary Panel**:
  - Completion percentage with visual progress bar
  - Total deck value and owned value breakdown
  - Missing cards list with priority and cost analysis
  - Budget tracking with spending recommendations

#### Shopping Integration

**Purchase Planning Interface:**

- **Shopping Cart Integration**:
  - One-click "Add Missing Cards" button
  - Vendor comparison with price and condition options
  - Bundle optimization for shipping cost savings
  - Condition preference settings with visual condition guides
- **Budget Management**:
  - Budget tracker with spending alerts and limits
  - Priority ranking for card acquisitions
  - Payment plan suggestions for expensive cards
  - Group purchase coordination with other users

### Social Features Interface Design

#### Deck Sharing Controls

**Privacy and Sharing Settings:**

- **Visibility Controls**:
  - Public/private toggle with explanation
  - Share with specific users or groups
  - Tournament-only visibility for competitive decks
  - Version control for shared deck updates
- **Social Media Integration**:
  - One-click sharing to Twitter, Discord, Reddit
  - Embeddable deck widgets for external sites
  - QR code generation for easy mobile sharing
  - Print-friendly deck lists for tournaments

#### Community Collaboration

**Collaborative Deck Building:**

- **Real-time Collaboration Interface**:
  - Live cursor indicators showing collaborator activity
  - Change highlighting with color-coded user attribution
  - Comment and suggestion system with thread resolution
  - Version conflict resolution with merge tools
- **Community Features**:
  - Deck rating system with detailed feedback categories
  - Featured deck highlighting with community voting
  - Deck challenge system for testing and improvement
  - Tournament integration with deck registration

### Mobile Deck Building Experience

#### Mobile-Optimized Interface (< 768px)

**Touch-First Design:**

- **Simplified Layout**:
  - Single-panel view with swipe navigation
  - Bottom sheet design for tools and analysis
  - Collapsible sections to maximize screen space
  - Touch-friendly card tiles with gesture controls
- **Mobile Interactions**:
  - Long press for card preview and actions
  - Swipe gestures for zone switching and navigation
  - Pull-to-refresh for deck synchronization
  - Haptic feedback for drag-and-drop operations
- **Mobile-Specific Features**:
  - Camera integration for physical card scanning
  - Voice search with offline capability
  - Offline deck editing with sync when online
  - Native sharing integration with mobile apps

#### Progressive Web App Features

**Advanced Mobile Functionality:**

- **Offline Capabilities**:
  - Cached deck data for offline viewing and editing
  - Local storage for deck changes with sync queue
  - Offline card database for core functionality
  - Background sync for collaboration and updates
- **Native Integration**:
  - Home screen installation with app-like experience
  - Push notifications for deck updates and collaboration
  - Native file sharing for deck import/export
  - Device orientation optimization for deck building

### Import/Export Interface Design

#### Import Wizard

**Multi-Format Import Process:**

- **File Upload Interface**:
  - Drag-and-drop upload zone with format detection
  - Supported format indicators (MTG Arena, PTCGO, YGOPro, etc.)
  - File validation with error reporting and suggestions
  - Preview mode showing interpreted deck structure
- **Import Configuration**:
  - Card mapping interface for unrecognized cards
  - Format selection with automatic detection
  - Collection integration toggle for ownership tracking
  - Import options (new deck, merge with existing, replace)
- **Import Results**:
  - Success/failure summary with detailed error reporting
  - Missing card identification with purchase suggestions
  - Deck validation results with format compliance check
  - Import history with re-import and rollback options

#### Export Options

**Multi-Platform Export:**

- **Export Format Selection**:
  - Platform-specific formats with preview
  - Custom format builder for specialized needs
  - Batch export for multiple decks
  - Version selection for historical exports
- **Export Customization**:
  - Include/exclude specific zones and information
  - Template selection for tournament submission
  - Image quality and format options
  - Metadata inclusion for tracking and attribution

### Performance Optimization

#### Deck Builder Performance Targets

- **Interface Responsiveness**: < 50ms for drag-and-drop feedback
- **Card Search Results**: < 200ms for filter application and results
- **Deck Analysis Updates**: < 500ms for real-time statistics
- **Collaboration Sync**: < 100ms for multi-user change propagation
- **Mobile Touch Response**: < 32ms for native-feeling interactions

#### Optimization Strategies

- **Data Management**:
  - Virtual scrolling for large card databases
  - Lazy loading for card images and details
  - Progressive enhancement for advanced features
  - Service worker caching for offline functionality
- **Real-time Features**:
  - WebSocket connections for collaboration
  - Optimistic UI updates with rollback capability
  - Debounced search and filter operations
  - Background prefetching for frequently accessed content

### Accessibility Requirements

#### Deck Builder Accessibility

**WCAG 2.1 AA Compliance:**

- **Keyboard Navigation**:
  - Full keyboard support for all drag-and-drop operations
  - Tab order optimization for efficient deck building
  - Keyboard shortcuts for power users and accessibility
  - Focus management for modal dialogs and overlays
- **Screen Reader Optimization**:
  - Semantic markup for deck structure and zones
  - Live regions for dynamic content updates
  - Detailed alt text for card images and statistics
  - ARIA labels for complex UI components

#### Visual and Motor Accessibility

- **Visual Accessibility**:
  - High contrast mode for better visibility
  - Scalable text and UI elements
  - Color-blind friendly color schemes
  - Alternative visual indicators beyond color alone
- **Motor Accessibility**:
  - Alternative input methods for drag-and-drop
  - Large touch targets for mobile users
  - Voice commands for hands-free operation
  - Customizable gesture sensitivity and timing

### Testing Requirements

#### Deck Builder Testing

- **Functionality Testing**: Complete deck building workflows across all games
- **Collaboration Testing**: Real-time multi-user editing and conflict resolution
- **Performance Testing**: Large deck operations and complex analysis calculations
- **Mobile Testing**: Touch interactions, gestures, and responsive behavior
- **Accessibility Testing**: Screen reader compatibility and keyboard navigation

#### Integration Testing

- **Collection Integration**: Ownership tracking and shopping integration
- **Social Features**: Sharing, collaboration, and community interaction
- **External Platforms**: Import/export with various external platforms
- **Cross-browser Testing**: Drag-and-drop functionality across all browsers
- **Offline Testing**: Progressive web app functionality and sync capabilities
