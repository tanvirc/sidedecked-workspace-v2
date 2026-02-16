---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - docs/specifications/03-tcg-catalog-card-database-system.md
---
# TCG Catalog & Card Database System - Epic Breakdown

## Overview

This document decomposes 03-tcg-catalog-card-database-system into implementation-ready epics and stories for BMAD execution.

## Requirements Inventory

### Functional Requirements

- Universal Card Database
- Data Import & ETL Pipeline
- Image Management & CDN
- Search & Discovery Integration

### NonFunctional Requirements

- Technical requirements are synchronized from the source specification.
- Security and performance constraints are synchronized from the source specification.

### Additional Requirements

- Business rules and integration constraints remain authoritative in the source specification.

### FR Coverage Map

- Epic-to-story coverage is represented by the complete story list below.

## Epic List

- Universal Card Database
- Data Import & ETL Pipeline
- Image Management & CDN
- Search & Discovery Integration

## Story Index

- Card Information Management
- Set and Series Organization
- Card Identification & SKU System
- Automated Data Import
- Data Normalization & Validation
- Card Image Processing
- Custom Image Upload
- Advanced Card Search

## Full Epic and Story Breakdown

### Epic 1: Universal Card Database

#### User Story 1.1: Card Information Management

_As a system administrator, I want to maintain accurate card information across all supported TCG games so that users can find reliable data for any card._

**UI/UX Implementation:**

- **Pages**: `/admin/cards` (Admin card management), `/admin/cards/:id` (Card editing interface)
- **Components**:
  - CardDataForm component with game-specific fields
  - MultiLanguageEditor component for internationalization
  - LegalityTracker component for format management
  - VersionHistory component for change tracking
  - RelatedCardsManager component for linking reprints
- **Card Management Dashboard**:
  - Searchable table with all cards across supported games
  - Game filter tabs (MTG, Pokémon, Yu-Gi-Oh!, One Piece) with game icons
  - Bulk operations for mass updates (legality changes, price updates)
  - Import queue showing pending data processing jobs
  - Data quality indicators with validation status
- **Card Editing Interface**:
  - Tabbed form layout: Basic Info, Game Attributes, Legality, Images, History
  - Real-time validation with error highlighting
  - Preview pane showing how card appears to users
  - Side-by-side comparison with previous versions
  - Batch edit mode for similar cards or reprints
- **Game-Specific Attribute Management**:
  - Dynamic form fields based on selected game
  - MTG: Mana cost builder, power/toughness, color identity
  - Pokémon: Energy types, HP, evolution stage, retreat cost
  - Yu-Gi-Oh!: ATK/DEF, level/rank, monster types, spell/trap categories
  - One Piece: Cost, power, counter, color, character types
- **Multi-Language Support Interface**:
  - Language tab selector with flag icons
  - Translation status indicators (complete, partial, missing)
  - Google Translate integration for initial translations
  - Community translation submission system
  - Translation approval workflow for quality control
- **Version Control Visualization**:
  - Timeline view of card changes with timestamps
  - Diff viewer highlighting changes between versions
  - Rollback functionality with confirmation dialogs
  - Change attribution and approval status
- **Mobile Admin Interface**:
  - Simplified card editing for urgent updates
  - Photo upload for quick image additions
  - Approval queue for mobile review and processing
  - Critical alert notifications for data issues

**Acceptance Criteria:**

- ✅ Support for Magic: The Gathering, Pokémon, Yu-Gi-Oh!, and One Piece card games (IMPLEMENTED)
  - Location: `Card.ts` entity with game relationship, `master-etl.ts` supports multiple games
- ✅ Each card entry includes: name, mana cost/energy, type, subtype, rarity, rules text, flavor text, artist, power/toughness (when applicable) (IMPLEMENTED)
  - Location: `Card.ts` entity has comprehensive field structure
- ✅ Set information: set name, set code, release date, card number in set, total cards in set (IMPLEMENTED)
  - Location: `CardSet.ts` entity with complete set metadata
- ✅ Print variations: first edition, unlimited, promotional, alternate art, foil treatments (IMPLEMENTED)
  - Location: `Print.ts` entity for print-specific data
- 🔄 Multi-language support for card names and text (English, Japanese, German, French, Spanish, Italian, Portuguese, Chinese, Korean) (PARTIAL)
  - Location: Structure exists but language support needs verification
- ✅ Unique identification system for each card print with standardized SKU format (IMPLEMENTED)
  - Location: `oracleId` and `oracleHash` in Card.ts, SKU system implemented
- ✅ Card legality information for different competitive formats (Standard, Modern, Legacy, etc.) (IMPLEMENTED)
  - Location: Format legality fields in `isCardLegal` function in cards.ts
- 🔄 Collectibility data: popularity scores, investment potential, market demand indicators (PARTIAL)
  - Location: Analytics exist but collectibility scoring needs verification
- ✅ Related card linking (reprints, alternate versions, transformation cards, token cards) (IMPLEMENTED)
  - Location: Print relationships and card linking system implemented
- ✅ Version control for card data with complete change history (IMPLEMENTED)
  - Location: ETL tracking system with job history

#### User Story 1.2: Set and Series Organization

_As a user, I want to browse cards by set and series so that I can explore card collections systematically._

**UI/UX Implementation:**

- **Pages**: `/sets` (Set browser), `/sets/:game` (Game-specific sets), `/sets/:id` (Individual set page)
- **Components**:
  - SetBrowser component with hierarchical navigation
  - SetCard component with metadata display
  - CompletionTracker component for collection progress
  - SpoilerMode component for upcoming releases
  - SetStatistics component with rarity distribution
- **Set Browser Interface**:
  - Game selection tabs with distinctive visual styling per game
  - Chronological timeline view showing set release progression
  - Grid view with set artwork and key information
  - Search functionality for finding specific sets
  - Filter options: release year, set type, block/series
- **Hierarchical Navigation**:
  - Breadcrumb navigation: Game → Block/Series → Set → Cards
  - Collapsible tree structure for complex set relationships
  - Block groupings with visual connectors showing relationships
  - Quick jump navigation to related sets
- **Set Information Cards**:
  - Set artwork/logo as primary visual element
  - Release date with countdown for upcoming sets
  - Card count with completion percentage for collectors
  - Rarity distribution pie chart or bar graph
  - Set symbols with official styling and hover tooltips
- **Individual Set Pages**:
  - Hero section with large set artwork and key details
  - Card grid showing all cards in collector number order
  - Filtering within set (rarity, card type, color)
  - Spoiler view toggle for preview cards and leaks
  - Collection completion tracking for authenticated users
- **Collection Integration**:
  - Progress bars showing set completion percentage
  - "Cards owned" vs "total cards" counters
  - Missing cards highlight for easy identification
  - Wishlist integration for wanted cards
  - Value estimation for complete sets
- **Mobile Set Browsing**:
  - Swipeable set cards for easy navigation
  - Compact set information with expandable details
  - Touch-friendly completion tracking controls
  - Voice search for set names and years

**Acceptance Criteria:**

- ✅ Hierarchical organization: Game → Block/Series → Set → Cards (IMPLEMENTED)
  - Location: `CardSet.ts` with game relationships, hierarchical navigation in `CardBrowsingPage.tsx`
- ✅ Set metadata: release date, set type (expansion, core, promotional), set symbol, total cards (IMPLEMENTED)
  - Location: `CardSet.ts` entity includes comprehensive set metadata
- ✅ Automatic set organization with chronological ordering (IMPLEMENTED)
  - Location: Set ordering logic in `getSets` function
- 🔄 Set completeness tracking showing available vs. total cards (PARTIAL)
  - Location: Card count tracking exists but UI display needs verification
- 🔄 Block/series grouping for related sets (e.g., Ixalan block, Sword & Shield series) (PARTIAL)
  - Location: Set relationships exist but grouping UI unclear
- ✅ Special set handling (promotional sets, preview cards, digital-only releases) (IMPLEMENTED)
  - Location: Set type handling in ETL system
- ❌ Set rarity distribution visualization and statistics (NOT BUILT)
- ✅ Browse interface with filtering by set attributes (IMPLEMENTED)
  - Location: Set filtering in `CardBrowsingPage.tsx` and search system

#### User Story 1.3: Card Identification & SKU System

_As a vendor, I want to accurately identify any card so that my listings are correctly categorized and searchable._

**UI/UX Implementation:**

- **Pages**: `/sell/identify` (Card identification tool), Listing creation with card selector
- **Components**:
  - CardIdentifier component with multiple input methods
  - VisualRecognition component using image upload
  - SKUDisplay component with copy functionality
  - VariantSelector component for print differences
  - FuzzyMatchResults component for similar cards
- **Card Identification Interface**:
  - Multiple identification methods in tabbed interface:
    - Text search with autocomplete
    - Barcode scanner (mobile camera integration)
    - Visual recognition from uploaded photo
    - Manual entry with game-specific forms
- **Visual Recognition Tool**:
  - Drag-and-drop image upload area with preview
  - Mobile camera integration with real-time recognition
  - Crop tool for focusing on card details
  - Confidence score display for recognition accuracy
  - Multiple match results with similarity percentages
- **Search Interface with Fuzzy Matching**:
  - Smart autocomplete handling misspellings and partial names
  - "Did you mean?" suggestions for close matches
  - Recent searches history for quick re-selection
  - Voice input for hands-free searching
- **Card Selection Results**:
  - Grid layout showing matched cards with key details
  - Variant selector for different prints of same card
  - Side-by-side comparison for similar cards
  - Confidence indicators for automated matches
- **SKU Generation Display**:
  - Large, prominent SKU display with copy button
  - SKU breakdown explanation showing each component
  - QR code generation for the SKU for physical reference
  - Batch SKU generation for multiple cards
- **Variant Management Interface**:
  - Print variation selector (foil, first edition, promo, etc.)
  - Visual comparison between variants with hover zoom
  - Rarity and treatment badges with official styling
  - Price impact indicators for different variants
- **Barcode Scanner Integration**:
  - Camera viewfinder with scan guidance overlay
  - Real-time barcode detection with success feedback
  - Manual barcode entry as fallback option
  - Scan history for recently identified cards
- **Mobile Identification Optimization**:
  - One-handed operation with large touch targets
  - Offline mode for previously cached card data
  - Voice commands for accessibility
  - Haptic feedback for successful identifications

**Acceptance Criteria:**

- ✅ Universal SKU format: [GAME]-[SET_CODE]-[CARD_NUMBER]-[LANGUAGE]-[TREATMENT] (IMPLEMENTED)
  - Location: SKU generation system in `SKUValidationService.ts`
- ✅ Example: MTG-NEO-123-EN-FOIL, PKM-BST-001-JP-HOLO, YGO-LOB-001-EN-1ST (IMPLEMENTED)
  - Location: SKU format validation and generation
- ❌ Barcode integration for physical card identification where available (NOT BUILT)
- ❌ Visual identification system using machine learning for image-based card recognition (NOT BUILT)
- ✅ Fuzzy matching for partial or misspelled card names (IMPLEMENTED)
  - Location: Search functionality with fuzzy matching in `SearchService.ts`
- ✅ Duplicate detection and consolidation across data sources (IMPLEMENTED)
  - Location: `oracleHash` deduplication system in Card entity
- ✅ Variant tracking (alternate artwork, special frames, promotional versions) (IMPLEMENTED)
  - Location: Print entity tracks variants and treatments
- 🔄 Print run information and scarcity indicators (PARTIAL)
  - Location: Print data exists but scarcity calculation needs verification
- ✅ Cross-reference system for reprints across multiple sets (IMPLEMENTED)
  - Location: Card-Print relationships handle reprints
- ✅ API endpoint for third-party applications to verify card identity (IMPLEMENTED)
  - Location: Customer backend API endpoints for card identification

### Epic 2: Data Import & ETL Pipeline

#### User Story 2.1: Automated Data Import

_As a system administrator, I want to automatically import card data from multiple sources so that the catalog stays current without manual intervention._

**UI/UX Implementation:**

- **Pages**: `/admin/imports` (Import management dashboard), `/admin/imports/:id` (Individual import details)
- **Components**:
  - ImportDashboard component with real-time status
  - DataSourceManager component for configuration
  - ImportScheduler component with cron interface
  - ErrorQueue component for failed imports
  - PerformanceMonitor component with metrics
- **Import Management Dashboard**:
  - Real-time status board showing all active import jobs
  - Color-coded status indicators (green: success, yellow: running, red: failed)
  - Import source tiles with last success timestamp and next scheduled run
  - Quick action buttons: pause, resume, retry, configure
  - Performance metrics: records processed, success rate, average duration
- **Data Source Configuration Interface**:
  - Source management cards for each provider (Wizards, Nintendo, Konami, etc.)
  - Toggle switches for enabling/disabling sources
  - Priority ranking drag-and-drop interface for conflict resolution
  - API credentials management with secure input fields
  - Connection testing with status indicators
- **Import Scheduler Interface**:
  - Visual cron builder with dropdown selectors
  - Calendar view showing scheduled import times
  - Time zone configuration with visual time zone map
  - Import frequency templates (daily, weekly, on-demand)
  - Conflict resolution for overlapping imports
- **Import Job Monitoring**:
  - Progress bars for active imports with ETA estimates
  - Log viewer with real-time streaming for debugging
  - Resource usage monitoring (CPU, memory, database connections)
  - Import statistics: new cards, updated cards, skipped records
- **Error Management Interface**:
  - Error queue with categorized failure types
  - Batch retry functionality for failed records
  - Error trend analysis with charts showing common issues
  - Manual review interface for ambiguous records
  - Email alert configuration for critical failures
- **Performance Dashboard**:
  - Historical performance charts (success rates, processing times)
  - Data source comparison metrics
  - System health indicators with threshold alerts
  - Optimization suggestions based on performance data
- **Mobile Admin Monitoring**:
  - Critical alert notifications with action buttons
  - Simplified status overview for quick health checks
  - Emergency stop functionality for problematic imports
  - Voice alerts for critical system failures

**Acceptance Criteria:**

- ✅ Automated daily imports from official sources (Wizards, Nintendo, Konami, Bandai) (IMPLEMENTED)
  - Location: `master-etl.ts` with scheduled ETL jobs
- ✅ Integration with community databases (MTGJson, Scryfall, PokeAPI, YGOPRODECK) (IMPLEMENTED)
  - Location: ETL system supports multiple data sources
- ✅ Configurable import schedules for different data sources (IMPLEMENTED)
  - Location: `ETLService.ts` with job scheduling
- ✅ Import validation with error reporting and manual review queues (IMPLEMENTED)
  - Location: `ETLQueue.ts` and job validation system
- ✅ Incremental updates to avoid full database rebuilds (IMPLEMENTED)
  - Location: ETL system supports incremental updates
- ✅ Rollback capability for problematic imports (IMPLEMENTED)
  - Location: ETL job tracking with rollback capability
- ✅ Import performance metrics and monitoring (IMPLEMENTED)
  - Location: ETL monitoring and performance tracking
- 🔄 Data source health checking and automatic failover (PARTIAL)
  - Location: Health checking exists but failover needs verification
- ✅ Custom data source integration for specialized catalogs (IMPLEMENTED)
  - Location: Extensible ETL system for custom sources

#### User Story 2.2: Data Normalization & Validation

_As a system administrator, I want imported data to be standardized and validated so that all card information is consistent and accurate._

**UI/UX Implementation:**

- **Pages**: `/admin/validation` (Data quality dashboard), `/admin/validation/rules` (Validation rule management)
- **Components**:
  - ValidationDashboard component with quality metrics
  - RuleEditor component for validation logic
  - DataQualityReport component with visual indicators
  - NormalizationPreview component for rule testing
  - ConflictResolution component for duplicate handling
- **Data Quality Dashboard**:
  - Overall quality score with color-coded gauge (red < 70%, yellow 70-90%, green > 90%)
  - Quality metrics by data source with comparison charts
  - Issue categories breakdown (formatting, missing data, duplicates, conflicts)
  - Trend analysis showing data quality improvement over time
  - Quick action buttons for common fixes
- **Validation Rule Management**:
  - Rule builder interface with drag-and-drop logic components
  - Game-specific validation templates (MTG mana costs, Pokémon energy types)
  - Rule testing sandbox with sample data preview
  - Rule performance metrics (execution time, error rates)
  - Version control for validation rules with rollback capability
- **Data Normalization Interface**:
  - Before/after comparison view for normalization rules
  - Batch processing interface with progress tracking
  - Exception handling for edge cases with manual override options
  - Pattern recognition for common data inconsistencies
- **Duplicate Detection & Resolution**:
  - Duplicate candidate pairs with similarity scoring
  - Side-by-side comparison interface for merge decisions
  - Automatic merge suggestions based on data source priority
  - Merge preview with conflict highlighting
  - Bulk resolution tools for similar duplicate patterns
- **Validation Report Viewer**:
  - Detailed validation reports with expandable error categories
  - Interactive charts showing error distribution by source and type
  - Drill-down capability from summary to individual record issues
  - Export functionality for sharing reports with stakeholders
- **Manual Override Interface**:
  - Card-by-card review queue for validation exceptions
  - Evidence panel showing conflicting data sources
  - Admin decision tracking with reasoning documentation
  - Approval workflow for sensitive data modifications
- **Image Validation Tools**:
  - Image quality assessment with automated scoring
  - Broken link detection with re-hosting suggestions
  - Copyright compliance checking with fair use guidelines
  - Bulk image processing with progress indicators
- **Mobile Validation Interface**:
  - Simplified validation queue for quick approvals
  - Image validation with swipe gestures (approve/reject)
  - Voice notes for validation decisions
  - Offline capability for reviewing cached validation issues

**Acceptance Criteria:**

- ✅ Automatic data cleaning (standardized naming, consistent formatting) (IMPLEMENTED)
  - Location: Data normalization in ETL pipeline
- ✅ Validation rules for each game's specific attributes and constraints (IMPLEMENTED)
  - Location: Game-specific validation in ETL system
- ✅ Mana cost/energy cost parsing and standardization across games (IMPLEMENTED)
  - Location: Game-specific parsing logic in ETL
- ✅ Card type hierarchy validation (Creature → Beast, Pokémon → Fire type, etc.) (IMPLEMENTED)
  - Location: Type validation in card processing
- ✅ Image URL validation and automatic rehosting to local CDN (IMPLEMENTED)
  - Location: `ImageQueue.ts` handles image processing and hosting
- ✅ Text formatting standardization (symbols, italics, rules text formatting) (IMPLEMENTED)
  - Location: Text processing in ETL normalization
- ✅ Duplicate detection across data sources with merge capabilities (IMPLEMENTED)
  - Location: `oracleHash` deduplication system

### Epic 3: Image Management & CDN

#### User Story 3.1: Card Image Processing

_As a user, I want to see high-quality card images that load quickly so that I can properly evaluate cards for purchase or deck building._

**UI/UX Implementation:**

- **Components across all card display interfaces**:
  - ResponsiveCardImage component with multiple size variants
  - ImageGallery component for multiple card versions
  - LazyLoadImage component for performance optimization
  - ImagePlaceholder component for missing artwork
  - ZoomableImage component for detailed inspection
- **Card Image Display Standards**:
  - Thumbnail (150x200px): Card grid views, search results, collection displays
  - Medium (300x400px): Card detail previews, deck builder interface
  - Large (600x800px): Card detail pages, comparison views
  - Full-resolution (1200x1600px): Zoom mode, condition assessment
- **Progressive Loading Interface**:
  - Low-quality placeholder (LQIP) loads first with blur effect
  - Progressive enhancement as higher quality image loads
  - Smooth fade transition between quality levels
  - Loading skeleton animation during image fetch
- **Image Quality Optimization**:
  - WebP format with JPEG fallback for older browsers
  - Automatic format detection and serving
  - Compression level optimization balancing quality and size
  - Responsive image serving based on device pixel ratio
- **Zoom & Inspection Features**:
  - Hover zoom functionality on desktop with magnifying glass cursor
  - Pinch-to-zoom gesture support on mobile devices
  - Full-screen image modal with swipe navigation
  - Image annotation overlay for highlighting card features
- **Missing Image Handling**:
  - Attractive placeholder designs with game-specific styling
  - "Image coming soon" messaging with set release context
  - Community image submission prompts for missing cards
  - Alternative text descriptions for accessibility
- **Performance Optimizations**:
  - Lazy loading with intersection observer API
  - Image preloading for likely next views (upcoming cards in list)
  - CDN integration with global edge caching
  - Service worker caching for frequently viewed cards
- **Accessibility Features**:
  - Alt text generation from card metadata
  - High contrast mode support with enhanced visibility
  - Screen reader descriptions for complex card layouts
  - Keyboard navigation for image galleries
- **Mobile Image Experience**:
  - Touch-optimized zoom controls with gesture recognition
  - Swipe navigation between card images
  - Adaptive quality based on connection speed
  - Offline image caching for recently viewed cards

**Acceptance Criteria:**

- ✅ Automatic image import from official sources and community databases (IMPLEMENTED)
  - Location: `ImageQueue.ts` handles image processing and import
- ✅ Multiple image sizes (thumbnail 150x200, medium 300x400, large 600x800, full-resolution 1200x1600) (IMPLEMENTED)
  - Location: Image size handling in `getCardImageUrl` function
- ✅ Image optimization and compression without quality loss (IMPLEMENTED)
  - Location: Image processing pipeline in ImageQueue
- ✅ WebP format conversion with fallback to JPEG for browser compatibility (IMPLEMENTED)
  - Location: Image format handling and optimization
- ✅ Lazy loading for improved page performance (IMPLEMENTED)
  - Location: Image components with lazy loading
- 🔄 Copyright compliance and fair use adherence (PARTIAL)
  - Location: Image sourcing policies exist but compliance system needs verification
- ✅ Placeholder images for cards without available artwork (IMPLEMENTED)
  - Location: Fallback image handling in card display components
- ✅ CDN distribution for global fast image delivery (IMPLEMENTED)
  - Location: CDN integration for image hosting
- ✅ Image caching strategy with appropriate cache headers (IMPLEMENTED)
  - Location: Caching system for images

#### User Story 3.2: Custom Image Upload

_As a vendor, I want to upload custom card condition photos so that customers can see the actual card they're purchasing._

**UI/UX Implementation:**

- **Pages**: `/sell/list-card` (Listing creation with photo upload), `/sell/listings/:id/edit` (Edit listing images)
- **Components**:
  - ImageUploadZone component with drag-and-drop
  - ImageEditor component with basic editing tools
  - ImageGalleryManager component for multiple photos
  - MobileCamera component for instant capture
  - ImageModerationQueue component (admin)
- **Image Upload Interface**:
  - Large drag-and-drop zone with visual upload progress
  - Multiple file selection with preview thumbnails
  - Upload progress bars with cancel functionality
  - File size and format validation with clear error messages
  - Batch upload capability for multiple card angles
- **Image Capture Integration**:
  - Mobile camera access with real-time preview
  - Camera guidance overlay showing optimal card positioning
  - Multiple shot capture (front, back, close-ups)
  - Auto-focus and exposure adjustment recommendations
  - Flash toggle and lighting condition detection
- **Image Editing Tools**:
  - Crop tool with preset aspect ratios for card dimensions
  - Rotation controls (90-degree increments and fine adjustment)
  - Brightness/contrast sliders with live preview
  - Color correction tools for accurate card color representation
  - Annotation tools for highlighting specific features or damage
- **Image Gallery Management**:
  - Reorderable image gallery with drag-and-drop sorting
  - Primary image designation with star/badge indicator
  - Image labeling (front, back, corner wear, edge condition)
  - Delete confirmation with "Are you sure?" modal
  - Duplicate image detection with merge suggestions
- **Image Quality Guidelines**:
  - Interactive tutorial showing good vs. bad photo examples
  - Checklist overlay during capture (lighting, focus, angle)
  - Real-time quality scoring with improvement suggestions
  - Best practices tips embedded in upload interface
- **Comparison Tools**:
  - Side-by-side view: listing photos vs. catalog images
  - Overlay comparison mode with transparency slider
  - Before/after editing comparison with toggle view
  - Condition assessment guide with visual examples
- **Bulk Upload Features**:
  - Folder-based upload for large inventory additions
  - CSV import with image filename matching
  - Auto-matching to catalog cards based on visual recognition
  - Batch editing tools for consistent image processing
- **Image Moderation Interface** (Admin):
  - Queue of uploaded images requiring approval
  - Quick approve/reject with reason codes
  - Inappropriate content detection with automated flagging
  - Community reporting system for problematic images
- **Mobile Upload Optimization**:
  - One-handed upload interface with large touch targets
  - Background upload with progress notifications
  - Offline upload queue with auto-sync when connected
  - Voice guidance for accessibility during photo capture

**Acceptance Criteria:**

- ✅ High-resolution image upload (up to 10MB per image, JPEG/PNG/WEBP) (IMPLEMENTED)
  - Location: Image upload system supports high-resolution uploads
- ✅ Multiple images per card listing (front, back, close-ups of wear/damage) (IMPLEMENTED)
  - Location: Multiple image support in listing system
- ❌ Image annotation tools for highlighting specific features or issues (NOT BUILT)
- ✅ Automatic image rotation and orientation correction (IMPLEMENTED)
  - Location: Image processing includes orientation correction
- ❌ Image moderation system to prevent inappropriate content (NOT BUILT)
- ✅ Compression and optimization pipeline for uploaded images (IMPLEMENTED)
  - Location: Image optimization in processing pipeline
- ❌ Image comparison tools showing listing photos vs. catalog images (NOT BUILT)
- 🔄 Bulk image upload for vendors with large inventories (PARTIAL)
  - Location: Upload system exists but bulk capabilities need verification
- ❌ Image editing tools (crop, brightness/contrast, color correction) (NOT BUILT)
- ✅ Mobile-optimized image capture and upload from phone cameras (IMPLEMENTED)
  - Location: Mobile-optimized upload interfaces

### Epic 4: Search & Discovery Integration

#### User Story 4.1: Advanced Card Search

_As a user, I want to search for cards using complex criteria so that I can find exactly what I'm looking for._

**UI/UX Implementation:**

- **Pages**: `/search` (Advanced search page), Search results integrated across site
- **Components**:
  - UniversalSearchBar component in header
  - AdvancedSearchModal component with complex filters
  - SearchResults component with multiple view modes
  - SavedSearches component for search management
  - VisualSearch component for image-based searching
- **Universal Search Bar** (Site-wide header):
  - Prominent search input with magnifying glass icon
  - Real-time autocomplete dropdown with card suggestions
  - Search history with recently searched cards
  - Voice search button with speech recognition
  - "Advanced Search" link opening comprehensive modal
- **Advanced Search Modal Interface**:
  - Tabbed interface: Text Search, Attribute Filters, Visual Search, Saved Searches
  - Query builder with visual boolean logic (AND, OR, NOT operators)
  - Real-time search preview showing result count as filters change
  - Search template library for common queries ("Red burn spells", "Expensive vintage cards")
- **Text Search Options**:
  - Card name search with fuzzy matching and typo tolerance
  - Oracle/rules text search with keyword highlighting
  - Flavor text search for lore enthusiasts
  - Artist name search with artist portfolio links
  - Wildcard support (_spell_, \*dragon) with syntax helper
- **Attribute Filter Interface**:
  - Game selector with distinctive visual styling per TCG
  - Mana cost/energy cost builder with visual symbols
  - Card type hierarchical checkboxes (Creature → Beast → Elephant)
  - Rarity filter with color-coded rarity gems
  - Power/toughness range sliders with numeric inputs
- **Advanced Filter Options**:
  - Format legality multi-select with format rotation indicators
  - Price range slider with market data integration
  - Release date range picker with calendar interface
  - Set selection with visual set symbols and release dates
  - Collection status filters (owned, wanted, for trade)
- **Search Results Display**:
  - Multiple view modes: Grid (default), List, Compact, Image-only
  - Sort options: Relevance, Price, Release Date, Name (A-Z)
  - Result count and search time display
  - Filter breadcrumbs showing active search parameters
  - Pagination with infinite scroll option
- **Visual Search Interface**:
  - Image upload area with drag-and-drop functionality
  - Mobile camera integration for real-time card recognition
  - Similarity threshold slider for match accuracy
  - Results showing visual similarity percentage
- **Saved Searches Management**:
  - Save current search with custom naming
  - Saved search library with folder organization
  - Email alerts for new matches to saved searches
  - Search sharing via URL with social media integration
- **Search Analytics & Suggestions**:
  - "People also searched for" recommendations
  - Trending searches widget showing popular cards
  - Search refinement suggestions ("Did you mean?", "Try also")
  - No results helper with alternative search suggestions
- **Mobile Search Optimization**:
  - Simplified advanced search with collapsible sections
  - Voice search with natural language processing
  - Barcode scanning for quick card identification
  - Gesture-based filter adjustment (swipe, pinch)

**Acceptance Criteria:**

- ✅ Text search across card names, types, rules text, and flavor text (IMPLEMENTED)
  - Location: Comprehensive search in `SearchService.ts` and search APIs
- ✅ Advanced filtering by game, set, rarity, mana cost, power/toughness, card type (IMPLEMENTED)
  - Location: Advanced filtering in `CardFilters.tsx` and search system
- ✅ Boolean search operators (AND, OR, NOT) for complex queries (IMPLEMENTED)
  - Location: Search query parsing and boolean logic
- ✅ Range searches for numerical values (mana cost, power, toughness, price) (IMPLEMENTED)
  - Location: Range filtering in search system
- ✅ Wildcard and regex support for flexible name matching (IMPLEMENTED)
  - Location: Fuzzy search and pattern matching
- ❌ Saved search functionality with email alerts for new matches (NOT BUILT)
- ✅ Search result sorting by relevance, price, release date, alphabetical (IMPLEMENTED)
  - Location: Sort options in `SearchControls.tsx`
- ✅ Search autocomplete with intelligent suggestions (IMPLEMENTED)
  - Location: Search suggestions system
- ✅ Search analytics and popular search term tracking (IMPLEMENTED)
  - Location: Search analytics in `SearchAnalytics.tsx`

