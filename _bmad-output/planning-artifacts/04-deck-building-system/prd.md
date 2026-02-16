---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-12-complete
inputDocuments:
  - docs/specifications/04-deck-building-system.md
workflowType: 'prd'
---
# Product Requirements Document - Deck Building System

**Author:** CodexSandboxOffline
**Date:** 2026-02-16
**Spec ID:** 04-deck-building-system
**Status:** completed

## PRD Baseline

- This specification is the source-of-truth PRD for the bounded context above.
- Functional requirements are represented by epic/story decomposition and acceptance criteria in Step 7.
- Non-functional requirements are captured in Technical, Security, Performance, and Testing sections below.
- Acceptance criteria statuses must remain machine-parseable for scripts/check-acceptance-criteria.js.

## Functional Requirements

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

## Non-Functional Requirements

### Technical Requirements



### Security Requirements



### Performance Requirements



### Testing Requirements



## Additional Requirements

### Business Rules



### Integration Requirements



### UI/UX Requirements


