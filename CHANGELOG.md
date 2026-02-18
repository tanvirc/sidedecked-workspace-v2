# Changelog
All notable changes to the SideDecked project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
## [Unreleased]
### Added
- **Consumer Seller Onboarding (Story 2.5.2)**: Simplified upgrade flow for collectors to become individual sellers
  - 5-step storefront wizard (Profile → Seller Type → Preferences → Terms → Activate)
  - `POST /api/customers/:id/upgrade-to-seller` in customer-backend — creates SellerRating with trust_score=60, BRONZE tier, UNVERIFIED status
  - `GET /api/customers/:id/seller-status` — returns current seller status
  - `POST /store/consumer-seller/upgrade` in commerce backend — simplified storefront-facing path that registers seller in MercurJS with immediate activation; architecture defines `/vendor/consumer-seller/upgrade` with identity document collection and `verification_status=pending` (deferred to Story 2.5.3)
  - Individual sellers bypass complex business verification (self-certification flow)
  - Proper error state in UI replaces alert(); auto-redirect to `/sell` on success
  - 15 Jest unit tests covering all happy paths and error cases
- **Dispute Resolution System (Story 2.3.2)**: Backend infrastructure for marketplace dispute mediation
  - `@mercurjs/dispute` module with Dispute, DisputeEvidence, DisputeMessage, DisputeTimeline entities
  - 7 dispute workflow statuses: open → awaiting_vendor → under_review → decided → appealed / stripe_hold → closed
  - Store API routes: initiate dispute, list/view disputes, send messages, submit appeals
  - Vendor API routes: list/view disputes, submit response, send messages
  - Admin API routes: list/view all disputes, assign mediator, render decision
  - MedusaJS workflows: `initiate-dispute`, `render-decision`, `process-appeal`, `send-message`
  - Stripe chargeback integration: `stripe.charge.dispute.created` subscriber pauses internal disputes
  - 30-day eligibility window enforced at workflow layer; vendor_id resolved via seller-order link
  - 7-day appeal window; 1 appeal per dispute; appeal assigned to different mediator
  - Initial DB migration — 4 tables with FK constraints, enum checks, performance indexes
  - 24 unit tests (100% branch coverage, 82.6% statement coverage)
- **Two-Factor Authentication (2FA)**: Opt-in TOTP-based account security
  - Authenticator app setup with QR code and manual key entry
  - 10 single-use SHA-256 hashed backup codes with regeneration
  - Trusted device management with 30-day expiry
  - Sensitive action gating (purchases > $500, email/password change, payment methods)
  - Redis rate limiting (5 attempts per 5 minutes) with HTTP 429
  - Email notifications on 2FA enable/disable via Resend
  - AES-256-GCM encryption for TOTP secrets at rest
  - 4-step setup wizard, challenge modal, and device management UI
  - 7 backend API routes + storefront proxy routes
  - 35 unit tests with 95% statement coverage
- **Email Verification System**: Complete email verification flow for customer accounts
  - Single-use verification tokens with 24-hour expiry and SHA-256 hashing
  - Rate-limited resend functionality (3 per hour per customer)
  - OAuth auto-verification for social login users
  - Email change flow with security notifications
  - Storefront UI components: verification banner, status pages, blocked action modal
  - Backend API routes with Redis rate limiting
  - Complete test coverage (48 tests: 34 backend, 14 storefront)
- Comprehensive documentation structure with standards, architecture, and templates
- Automation scripts for setup, validation, and deployment
- Enhanced workspace organization with split-brain architecture
- Code templates for consistent development patterns
- Vitest test infrastructure for storefront with React Testing Library
### Changed
- Reorganized documentation into structured directories
- Enhanced setup process with automated scripts
- Improved development workflow with validation tools
### Fixed
- Documentation consistency across all repositories
- Development environment setup reliability
## [0.6.0] - 2024-09-11
### Added
- **Deck Building System** 
 COMPLETED
  - Universal deck architecture for all TCG games (MTG, Pok
mon, Yu-Gi-Oh!, One Piece)
  - Format-specific validation engines with real-time error reporting
  - Real-time deck editor with drag-and-drop zone management
  - Collection integration & deck completion analysis
  - Public deck sharing & community features (likes, views, copies)
  - Advanced deck browsing with filtering and search
  - Mobile-responsive deck builder interface
  - Undo/redo system with comprehensive history tracking
  - Auto-save functionality with dirty state management
  - Import/export capabilities for multiple deck formats
  - Cover image management and visual deck representation
  - React Context-based state management with TypeScript validation
### Technical Improvements
- Enhanced deck validation with format-specific rules
- Optimized deck search and filtering performance
- Comprehensive test coverage for deck operations
- Integration with card catalog and collection systems
## [0.5.0] - 2024-09-09
### Added
- **Commerce & Marketplace System** 
 COMPLETED
  - Navigation routes & marketplace links validated
  - Card detail page buttons fully functional
  - Mobile-first consumer seller dashboard & listing interface
  - Trust badges & comprehensive seller verification UI
  - Customer-to-seller upgrade flow with auth preservation
  - Stripe Connect multi-seller payment integration
  - Single card listing interface for consumer sellers
  - Client-side authentication integration across features
  - Enhanced price alert UI and management interface
  - Search autocomplete and suggestions with dedicated search page
  - Real-time inventory optimization with intelligent cache warming
  - Advanced inventory management with auto-adjustment capabilities
  - Global error boundary and toast notification system
  - User feedback system with loading states and success messages
  - Comprehensive error logging and monitoring with debug dashboard
  - Performance optimization with Core Web Vitals monitoring
  - Optimized image loading and virtualized lists for large datasets
  - Cross-system integration testing framework
### Technical Improvements
- Enhanced error monitoring and debugging capabilities
- Performance optimization with Core Web Vitals tracking
- Real-time inventory synchronization
- Advanced caching strategies
- Comprehensive feedback and notification systems
## [0.3.0] - 2024-09-08
### Added
- **TCG Catalog & Card Database System** 
 COMPLETED
  - Universal card database with ETL pipeline
  - Games, cards, prints, sets entities
  - Scryfall, Pokemon, YuGiOh, OnePiece ETL
  - Image processing pipeline operational
  - Advanced search and filtering capabilities
  - Real-time price data integration
  - Multi-game support with unified schema
### Technical Improvements
- Robust ETL pipeline with error handling
- Image optimization and CDN integration
- Database performance optimization
- API rate limiting and caching
## [0.2.0] - 2024-09-07
### Added
- **Authentication & User Management System** 
 COMPLETED
  - OAuth2 social login implementation
  - PKCE security protocols
  - JWT integration with secure token handling
  - Role-based access control (RBAC)
  - Multi-provider authentication support
  - Session management and refresh tokens
### Security
- Enhanced authentication security measures
- PKCE implementation for OAuth flows
- Secure token storage and management
- Role-based permissions system
## [0.1.0] - 2024-09-06
### Added
- **Foundation & Infrastructure Setup** 
 COMPLETED
  - MercurJS v2 base platform integration
  - Split-brain architecture implementation
  - Database setup and migrations
  - Basic API structure
  - Development environment configuration
  - Docker containerization
  - Railway deployment configuration
### Infrastructure
- Multi-repository workspace setup
- GitHub Codespaces configuration
- Automated deployment pipelines
- Development tooling and scripts
## [0.0.1] - 2024-09-01
### Added
- Initial project structure
- Repository setup and configuration
- Basic documentation framework
- Development environment templates
## Release Notes
### Version 0.6.0 - Deck Builder System
This release introduces the comprehensive deck builder system, enabling users to create, manage, and share decks across all supported TCG games. Key highlights include:
- **Universal Compatibility**: Supports MTG, Pok
mon, Yu-Gi-Oh!, and One Piece TCG
- **Real-time Validation**: Format-specific rules with instant feedback
- **Social Features**: Public deck sharing with community engagement
- **Advanced Editor**: Drag-and-drop interface with undo/redo functionality
- **Collection Integration**: Seamless connection with user collections
### Version 0.5.0 - Customer Features
This release focuses on enhancing the customer experience with comprehensive marketplace features:
- **Consumer Seller Tools**: Easy-to-use interface for individual sellers
- **Performance Optimization**: Significant improvements in page load times
- **Error Monitoring**: Comprehensive debugging and error tracking
- **Inventory Management**: Real-time synchronization and optimization
- **Enhanced Search**: Autocomplete and intelligent suggestions
### Version 0.3.0 - TCG Catalog System
This release establishes the foundation for card data management:
- **Universal Database**: Unified schema supporting all major TCG games
- **ETL Pipeline**: Automated data import from official sources
- **Image Processing**: Optimized card image delivery
- **Search & Discovery**: Advanced filtering and search capabilities
## Migration Guides
### Upgrading to v0.6.0
No breaking changes. The deck builder system is additive and doesn't affect existing functionality.
### Upgrading to v0.5.0
**Authentication Updates**: If you have custom authentication implementations, review the new client-side integration patterns.
**API Changes**: Several customer-facing endpoints have been enhanced. Check the API documentation for updated response formats.
### Upgrading to v0.3.0
**Database Schema**: Run the latest migrations to support the new TCG catalog schema:
```bash
cd customer-backend && npm run migration:run
**Environment Variables**: Add the new ETL configuration variables to your environment files.
## Upcoming Releases
### v0.7.0 - Community Features (Planned)
- User profiles with reputation system
- Social networking & following system
- Real-time messaging & trade negotiations
- Forum & discussion boards with moderation
- Events & tournament organization system
### v0.8.0 - Pricing Intelligence (Planned)
- Real-time price scraping from multiple sources
- ML-based price prediction models
- Advanced market analytics & insights
- Investment portfolio tracking
### v0.9.0 - Mobile PWA (Planned)
- Progressive Web App architecture
- Offline functionality for core features
- Push notification system
- Native payment integration
### v1.0.0 - Production Release
- Full feature completeness
- Performance optimization
- Security audit completion
- Production-ready scaling
## Contributing
For information about contributing to this project, please see [CONTRIBUTING.md](CONTRIBUTING.md).
## Support
For support and questions:
 Email: support@sidedecked.com
 Issues: [GitHub Issues](https://github.com/sidedecked/sidedecked-workspace/issues)
 Documentation: [Project Docs](docs/)
