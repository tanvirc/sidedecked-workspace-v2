# Community & Social System

## Executive Summary
The Community & Social System creates a vibrant ecosystem where trading card game enthusiasts can connect, communicate, and collaborate. It provides comprehensive social networking features including user profiles, real-time messaging, forum discussions, trading negotiations, and local meetup coordination. The system fosters community building through reputation systems, achievement badges, and social discovery features while maintaining safety through robust moderation tools and reporting mechanisms.

## User Stories & Acceptance Criteria

### Epic 1: User Profiles & Social Identity

#### User Story 1.1: Comprehensive User Profiles
*As a community member, I want a detailed profile to showcase my TCG interests and build my reputation so that other players can learn about me and my playing style.*

**UI/UX Implementation:**
- **Pages**: `/profile/:username` (Public profile), `/profile/edit` (Profile editing)
- **Components**:
  - ProfileHeader component with avatar and key stats
  - AboutSection component with biography and preferences
  - CollectionShowcase component highlighting favorite cards
  - AchievementDisplay component with badges and milestones
  - ActivityTimeline component showing recent activities
- **Profile Header Design**:
  - Large avatar with upload/edit functionality and TCG-themed frame options
  - Username with verification badges (tournament player, content creator)
  - Key statistics: Reputation score, followers, following, joined date
  - Quick action buttons: Follow/Unfollow, Message, Block/Report
  - Online status indicator with last seen timestamp
- **About Section Interface**:
  - Rich text biography editor with formatting options and TCG emoji support
  - Gaming preferences grid: Favorite games, formats, playstyles
  - Experience level indicators with visual skill representations
  - Location display with privacy controls and local community integration
  - Contact preferences and availability for trades/games
- **Collection Showcase**:
  - Featured cards carousel with high-resolution images
  - Collection value estimation with portfolio tracking
  - Deck highlights with preview thumbnails and performance stats
  - "Crown jewels" section for most prized/expensive cards
  - Collection completion statistics by game and set
- **Achievement System Display**:
  - Badge gallery with categories (trading, deck building, tournaments, community)
  - Achievement progress bars for in-progress milestones
  - Rarity indicators for exclusive and difficult achievements
  - Achievement timeline showing unlock dates and context
- **Activity Timeline**:
  - Chronological feed of recent activities (decks, trades, posts, tournaments)
  - Activity filtering by type with visual icons
  - Privacy controls for activity visibility
  - Interactive activity items with quick actions (like, comment, share)
- **Privacy and Security Controls**:
  - Granular visibility settings for each profile section
  - Block and report functionality with detailed reporting options
  - Activity tracking controls with opt-out options
  - Data export functionality for profile information
- **Verification System**:
  - Identity verification for high-value traders
  - Tournament player verification with official results integration
  - Content creator verification with social media linking
  - Community leader recognition with nomination system
- **Mobile Profile Interface**:
  - Condensed profile layout optimized for mobile viewing
  - Swipeable sections for easy navigation
  - Touch-optimized action buttons and interaction elements
  - Voice profile narration for accessibility

**Acceptance Criteria:**
- 🔄 Complete profile creation with personal information, gaming preferences, and collection highlights (PARTIAL)
  - Location: `UserProfile` entity exists with basic structure but limited implementation
- ❌ Avatar upload and customization with TCG-themed options (NOT BUILT)
- 🔄 Biography section with rich text formatting and TCG experience details (PARTIAL)
  - Location: Profile types defined but UI implementation missing
- 🔄 Gaming preferences including favorite TCG games, formats, and playstyles (PARTIAL)
  - Location: Types defined in community.ts but UI missing
- ❌ Collection showcase featuring favorite cards, highest value cards, and deck highlights (NOT BUILT)
- ❌ Achievement and badge display system with sorting and filtering options (NOT BUILT)
- 🔄 Activity timeline showing recent deck builds, trades, forum posts, and tournaments (PARTIAL)
  - Location: `Activity` entity exists but timeline UI missing
- ❌ Privacy controls for profile visibility and information sharing (NOT BUILT)
- ❌ Profile verification system for tournament players and content creators (NOT BUILT)
- ❌ Social stats including followers, following, reputation score, and community contributions (NOT BUILT)

#### User Story 1.2: Social Networking & Following System
*As a player, I want to follow other players and be followed so that I can stay updated on their activities and build my social network.*

**UI/UX Implementation:**
- **Pages**: `/social/following` (Following management), `/social/followers` (Followers list), `/social/feed` (Activity feed)
- **Components**:
  - FollowButton component with state management
  - SocialFeed component with infinite scroll
  - UserDiscovery component with recommendations
  - ConnectionManager component for relationship management
  - ActivityNotifications component for social updates
- **Follow System Interface**:
  - Follow/Unfollow button with immediate visual feedback and confirmation
  - Follow request system for private profiles with pending status indicators
  - Mutual follow indicators showing reciprocal relationships
  - Follow button states: Follow, Following, Requested, Blocked
- **Follower/Following Management**:
  - Searchable lists with user thumbnails and quick stats
  - Batch management tools for following/unfollowing multiple users
  - Follow relationship timeline showing connection history
  - Mutual connections display showing shared followers
- **Activity Feed Design**:
  - Chronological timeline with diverse activity types (decks, trades, tournaments)
  - Activity clustering to prevent feed overwhelming
  - Interactive elements: like, comment, share, save for later
  - Activity filtering by user, type, and time period
  - "Catch up" feature for users returning after absence
- **Social Discovery Engine**:
  - "Suggested for you" section based on interests and mutual connections
  - Local player discovery using location and game preferences
  - "Similar taste" recommendations based on deck likes and collection overlap
  - Featured community members and content creators
- **Notification System**:
  - Real-time notifications for follows, mentions, and activity interactions
  - Notification categories with individual control settings
  - Digest options for consolidated daily/weekly updates
  - Push notification management with quiet hours
- **Privacy and Control Features**:
  - Block system with immediate effect and optional explanation
  - Mute functionality for reducing content without unfollowing
  - Private account settings with follower approval required
  - Activity visibility controls for granular privacy management
- **Social Graph Visualization**:
  - Network mapping showing connection relationships
  - Community cluster identification showing friend groups
  - Influence scoring based on social interactions and content engagement
- **Integration with Other Systems**:
  - Deck sharing integration with follower targeting
  - Trade preference sharing with follower network
  - Tournament buddy finding through social connections
- **Mobile Social Experience**:
  - Swipe-to-follow gesture on user discovery
  - Quick follow/unfollow actions in compact lists
  - Social feed optimized for one-handed use
  - Voice commands for hands-free social interaction

**Acceptance Criteria:**
- 🔄 Follow/unfollow functionality with immediate updates and notifications (PARTIAL)
  - Location: `UserFollow` entity defined but follow system UI missing
- ❌ Follower and following lists with profile previews and quick actions (NOT BUILT)
- ❌ Activity feed showing followed users' decks, trades, forum posts, and achievements (NOT BUILT)
- ❌ Follow recommendations based on similar interests, gaming preferences, and mutual connections (NOT BUILT)
- ❌ Privacy settings for follower requests and activity visibility (NOT BUILT)
- ❌ Social discovery through mutual connections and shared interests (NOT BUILT)
- ❌ Follow notifications with customizable frequency and types (NOT BUILT)
- ❌ Block and mute functionality for managing unwanted interactions (NOT BUILT)
- ❌ Social graph analysis showing connection strength and interaction history (NOT BUILT)
- ❌ Integration with deck sharing and trading systems for social context (NOT BUILT)

#### User Story 1.3: Reputation & Trust System
*As a trader and community member, I want a reputation system so that I can build trust with other users and identify trustworthy trading partners.*

**UI/UX Implementation:**
- **Pages**: `/profile/:username/reputation` (Reputation details), `/community/leaderboard` (Community rankings)
- **Components**:
  - ReputationScore component with visual indicators
  - TrustLevel component showing progression
  - FeedbackSystem component for rating interactions
  - DisputeResolution component for conflict management
  - ReputationHistory component tracking changes over time
- **Reputation Score Visualization**:
  - Large numerical score with color-coded trust levels (green: high, yellow: medium, red: low)
  - Progress bar showing advancement to next trust tier
  - Reputation breakdown by category: Trading, Community, Content, Tournament
  - Historical reputation chart showing trends and improvements
- **Trust Level System**:
  - Tiered trust levels: Newcomer, Trusted, Veteran, Elite, Legend
  - Visual trust badges with distinct designs and prestige indicators
  - Trust level benefits display (reduced fees, priority features, exclusive access)
  - Achievement requirements clearly outlined for each level
- **Feedback and Rating Interface**:
  - 5-star rating system with category-specific breakdowns
  - Written review system with character limits and formatting options
  - Photo evidence support for trade condition disputes
  - Review helpfulness voting with community validation
- **Reputation Building Dashboard**:
  - Personal reputation analytics with improvement suggestions
  - Activity impact tracking showing how actions affect reputation
  - Goal setting for reputation milestones with progress tracking
  - Community contribution opportunities with reputation rewards
- **Trading Trust Features**:
  - Trade partner reputation display during negotiations
  - Risk assessment indicators for high-value trades
  - Trading history summary with success rates and feedback averages
  - Escrow service integration for reputation-based trust levels
- **Dispute Resolution Interface**:
  - Dispute filing system with evidence submission and case tracking
  - Community jury system for peer-based dispute resolution
  - Admin escalation pathway for complex disputes
  - Resolution outcome tracking with precedent documentation
- **Anti-Gaming Protection**:
  - Suspicious activity detection with automated flagging
  - Cross-reference validation to prevent fake reviews
  - Community reporting system for reputation manipulation
  - Admin tools for reputation adjustment and penalty application
- **Community Recognition**:
  - "Helper of the month" recognition for community contributors
  - Featured positive reviews highlighting exemplary behavior
  - Reputation milestone celebrations with community announcements
  - Leadership opportunities for high-reputation community members
- **Mobile Reputation Management**:
  - Simplified reputation overview with key metrics
  - Quick feedback submission with star ratings and optional comments
  - Reputation trend notifications with improvement suggestions
  - Voice feedback recording for detailed trade reviews

**Acceptance Criteria:**
- Comprehensive reputation scoring based on trading history, community contributions, and user feedback
- Rating system for trades, deck shares, forum contributions, and community interactions
- Feedback and review system with detailed comments and category-specific ratings
- Trust levels with visual indicators and progressive privileges
- Dispute resolution system with community moderation and admin oversight
- Reputation history and trends with detailed analytics and improvement suggestions
- Community contributions tracking including helpful forum posts, deck guides, and trade facilitation
- Verification badges for tournament achievements, content creation, and community leadership
- Reputation-based benefits including priority listing, reduced fees, and exclusive features
- Anti-gaming measures to prevent reputation manipulation and ensure authentic feedback

### Epic 2: Real-Time Messaging & Communication

#### User Story 2.1: Direct Messaging System
*As a community member, I want to send direct messages to other users so that I can communicate privately about trades, gameplay, and shared interests.*

**UI/UX Implementation:**
- **Pages**: `/messages` (Message center), `/messages/:conversationId` (Individual conversation)
- **Components**:
  - MessageCenter component with conversation list
  - ChatInterface component for real-time messaging
  - MessageComposer component with rich formatting
  - FileSharing component for media and attachments
  - MessageSearch component for conversation history
- **Message Center Layout**:
  - Two-panel design: Conversation list (left) + Active chat (right)
  - Conversation previews with latest message, timestamp, and unread indicators
  - Search bar for finding specific conversations or messages
  - Filter options: Unread, Archived, Blocked, Trade-related
  - Quick actions: New message, Archive, Delete, Report
- **Chat Interface Design**:
  - WhatsApp/Discord-style conversation bubbles with sender identification
  - Message timestamps with relative time ("5 minutes ago", "Yesterday")
  - Read receipt indicators (sent, delivered, read) with user avatars
  - Typing indicators showing when other users are composing messages
  - Message reactions with emoji picker and custom TCG emotes
- **Rich Message Formatting**:
  - Text formatting toolbar: Bold, italic, underline, strikethrough
  - Card reference integration with hover previews and market prices
  - Emoji picker with TCG-specific emojis and reaction shortcuts
  - Code block formatting for deck lists and technical discussions
  - Link previews with thumbnail generation and metadata display
- **File and Media Sharing**:
  - Drag-and-drop file upload with progress indicators
  - Image sharing with automatic compression and gallery view
  - Video and audio message recording with playback controls
  - Document sharing with file type icons and download options
  - Card condition photos with annotation tools
- **Message Organization**:
  - Message search with filtering by date, sender, and content type
  - Message pinning for important information
  - Thread creation for branching conversations
  - Message bookmarking for easy reference
  - Conversation archiving with search functionality
- **Privacy and Security Features**:
  - Block/unblock functionality with immediate effect
  - Report system with category selection and evidence submission
  - Message encryption for sensitive trade discussions
  - Screenshot detection notifications for privacy awareness
- **Notification Management**:
  - Customizable notification sounds and vibration patterns
  - Desktop and mobile push notifications with preview options
  - Do not disturb scheduling with quiet hours
  - Notification grouping to prevent overwhelming
- **Mobile Messaging Interface**:
  - Full-screen chat interface optimized for mobile keyboards
  - Swipe gestures for quick actions (archive, delete, reply)
  - Voice-to-text integration for hands-free messaging
  - Offline message drafting with auto-send when connected

**Acceptance Criteria:**
- ✅ Real-time messaging with instant delivery and read receipts (IMPLEMENTED)
  - Location: TalkJS integration in `UserMessagesSection` component
- ✅ Rich message formatting including text styling, emojis, and TCG card references (IMPLEMENTED)
  - Location: TalkJS provides rich formatting capabilities
- ✅ Image and file sharing with automatic compression and virus scanning (IMPLEMENTED)
  - Location: TalkJS handles media sharing
- ✅ Message history with search functionality and conversation organization (IMPLEMENTED)
  - Location: TalkJS inbox with conversation management
- ✅ Typing indicators and online status visibility with privacy controls (IMPLEMENTED)
  - Location: TalkJS real-time features
- ✅ Message reactions and quick responses for efficient communication (IMPLEMENTED)
  - Location: TalkJS reaction system
- ✅ Conversation threading for complex discussions and trade negotiations (IMPLEMENTED)
  - Location: TalkJS conversation management
- ✅ Message encryption for sensitive information and privacy protection (IMPLEMENTED)
  - Location: TalkJS provides encryption
- ✅ Notification system with customizable sound alerts and push notifications (IMPLEMENTED)
  - Location: TalkJS notification system
- ✅ Block and report functionality with automatic content filtering (IMPLEMENTED)
  - Location: TalkJS moderation features

#### User Story 2.2: Group Messaging & Communities
*As a member of TCG communities, I want group messaging features so that I can participate in team discussions and community conversations.*

**UI/UX Implementation:**
- **Pages**: `/groups` (Group discovery and management), `/groups/:groupId` (Group chat interface)
- **Components**:
  - GroupCreation component with setup wizard
  - GroupManagement component with admin tools
  - ChannelOrganization component for topic separation
  - MemberManagement component with role assignments
  - GroupAnalytics component for engagement tracking
- **Group Creation Wizard**:
  - Step-by-step group setup: Name/Description → Privacy Settings → Member Invitations → Channel Setup
  - Group avatar upload with image cropping and preset options
  - Purpose selection templates (Tournament Team, Local Playgroup, Trading Community)
  - Visibility settings: Public, Private, Invite-only with detailed explanations
- **Group Chat Interface**:
  - Channel-based organization with sidebar navigation (#general, #trades, #tournaments)
  - Member list with online indicators and role badges
  - Group information panel with description, rules, and announcements
  - Message threading for organized discussions within channels
- **Channel Management System**:
  - Channel creation with purpose-specific templates
  - Channel permissions: Read-only, Members only, Admin only
  - Channel archiving and deletion with member notification
  - Channel topic pinning and description updates
- **Member Administration Tools**:
  - Role hierarchy: Owner, Admin, Moderator, Member, Guest
  - Permission matrix for role customization (ban members, delete messages, manage channels)
  - Invite link generation with expiration and usage limits
  - Member approval queue for private groups
  - Bulk member management with import/export functionality
- **Group Discovery Interface**:
  - Public group directory with search and filtering
  - Category browsing: Local Groups, Game-Specific, Tournament Teams, Trading
  - Featured groups highlighting active communities
  - Join request system with application forms for exclusive groups
- **Shared Resources Management**:
  - File library with organized folders and version control
  - Shared deck collections with collaborative editing
  - Event calendar integration for tournament scheduling
  - Group trading post for member-exclusive offers
- **Moderation Tools**:
  - Message deletion with reason logging
  - Member timeout and ban functionality with duration settings
  - Automated content filtering with custom keyword lists
  - Report system with escalation to group admins
- **Group Analytics Dashboard**:
  - Member activity levels with engagement scoring
  - Popular discussion topics and trending messages
  - Growth metrics with member acquisition and retention rates
  - Channel usage statistics for optimization insights
- **Mobile Group Experience**:
  - Swipeable channel navigation with gesture controls
  - Push notifications with group-specific settings
  - Quick member actions with long-press context menus
  - Offline message viewing with sync when connected

**Acceptance Criteria:**
- Group chat creation with customizable names, descriptions, and member management
- Role-based permissions for group administration and moderation
- Channel-based organization for different discussion topics within groups
- Group member management with invite links, approval systems, and removal capabilities
- Shared resources including deck lists, tournament information, and community files
- Group announcements and pinned messages for important information
- Integration with forum discussions and event coordination
- Group discovery through interests, location, and mutual connections
- Moderation tools for group administrators including message deletion and member timeouts
- Group analytics including activity levels, popular topics, and member engagement

#### User Story 2.3: Trade Negotiation Integration
*As a trader, I want messaging features specifically designed for trade negotiations so that I can efficiently discuss and finalize card trades.*

**UI/UX Implementation:**
- **Pages**: `/messages/:conversationId/trade` (Trade-focused chat interface)
- **Components**:
  - TradeProposal component with card selection and valuation
  - NegotiationHistory component tracking offer evolution
  - CardReference component with market data integration
  - TradeAgreement component for terms finalization
  - EscrowIntegration component for secure high-value trades
- **Trade-Enhanced Chat Interface**:
  - Dedicated "Trade Mode" toggle transforming regular chat into trade-focused interface
  - Trade sidebar showing current proposal status and card values
  - Embedded card browser for quick card reference and addition
  - Real-time market value updates with price change notifications
- **Card Reference System**:
  - Inline card mentions with hover previews showing card details and current prices
  - Card condition selector with visual condition guides
  - Quantity selector with availability checking against user inventories
  - Alternative printing suggestions for hard-to-find cards
- **Trade Proposal Interface**:
  - Visual trade builder with drag-and-drop card selection
  - Automatic value calculation with fairness indicators
  - "My cards" vs. "Your cards" clear visual separation
  - Shipping cost integration with location-based calculations
  - Trade value balancing with suggestions for evening out offers
- **Negotiation Tracking**:
  - Offer history timeline showing all previous proposals
  - Change highlighting showing what was modified in each counteroffer
  - "Accept", "Counter", "Decline" buttons with reason selection
  - Trade deadline setting with automatic expiration
- **Agreement and Documentation**:
  - Automatic trade summary generation with all agreed terms
  - Digital signature system for trade confirmation
  - Terms and conditions template with customization options
  - Photo documentation requirements for card condition verification
- **Shipping and Logistics**:
  - Integrated shipping calculator with carrier options
  - Address verification and secure address sharing
  - Tracking number exchange with delivery confirmation
  - Insurance and signature confirmation options for high-value trades
- **Escrow and Security Features**:
  - Automatic escrow recommendation for trades over value thresholds
  - Escrow service integration with step-by-step guidance
  - Payment method discussion with secure payment options
  - Dispute escalation with evidence submission tools
- **Trade Analytics and Learning**:
  - Personal trading statistics with success rates and value trends
  - Market timing suggestions based on price movement patterns
  - Trading partner compatibility scoring based on collection overlap
- **Mobile Trade Negotiation**:
  - Mobile-optimized trade proposal interface with touch-friendly controls
  - Camera integration for instant card condition documentation
  - Voice notes for complex trade explanations
  - Push notifications for trade proposal updates and counteroffers

**Acceptance Criteria:**
- Embedded card references with current market values and condition details
- Trade proposal templates with automatic value calculations and fairness indicators
- Negotiation history tracking with offer revisions and counteroffers
- Integration with inventory systems for real-time availability checking
- Shipping and payment method discussion with integrated calculators
- Trade agreement templates with terms and conditions
- Automated trade summary generation with all agreed terms
- Integration with escrow services for high-value trades
- Trade feedback prompts after completion for reputation building
- Dispute escalation tools for problematic trades with mediation support

### Epic 3: Forum & Discussion System

#### User Story 3.1: Multi-Category Forum Structure
*As a community member, I want organized forum categories so that I can find and participate in discussions relevant to my interests.*

**UI/UX Implementation:**
- **Pages**: `/forum` (Forum home), `/forum/:category` (Category view), `/forum/:category/:subcategory` (Subcategory)
- **Components**:
  - CategoryGrid component with hierarchical organization
  - CategoryCard component showing stats and recent activity
  - CategoryNavigation component with breadcrumb trail
  - PinnedPosts component for important announcements
  - CategorySubscription component for notification management
- **Forum Homepage Layout**:
  - Hero section with community stats and featured discussions
  - Category grid with visual icons and activity indicators
  - "What's Hot" sidebar showing trending discussions
  - Quick actions: New Post, Search, My Subscriptions
- **Category Organization Interface**:
  - Hierarchical structure: Main Categories → Subcategories → Topics
  - Game-specific sections: MTG, Pokémon, Yu-Gi-Oh!, One Piece
  - General sections: Trading, Deck Building, Tournament Reports, Off-Topic
  - Visual category icons with community-voted designs
- **Category Cards Design**:
  - Category title with descriptive subtitle
  - Statistics: Total posts, active users today, last post timestamp
  - Recent activity preview with latest post titles
  - Subscription status toggle with notification preferences
- **Navigation and Discovery**:
  - Breadcrumb navigation showing category hierarchy
  - Quick category switcher in header for power users
  - Category search with autocomplete suggestions
  - "Suggested categories" based on user interests and activity
- **Pinned Content System**:
  - Global pins appearing across all categories
  - Category-specific pins for rules and announcements
  - Community FAQ integration with searchable answers
  - Pin expiration system with automatic unpinning
- **Category Customization**:
  - Personalized category ordering based on user preferences
  - Hide/show categories with user-specific filtering
  - Category appearance customization (dark/light theme per category)
- **Activity Tracking**:
  - "New posts since last visit" indicators
  - Unread post counters with visual badges
  - Activity timeline showing recent posts across subscribed categories
- **Mobile Forum Navigation**:
  - Collapsible category menu with search functionality
  - Swipeable category cards for easy browsing
  - Touch-friendly category selection with haptic feedback
  - Voice search for finding specific categories or topics

**Acceptance Criteria:**
- Hierarchical category structure with game-specific sections and general topics
- Dynamic category creation based on community needs and activity levels
- Category-specific rules and moderation guidelines clearly displayed
- Pinned posts for important announcements and frequently asked questions
- Category statistics including post counts, active users, and recent activity
- Custom category icons and descriptions with community voting on changes
- Category subscription system with notification preferences
- Tag-based organization within categories for refined topic filtering
- Category-specific user roles and permissions for specialized discussions
- Integration with user interests for personalized category recommendations

#### User Story 3.2: Rich Forum Posting & Interaction
*As a forum user, I want comprehensive posting features so that I can create engaging content and participate in meaningful discussions.*

**UI/UX Implementation:**
- **Pages**: `/forum/post/create` (New post creation), `/forum/post/:postId` (Post view)
- **Components**:
  - RichTextEditor component with formatting toolbar
  - PostTemplate component with predefined structures
  - CardEmbed component for TCG card integration
  - InteractionTools component for voting and reactions
  - SearchInterface component with advanced filtering
- **Post Creation Interface**:
  - Rich WYSIWYG editor with formatting toolbar (bold, italic, lists, links)
  - Category and subcategory selection with suggestions
  - Tag system with autocomplete and popular tag suggestions
  - Post preview mode showing exactly how content will appear
  - Draft saving with automatic backup every 30 seconds
- **Content Enhancement Tools**:
  - Card embed system with hover previews and current market prices
  - Image upload with drag-and-drop and automatic optimization
  - Video embedding from popular platforms (YouTube, Twitch)
  - Code block formatting for deck lists and technical discussions
  - Table creation tools for tournament results and comparisons
- **Post Templates System**:
  - Template library: Deck Help, Trade Post, Tournament Report, Question
  - Custom template creation with community sharing
  - Template preview with field highlighting and instructions
  - Auto-fill templates based on post content analysis
- **Discussion Threading**:
  - Reply system with visual thread indicators
  - Quote functionality with partial text selection
  - Threaded conversation view with collapse/expand options
  - "Reply to specific point" highlighting for complex discussions
- **Post Interaction Features**:
  - Upvote/downvote system with reputation impact visualization
  - Emoji reactions with TCG-themed custom reactions
  - "Best Answer" marking for helpful responses
  - Post sharing with social media and direct message integration
- **Advanced Search Interface**:
  - Full-text search across all posts with relevance ranking
  - Filter options: Author, date range, category, tags, post type
  - Search suggestions and query completion
  - Saved searches with notification alerts for new matches
- **Post Analytics Dashboard**:
  - View count tracking with unique visitor identification
  - Engagement metrics: likes, replies, shares, time spent reading
  - Traffic source analysis showing how users found the post
  - Author insights for improving content quality
- **Bookmarking and Organization**:
  - Personal bookmarking with custom categories
  - Reading list functionality with progress tracking
  - Export bookmarks for external reference
- **Mobile Posting Experience**:
  - Mobile-optimized editor with touch-friendly formatting controls
  - Voice-to-text integration for rapid content creation
  - Camera integration for instant image sharing
  - Offline post drafting with auto-sync when connected

**Acceptance Criteria:**
- 🔄 Rich text editor with formatting options, images, videos, and card embeds (PARTIAL)
  - Location: `ForumPost` entity exists but rich editor UI missing
- ❌ Advanced search functionality across all posts with filters and sorting options (NOT BUILT)
- ❌ Post templates for common discussion types (deck help, trade posts, tournament reports) (NOT BUILT)
- ❌ Voting system for posts and comments with reputation impact (NOT BUILT)
- ❌ Best answer marking for help requests and question posts (NOT BUILT)
- ❌ Post bookmarking and personal organization features (NOT BUILT)
- ❌ Share functionality for social media and direct messaging integration (NOT BUILT)
- ❌ Post analytics for authors including view counts, engagement rates, and feedback (NOT BUILT)
- ❌ Real-time collaborative editing for community-driven content creation (NOT BUILT)
- ❌ Post scheduling and draft saving for content planning (NOT BUILT)

#### User Story 3.3: Community Moderation & Safety
*As a community member, I want robust moderation tools so that I can participate in a safe, welcoming environment free from harassment and spam.*

**UI/UX Implementation:**
- **Pages**: `/forum/moderation` (Moderator dashboard), `/community/guidelines` (Community rules)
- **Components**:
  - ModerationQueue component with prioritized content review
  - ReportingInterface component for community flagging
  - AutoModeration component with AI-powered filtering
  - AppealSystem component for contested moderation actions
  - CommunityGuidelines component with interactive examples
- **Community Reporting System**:
  - "Report" button on all posts and comments with category selection
  - Report types: Spam, Harassment, Inappropriate Content, Scam, Off-topic
  - Evidence submission with screenshot and context capabilities
  - Anonymous reporting option with abuse prevention measures
- **Moderation Dashboard**:
  - Priority queue showing reports ordered by severity and community impact
  - Quick action buttons: Approve, Remove, Warn, Ban, Escalate
  - Moderator assignment system for specialized expertise
  - Moderation history tracking with decision reasoning
- **Automated Content Filtering**:
  - Real-time spam detection with pattern recognition
  - Inappropriate content flagging with manual review queue
  - Scam detection for fraudulent trading posts
  - Language filter with customizable sensitivity levels
- **User Management Tools**:
  - Warning system with escalating consequences
  - Temporary and permanent ban functionality with duration settings
  - User education prompts with guideline explanations
  - Reputation impact tracking for moderation actions
- **Transparency and Appeals**:
  - Public moderation log showing actions taken (anonymized)
  - Appeal process with structured form and evidence submission
  - Community input system for controversial moderation decisions
  - Moderator feedback system for improving moderation quality
- **Community Self-Moderation**:
  - Trusted user privileges for preliminary moderation actions
  - Community voting on borderline content with reputation weighting
  - Peer review system for moderation decisions
  - Recognition system for helpful community moderators
- **Safety Education**:
  - Interactive community guidelines with examples and scenarios
  - Safety tips integration throughout the platform
  - New user onboarding with community standards education
  - Regular safety reminders and best practices sharing
- **Legal and Compliance**:
  - DMCA takedown request processing
  - Age verification for mature content access
  - Data protection compliance with user consent management
  - Law enforcement cooperation tools for serious violations
- **Mobile Safety Features**:
  - Quick report functionality with simplified category selection
  - Push notifications for safety alerts and guideline updates
  - Panic button for immediate help in harassment situations
  - Simplified appeal process optimized for mobile interaction

**Acceptance Criteria:**
- Community-driven moderation with user reporting and flagging systems
- Automated content filtering for spam, inappropriate content, and scams
- Moderator tools for post editing, removal, and user management
- Escalation system for serious violations with admin intervention
- Transparent moderation logs and community guidelines enforcement
- Appeal process for moderation actions with fair review procedures
- User education system with warnings and improvement suggestions
- Community voting on controversial moderation decisions
- Reputation-based moderation privileges for trusted community members
- Integration with legal compliance requirements for content and user safety

### Epic 4: Trading & Marketplace Integration

#### User Story 4.1: Social Trading Features
*As a trader, I want social features integrated into the trading system so that I can build relationships and find better trading opportunities.*

**UI/UX Implementation:**
- **Pages**: `/trading/social` (Social trading dashboard), `/trading/groups/:groupId` (Trading group)
- **Components**:
  - SocialTradeDiscovery component with friend network integration
  - TradeHistory component with social sharing options
  - CommunityRatings component for trader feedback
  - TradeRecommendations component with AI-powered suggestions
  - GroupTrading component for community events
- **Social Trade Discovery Interface**:
  - "Friends' Cards" section showing available cards from social network
  - "Followed Traders" feed with recent additions and highlighted items
  - Social wishlist integration with automatic match notifications
  - "Trending in Network" showing popular cards among connections
- **Trade History Social Features**:
  - Trade timeline with privacy controls (public, friends, private)
  - "Successful trade with [User]" social sharing with optional details
  - Trade statistics sharing with community leaderboards
  - Trade story creation with photos and narrative descriptions
- **Community Rating System**:
  - Post-trade rating interface with multiple criteria (communication, packaging, condition accuracy)
  - Written review system with helpful/unhelpful community voting
  - Rating aggregation display with detailed breakdown and trends
  - "Verified Trader" badges for consistently high-rated users
- **Social Trade Recommendations**:
  - AI-powered suggestions based on social network card preferences
  - "Your friend [Name] is looking for this card" notifications
  - Cross-reference system showing mutual trading opportunities
  - Trade completion likelihood scoring based on social factors
- **Group Trading Events**:
  - Community swap meet organization with RSVP and card list sharing
  - Virtual trading events with real-time negotiation tools
  - Regional trading groups with location-based membership
  - Seasonal trading challenges with community participation
- **Wishlist Social Integration**:
  - Public wishlist sharing with follower notifications
  - "Help find" requests to social network with reward offerings
  - Collaborative wishlist for group purchases and bulk trades
  - Wishlist matching alerts when followed users list desired cards
- **Trading Group Management**:
  - Group creation wizard for specialized trading communities
  - Member verification system for high-value trading groups
  - Group trade logs and statistics with member performance tracking
  - Exclusive access features for premium trading groups
- **Achievement and Gamification**:
  - Trade milestone celebrations with social sharing
  - "Trade of the Month" community voting and recognition
  - Trading streak tracking with social media integration
  - Community challenges with leaderboards and prizes
- **Mobile Social Trading**:
  - Quick trade discovery through social media-style card feeds
  - Swipe-to-trade interface for efficient opportunity browsing
  - Push notifications for social trade matches and opportunities
  - Voice messages for personalized trade negotiation

**Acceptance Criteria:**
- Social trade discovery showing friends' and followed users' available cards
- Trade history visibility with privacy controls and social sharing options
- Community trade ratings and feedback with detailed comments
- Trade recommendation engine based on social connections and shared interests
- Group trading events and community swap meets organization
- Trade wishlist sharing with social notifications when matches are found
- Trading group creation for specialized collections and regional communities
- Integration with reputation system for trusted trader identification
- Social trade challenges and community trading games
- Trade success celebration and achievement sharing features

#### User Story 4.2: Community Price Validation
*As a trader, I want community-driven price validation so that I can ensure fair trades and stay informed about market values.*

**UI/UX Implementation:**
- **Pages**: `/community/pricing` (Community pricing dashboard), `/cards/:cardId/community-price` (Card-specific pricing)
- **Components**:
  - PriceReporting component with community submission interface
  - ConditionAssessment component with image-based evaluation
  - LocalMarketData component showing regional variations
  - PriceAlerts component for unusual pricing notifications
  - CommunityValidation component with voting and consensus tools
- **Community Price Reporting Interface**:
  - "Report a Sale" form with price, condition, date, and location fields
  - Photo upload for condition verification with annotation tools
  - Sale context selection (local store, online, tournament, private)
  - Bulk reporting tools for users with multiple recent transactions
- **Crowd-Sourced Condition Assessment**:
  - Image-based condition evaluation with community voting
  - Condition comparison tools with side-by-side photo analysis
  - "Grade this card" mini-games for community engagement
  - Expert validator network with specialized knowledge verification
- **Local Market Tracking**:
  - Geographic price variation maps with heat visualization
  - Local game store integration showing current inventory prices
  - Regional market analysis with cultural and economic factors
  - "Price in your area" personalized estimates based on location
- **Community Alert System**:
  - Unusual price activity notifications with investigation prompts
  - Potential scam alerts based on pricing anomalies
  - Market manipulation detection with community reporting
  - "Too good to be true" warnings for suspicious listings
- **Price History Analysis**:
  - Community-annotated price charts with event correlation
  - Market insight contributions from community experts
  - Price prediction discussions with reasoning and evidence
  - Historical context provided by long-term community members
- **Professional Integration**:
  - PSA/BGS grading service integration with certified values
  - Professional appraiser network access for high-value items
  - Auction house data integration with community commentary
  - Insurance valuation tools with community input
- **Community Price Guides**:
  - Collaborative price guide creation with community editing
  - Version control for price guide updates with change attribution
  - Community voting on controversial price assessments
  - Expert review process for price guide accuracy
- **Educational Content Integration**:
  - "How to price this card" tutorials with community examples
  - Market trend education with historical case studies
  - Valuation methodology discussions with expert contributions
  - New collector guidance with mentorship matching
- **Dispute Resolution**:
  - Community arbitration for disputed valuations
  - Evidence submission system with photo and documentation support
  - Expert panel reviews for complex valuation disagreements
  - Transparent resolution process with community feedback
- **Mobile Price Validation**:
  - Quick price check with camera-based card recognition
  - Voice reporting for hands-free price submissions
  - Location-based price alerts using GPS data
  - Social verification through friend network price checking

**Acceptance Criteria:**
- Community price reporting and validation system with user contributions
- Crowd-sourced condition assessments with image-based verification
- Local market price tracking with regional variation insights
- Community alerts for unusual pricing or potential scams
- Price history analysis with community commentary and market insights
- Integration with professional grading services for high-value cards
- Community-driven price guides with regular updates and revisions
- Market manipulation detection with community reporting and investigation
- Educational content about card valuation and market trends
- Community voting on disputed valuations with transparent resolution processes

### Epic 5: Local Meetups & Events

#### User Story 5.1: Event Discovery & Organization
*As a local player, I want to find and organize TCG events in my area so that I can participate in local tournaments and casual play sessions.*

**UI/UX Implementation:**
- **Pages**: `/events` (Event discovery), `/events/create` (Event creation), `/events/:eventId` (Event details)
- **Components**:
  - EventMap component with location-based filtering
  - EventCreation component with comprehensive setup tools
  - EventCalendar component with scheduling integration
  - RSVPManager component for attendee management
  - EventPromotion component for social sharing
- **Event Discovery Interface**:
  - Interactive map showing nearby events with distance indicators
  - List view with filters: Date, game type, event type, distance, skill level
  - "Events this weekend" quick filter with personalized recommendations
  - Calendar integration showing events in monthly/weekly view
- **Location-Based Features**:
  - GPS integration for automatic location detection
  - Radius selector for customizing search distance
  - Venue integration showing game store information and contact details
  - Transportation options with driving directions and public transit
- **Event Creation Wizard**:
  - Step-by-step event setup: Basic Info → Location → Registration → Promotion
  - Event template library (Tournament, Casual Play, Trading Session, Social Meetup)
  - Venue finder with game store database integration
  - Automated event posting to social media and community forums
- **Event Information Management**:
  - Comprehensive event details: Format, entry fee, prizes, schedule
  - Image gallery for venue photos and event atmosphere
  - Attendee skill level indicators and experience requirements
  - Special accommodations listing (beginner-friendly, competitive, etc.)
- **Registration and RSVP System**:
  - One-click RSVP with calendar integration
  - Payment processing for entry fees with refund policies
  - Waitlist management for popular events
  - Attendee communication tools for pre-event coordination
- **Social Features**:
  - "Friends attending" display with mutual connections
  - Event sharing with personalized invitations
  - Photo and experience sharing during and after events
  - Event reviews and ratings with improvement feedback
- **Calendar Integration**:
  - Personal calendar sync with Google Calendar, Apple Calendar
  - Reminder system with customizable notification timing
  - Recurring event support with automatic registration options
  - Schedule conflict detection with alternative suggestions
- **Weather and Logistics**:
  - Weather forecast integration with event impact assessment
  - Venue capacity tracking with "almost full" warnings
  - Parking and accessibility information
  - Last-minute change notifications with alternative arrangements
- **Mobile Event Management**:
  - Location-based event discovery using GPS
  - Quick RSVP with Apple Wallet/Google Pay integration
  - Real-time event updates and push notifications
  - Check-in functionality with QR codes for event entry

**Acceptance Criteria:**
- Location-based event discovery with map integration and distance filtering
- Event creation tools with detailed information, registration, and payment processing
- Calendar integration with personal scheduling and reminder features
- Event type categorization (tournaments, casual play, trades, social gatherings)
- RSVP system with attendee lists and communication features
- Event promotion tools with social sharing and community announcements
- Integration with local game stores and tournament organizers
- Weather and venue information with real-time updates and notifications
- Event feedback and rating system for continuous improvement
- Recurring event support with template creation and automatic scheduling

#### User Story 5.2: Local Community Building
*As a player, I want to connect with other players in my area so that I can build a local gaming community and find regular play partners.*

**UI/UX Implementation:**
- **Pages**: `/community/local` (Local community hub), `/community/local/groups` (Local groups)
- **Components**:
  - LocalPlayerDiscovery component with proximity-based matching
  - CommunityGroups component for local group management
  - PlayPartnerMatching component with compatibility scoring
  - LocalLeaderboard component showing area achievements
  - CommunityEvents component with local event integration
- **Local Player Discovery**:
  - Map view showing nearby players with activity status
  - Player profiles with game preferences and availability
  - "Looking for group" status indicators with contact options
  - Skill level matching for balanced gameplay experiences
- **Community Group Formation**:
  - Local group creation tools with geographic boundaries
  - Group templates: Weekly Commander, Competitive Standard, Casual Kitchen Table
  - Member recruitment with criteria-based filtering
  - Group scheduling tools with recurring meetup support
- **Play Partner Compatibility**:
  - Matching algorithm based on game preferences, skill level, and availability
  - "Find a regular opponent" with long-term partnership focus
  - Communication preferences matching (in-person only, online hybrid)
  - Play style compatibility (competitive, casual, educational)
- **Local Community Features**:
  - Area leaderboards with tournament results and achievement tracking
  - Local meta analysis showing popular decks and strategies
  - Community challenges with area-wide participation
  - Local TCG news and announcements from game stores
- **Mentorship and Learning**:
  - Experienced player volunteer program for teaching newcomers
  - "New player friendly" group designation with welcoming policies
  - Skills development tracking with community recognition
  - Local expert identification with specialization areas
- **Regular Meetup Coordination**:
  - Standing meetup creation with automatic scheduling
  - Rotating host system for home games
  - Venue booking assistance for larger gatherings
  - Attendance tracking with reliability scoring
- **Local Game Store Integration**:
  - Partnership with local stores for event hosting
  - Store loyalty program integration with community participation
  - Exclusive community discounts and promotions
  - Store event calendar integration with community scheduling
- **Community Safety and Trust**:
  - Local reputation system with face-to-face interaction weighting
  - Community guidelines specific to in-person interactions
  - Safety meetup recommendations for first-time meetings
  - Emergency contact system for community events
- **Regional Community Connections**:
  - Sister community linking for nearby areas
  - Regional tournament coordination with community team formation
  - Inter-community challenges and friendly competitions
  - Resource sharing between neighboring communities
- **Mobile Local Community**:
  - Location-based push notifications for nearby players
  - Quick meetup coordination with instant messaging
  - GPS-based check-in for community events
  - Voice coordination for real-time meetup planning

**Acceptance Criteria:**
- Location-based player discovery with privacy controls and opt-in visibility
- Local group creation for regular meetups and community building
- Skill-level matching for appropriate competition and learning opportunities
- Local tournament organization with bracket management and result tracking
- Community resource sharing including play spaces, transportation, and equipment
- Local meta tracking with deck popularity and tournament results analysis
- Regional championship organization with qualification systems
- Integration with national tournament circuits and professional play
- Local market insights with regional pricing and availability information
- Community mentorship programs for new players and skill development

## Technical Requirements

### Database Schema

#### User Profiles & Social
```sql
-- User Profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  display_name VARCHAR(100) NOT NULL,
  bio TEXT,
  avatar_url VARCHAR(500),
  location VARCHAR(200),
  time_zone VARCHAR(50),
  preferred_games JSONB DEFAULT '[]',
  playing_since DATE,
  favorite_formats JSONB DEFAULT '[]',
  collection_highlights JSONB DEFAULT '[]',
  social_links JSONB DEFAULT '{}',
  privacy_settings JSONB DEFAULT '{}',
  reputation_score INTEGER DEFAULT 0,
  verification_status VARCHAR(50) DEFAULT 'unverified',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Following System
CREATE TABLE user_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES users(id),
  following_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'active', -- active, blocked, pending
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- User Activities
CREATE TABLE user_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  activity_type VARCHAR(50) NOT NULL,
  activity_data JSONB DEFAULT '{}',
  target_type VARCHAR(50),
  target_id UUID,
  visibility VARCHAR(20) DEFAULT 'public',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reputation System
CREATE TABLE reputation_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  source_user_id UUID REFERENCES users(id),
  source_type VARCHAR(50) NOT NULL,
  source_id UUID,
  points INTEGER NOT NULL,
  category VARCHAR(50) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Messaging System
```sql
-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(20) DEFAULT 'direct', -- direct, group, trade
  name VARCHAR(200),
  description TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation Participants
CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  user_id UUID NOT NULL REFERENCES users(id),
  role VARCHAR(20) DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ,
  notification_settings JSONB DEFAULT '{}',
  UNIQUE(conversation_id, user_id)
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  sender_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text',
  attachments JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message Reactions
CREATE TABLE message_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id),
  user_id UUID NOT NULL REFERENCES users(id),
  reaction_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id, reaction_type)
);
```

#### Forum System
```sql
-- Forum Categories
CREATE TABLE forum_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES forum_categories(id),
  sort_order INTEGER DEFAULT 0,
  icon VARCHAR(100),
  color VARCHAR(7),
  rules TEXT,
  moderators JSONB DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forum Topics
CREATE TABLE forum_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES forum_categories(id),
  title VARCHAR(300) NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'active',
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  last_reply_at TIMESTAMPTZ,
  last_reply_by UUID REFERENCES users(id),
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forum Replies
CREATE TABLE forum_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID NOT NULL REFERENCES forum_topics(id),
  parent_id UUID REFERENCES forum_replies(id),
  author_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  is_best_answer BOOLEAN DEFAULT FALSE,
  vote_score INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forum Votes
CREATE TABLE forum_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  target_type VARCHAR(20) NOT NULL, -- topic, reply
  target_id UUID NOT NULL,
  vote_type VARCHAR(10) NOT NULL, -- up, down
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_type, target_id)
);
```

#### Events & Meetups
```sql
-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(300) NOT NULL,
  description TEXT NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  organizer_id UUID NOT NULL REFERENCES users(id),
  venue_name VARCHAR(200),
  address TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  max_participants INTEGER,
  registration_fee DECIMAL(10,2) DEFAULT 0,
  registration_deadline TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'upcoming',
  game_formats JSONB DEFAULT '[]',
  prize_structure JSONB DEFAULT '{}',
  rules TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Registrations
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id),
  user_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'registered',
  registration_data JSONB DEFAULT '{}',
  payment_status VARCHAR(20) DEFAULT 'pending',
  payment_id VARCHAR(200),
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Local Communities
CREATE TABLE local_communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  location VARCHAR(200) NOT NULL,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  radius_km INTEGER DEFAULT 25,
  admin_id UUID NOT NULL REFERENCES users(id),
  member_count INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community Memberships
CREATE TABLE community_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES local_communities(id),
  user_id UUID NOT NULL REFERENCES users(id),
  role VARCHAR(20) DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active',
  UNIQUE(community_id, user_id)
);
```

### API Endpoints

#### Profile & Social Management
```typescript
// Profile Management
POST   /api/profiles                    # Create/update user profile
GET    /api/profiles/:userId            # Get user profile
GET    /api/profiles/:userId/activity   # Get user activity feed
PUT    /api/profiles/:userId/privacy    # Update privacy settings

// Social Networking
POST   /api/users/:userId/follow        # Follow user
DELETE /api/users/:userId/follow        # Unfollow user
GET    /api/users/:userId/followers     # Get followers list
GET    /api/users/:userId/following     # Get following list
GET    /api/social/feed                 # Get personalized activity feed
GET    /api/social/discover             # Get user recommendations

// Reputation System
POST   /api/reputation                  # Submit reputation feedback
GET    /api/users/:userId/reputation    # Get reputation details
GET    /api/reputation/leaderboard      # Get top-rated users
POST   /api/reputation/dispute          # Dispute reputation entry
```

#### Messaging System
```typescript
// Conversations
GET    /api/conversations               # Get user conversations
POST   /api/conversations               # Create new conversation
GET    /api/conversations/:id           # Get conversation details
PUT    /api/conversations/:id           # Update conversation
DELETE /api/conversations/:id           # Delete conversation

// Messages
GET    /api/conversations/:id/messages  # Get conversation messages
POST   /api/conversations/:id/messages  # Send message
PUT    /api/messages/:id                # Edit message
DELETE /api/messages/:id                # Delete message
POST   /api/messages/:id/reactions      # Add message reaction

// Real-time
WebSocket /ws/conversations/:id         # Real-time messaging
WebSocket /ws/notifications             # Real-time notifications
```

#### Forum System
```typescript
// Categories
GET    /api/forum/categories            # Get forum categories
POST   /api/forum/categories            # Create category (admin)
PUT    /api/forum/categories/:id        # Update category
GET    /api/forum/categories/:id/topics # Get category topics

// Topics
GET    /api/forum/topics                # Get all topics (with filters)
POST   /api/forum/topics                # Create new topic
GET    /api/forum/topics/:id            # Get topic details
PUT    /api/forum/topics/:id            # Update topic
DELETE /api/forum/topics/:id            # Delete topic
POST   /api/forum/topics/:id/view       # Record topic view

// Replies
GET    /api/forum/topics/:id/replies    # Get topic replies
POST   /api/forum/topics/:id/replies    # Create reply
PUT    /api/forum/replies/:id           # Update reply
DELETE /api/forum/replies/:id           # Delete reply
POST   /api/forum/replies/:id/vote      # Vote on reply

// Search
GET    /api/forum/search                # Search forum content
```

#### Events & Communities
```typescript
// Events
GET    /api/events                      # Get events (with location filter)
POST   /api/events                      # Create event
GET    /api/events/:id                  # Get event details
PUT    /api/events/:id                  # Update event
DELETE /api/events/:id                  # Cancel event
POST   /api/events/:id/register         # Register for event
DELETE /api/events/:id/register         # Unregister from event

// Local Communities
GET    /api/communities/local           # Find local communities
POST   /api/communities                 # Create community
GET    /api/communities/:id             # Get community details
POST   /api/communities/:id/join        # Join community
DELETE /api/communities/:id/join        # Leave community
GET    /api/communities/:id/events      # Get community events
```

## Business Rules

### Social Interaction Rules
1. **Following System**: Users can follow unlimited other users, but following requires mutual opt-in for private profiles
2. **Reputation Limits**: Users can only rate each other once per interaction type (trade, forum help, etc.)
3. **Activity Visibility**: User activities are public by default but can be configured for followers-only or private
4. **Profile Verification**: Verified status requires tournament history, content creation, or community leadership proof
5. **Blocking Enforcement**: Blocked users cannot see each other's content, send messages, or interact in any way

### Messaging & Communication Rules
1. **Message Limits**: New users limited to 10 direct messages per day, increasing with reputation
2. **Group Chat Limits**: Users can create up to 5 group chats, participate in unlimited groups
3. **Content Moderation**: Automated scanning for inappropriate content with human review for appeals
4. **Trade Message Integration**: Trade-related messages automatically include card references and value calculations
5. **Notification Controls**: Users must be able to configure all notification types with granular control

### Forum & Discussion Rules
1. **Posting Limits**: New users limited to 3 posts per day, increasing with reputation and community contributions
2. **Moderation Authority**: Community moderators elected monthly, admin oversight for major decisions
3. **Content Standards**: All content must be TCG-related or community-focused, commercial promotion requires approval
4. **Voting System**: Reputation-weighted voting with anti-manipulation detection algorithms
5. **Best Answer System**: Only original post authors can mark best answers, with community override for abandoned topics

### Event & Community Rules
1. **Event Creation**: Users can create unlimited free events, paid events require verification and payment processing
2. **Registration Limits**: Events can set maximum participants with waitlist functionality
3. **Cancellation Policy**: Events cancelled within 24 hours require full refunds, longer notice allows partial refunds
4. **Local Community Size**: Communities automatically promoted to official status at 50+ active members
5. **Geographic Boundaries**: Location-based features require user consent and can be disabled for privacy

## Integration Requirements

### External Service Integration
- **Social Authentication**: Integration with Google, Discord, Twitter for social login and profile import
- **Payment Processing**: Stripe Connect for event payments and community fundraising
- **Map Services**: Google Maps integration for event location and community discovery
- **Push Notifications**: Firebase Cloud Messaging for real-time notifications across platforms
- **Content Delivery**: CloudFlare for global message and media delivery optimization

### Internal System Integration
- **User Management**: Deep integration with authentication system for profile and permission management
- **Commerce Platform**: Integration with marketplace for trade history and reputation building
- **Deck Builder**: Social sharing of decks, community feedback, and collaborative building features
- **TCG Catalog**: Card references in messages, forum posts, and trade discussions
- **Vendor System**: Community connection between buyers and sellers, vendor reputation integration

### Data Synchronization
- **User Activity Tracking**: Real-time activity feed updates across all integrated systems
- **Reputation Sync**: Reputation changes from trades, sales, and community interactions
- **Content Cross-Reference**: Automatic linking between forum posts, decks, trades, and user profiles
- **Notification Aggregation**: Unified notification system across all community features
- **Search Integration**: Community content included in universal search with appropriate weighting

## Performance Requirements

### Response Time Targets
- **Profile Loading**: Complete profile load within 200ms including activity feed
- **Message Delivery**: Real-time message delivery within 100ms for online users
- **Forum Page Load**: Forum category and topic pages load within 300ms
- **Search Results**: Community search results within 500ms including user, content, and event results
- **Event Discovery**: Location-based event search within 400ms with map rendering

### Scalability Targets
- **Concurrent Users**: Support 10,000+ concurrent users in messaging and forum systems
- **Message Volume**: Handle 1M+ messages per day with real-time delivery
- **Forum Activity**: Support 50,000+ daily forum posts and replies with real-time updates
- **Event Load**: Process 1,000+ simultaneous event registrations during peak times
- **Social Graph**: Efficiently manage social networks of 100,000+ users with complex relationships

### Caching Strategy
- **Profile Caching**: User profiles cached for 5 minutes with invalidation on updates
- **Activity Feed Caching**: Personalized feeds cached for 2 minutes with real-time invalidation
- **Forum Content**: Topic and reply caching for 10 minutes with edit invalidation
- **Event Data**: Event information cached for 1 hour with registration count real-time updates
- **Community Data**: Local community data cached for 30 minutes with membership updates

## Security Requirements

### Data Protection
- **Privacy Controls**: Granular privacy settings for all profile information and activity visibility
- **Message Encryption**: End-to-end encryption for sensitive trade negotiations and personal messages
- **Content Moderation**: AI-powered content scanning with human review for community safety
- **Data Retention**: Automatic deletion of inactive conversations and forum content per retention policies
- **Export Rights**: Complete data export functionality for user account portability

### Authentication & Authorization
- **Multi-Factor Authentication**: Optional 2FA for high-reputation users and event organizers
- **Role-Based Access**: Hierarchical permissions for community moderators, event organizers, and administrators
- **Session Management**: Secure session handling with automatic timeout for messaging and forum access
- **API Security**: Rate limiting and authentication for all community API endpoints
- **Account Recovery**: Secure account recovery with multiple verification methods

### Abuse Prevention
- **Spam Detection**: Automated detection and prevention of spam messages and forum posts
- **Harassment Protection**: Comprehensive blocking, reporting, and moderation tools
- **Vote Manipulation**: Detection and prevention of artificial reputation and forum vote inflation
- **Fake Account Detection**: AI-powered detection of bot accounts and fake profiles
- **Trade Fraud Prevention**: Integration with reputation system to identify and prevent fraudulent trading

## Testing Requirements

### Unit Testing
- **Service Layer**: 90%+ test coverage for all social, messaging, and forum business logic
- **API Endpoints**: Comprehensive testing of all REST and WebSocket endpoints
- **Database Operations**: Full testing of all CRUD operations with edge case handling
- **Real-time Features**: Testing of WebSocket connections, message delivery, and notification systems
- **Security Functions**: Complete testing of authentication, authorization, and content moderation

### Integration Testing
- **Cross-System Integration**: Testing of community features with authentication, commerce, and deck building
- **External Service Integration**: Testing of social login, maps, payments, and notification services
- **Database Integration**: Testing of complex queries, relationships, and data consistency
- **Real-time Communication**: End-to-end testing of messaging and notification delivery
- **Event Management**: Testing of complete event lifecycle from creation to completion

### Performance Testing
- **Load Testing**: Testing under realistic user loads for messaging, forum, and event systems
- **Stress Testing**: Testing system behavior under peak loads and resource constraints
- **Scalability Testing**: Testing horizontal scaling of messaging and social features
- **Real-time Performance**: Testing message delivery speed and notification latency
- **Database Performance**: Testing complex social graph queries and activity feed generation

### User Acceptance Testing
- **Community Feature Testing**: Testing by real users for usability and community building effectiveness
- **Mobile Experience Testing**: Testing of responsive design and mobile app integration
- **Accessibility Testing**: Testing for screen readers, keyboard navigation, and accessibility standards
- **Cross-Browser Testing**: Testing across all supported browsers and devices
- **Moderation Testing**: Testing of community moderation tools and abuse reporting systems

## UI/UX Requirements

### User Profile & Social Identity Interface Design

#### User Profile Page Design
**Profile Layout Structure:**
- **Profile Header Section**:
  - Large avatar image with hover overlay for editing (own profile)
  - Display name with verification badge indicators
  - Location and join date information
  - Reputation score with visual progress indicators
  - Follow/unfollow button with follower/following counts
  - Quick action buttons (message, trade, block/report)
  - Social media links and external profile connections

**Profile Content Tabs:**
- **Overview Tab**:
  - User bio with rich text formatting and TCG experience
  - Recent activity feed with timeline visualization
  - Achievement badges with hover descriptions and progress
  - Featured decks carousel with quick preview
  - Trading statistics and reputation breakdown
  - Collection highlights with valuable card showcase
- **Activity Tab**:
  - Chronological activity timeline with filters
  - Activity type filtering (decks, trades, forum posts, events)
  - Activity engagement metrics and social interactions
  - Privacy controls for activity visibility
- **Collections Tab**:
  - Collection overview with game-specific organization
  - Wishlist and trade binder integration
  - Collection value tracking and analytics
  - Showcase cards with detailed condition information
- **Reviews Tab**:
  - Trading reputation with detailed feedback
  - Community contribution ratings and reviews
  - Response system for addressing feedback
  - Reputation history and trend analysis

#### Social Following Interface
**Following Management:**
- **Followers/Following Lists**:
  - Grid layout with avatar, name, and follow date
  - Quick action buttons (message, view profile, unfollow)
  - Mutual connection indicators and suggestions
  - Search and filter functionality for large lists
  - Activity preview showing recent actions
- **Social Discovery Panel**:
  - "People you might know" recommendations
  - Interest-based user suggestions with matching games/formats
  - Location-based community member discovery
  - Recent activity from followed users
  - Trending users and community leaders

#### Reputation & Trust System Interface
**Reputation Dashboard:**
- **Reputation Score Display**:
  - Overall score with visual rating system (stars/badges)
  - Category breakdown (trading, community, expertise)
  - Reputation trend chart with historical data
  - Comparison with community averages
  - Reputation milestones and next level requirements
- **Trust Indicators**:
  - Verification badges with detailed explanations
  - Trade completion rate and average feedback
  - Community contribution metrics and recognition
  - Response time and communication quality ratings
  - Dispute resolution history and outcomes

### Real-Time Messaging Interface Design

#### Messaging Hub (`/user/messages`)
**TalkJS Integration Layout:**
- **Conversation List Panel (30% width)**:
  - Recent conversations with avatar and preview
  - Unread message indicators and count badges
  - Conversation search and filtering options
  - Conversation categorization (trades, general, groups)
  - Pin important conversations functionality
  - Archive and delete conversation options
- **Message Thread Panel (70% width)**:
  - TalkJS embedded chat interface with custom styling
  - Message composition with rich text formatting
  - File and image sharing with drag-and-drop
  - Card reference insertion with market value display
  - Typing indicators and read receipts
  - Message search within conversations

**Enhanced Messaging Features:**
- **Trade Integration Panel**:
  - Embedded card references with current market prices
  - Trade proposal templates with value calculations
  - Quick actions for accepting/declining trade offers
  - Integration with inventory for availability checking
  - Trade history and status tracking within conversation
- **Message Organization Tools**:
  - Message starring and bookmarking
  - Conversation labeling and categorization
  - Advanced search across all conversations
  - Message export for record keeping
  - Conversation muting and notification controls

#### Group Messaging Interface
**Group Chat Management:**
- **Group Creation Wizard**:
  - Group name and description setup
  - Member invitation with search functionality
  - Privacy settings and join approval requirements
  - Group category selection and tagging
  - Channel creation for organized discussions
- **Group Administration Panel**:
  - Member management with role assignments
  - Channel organization and permissions
  - Group settings and customization options
  - Moderation tools and member timeout capabilities
  - Group analytics and activity insights
- **Group Discovery Interface**:
  - Browse public groups by interest and location
  - Group recommendation based on user interests
  - Join request management for private groups
  - Group directory with search and filtering
  - Group activity and member count indicators

### Forum & Discussion Interface Design

#### Forum Hub Page (`/community`)
**Main Forum Layout:**
- **Category Grid Display**:
  - Visual category cards with custom icons and colors
  - Recent activity indicators and participant counts
  - Sticky posts and announcements prominence
  - Category statistics (posts, active users, latest activity)
  - Subcategory organization with hierarchical display
- **Activity Overview Panel**:
  - Recent posts feed with thumbnail previews
  - Trending topics with engagement metrics
  - Community highlights and featured content
  - User activity leaderboard with reputation scores
  - Quick access to subscribed topics and categories

#### Forum Category & Topic Interface
**Category Page Layout:**
- **Topic List Design**:
  - Topic titles with author avatar and metadata
  - Reply count, view count, and last activity indicators
  - Pinned topics with special styling and prominence
  - Topic tags and category filtering options
  - Sort options (recent activity, popularity, date created)
- **Topic Creation Interface**:
  - Rich text editor with formatting toolbar
  - Topic template selection for common post types
  - Tag suggestion and category assignment
  - Media upload with automatic compression
  - Preview mode before publishing
  - Draft saving and scheduled publishing

**Thread Discussion Layout:**
- **Main Post Display**:
  - Original post with full rich text formatting
  - Author profile integration with reputation display
  - Post voting system with visual feedback
  - Social sharing buttons and permalink
  - Edit history and version tracking for transparency
- **Reply System**:
  - Threaded reply structure with indentation
  - Quote and mention functionality
  - Real-time reply notifications and updates
  - Best answer marking with community verification
  - Reply voting and reputation impact

#### Forum Moderation Interface
**Moderation Tools Dashboard:**
- **Content Moderation Panel**:
  - Flagged content queue with severity indicators
  - Quick moderation actions (approve, edit, remove)
  - Community voting on controversial decisions
  - Moderation log with action history and reasoning
  - Appeal system with structured review process
- **User Management Tools**:
  - User warning system with progressive penalties
  - Temporary and permanent ban management
  - User behavior analytics and pattern recognition
  - Community feedback integration for moderation decisions
  - Escalation pathways for complex situations

### Event & Community Management Interface

#### Event Discovery & Management
**Event Listing Interface:**
- **Event Discovery Page**:
  - Interactive map with event location markers
  - Event cards with key information and registration status
  - Filter system (date, location, game format, entry fee)
  - Calendar view with month/week/day options
  - Event recommendation based on user interests and location
- **Event Detail Page**:
  - Event banner with key details and countdown timer
  - Registration interface with payment processing
  - Attendee list with social networking opportunities
  - Event discussion thread and Q&A section
  - Location details with map integration and directions

**Event Creation Interface:**
- **Event Creation Wizard**:
  - Step-by-step event setup with progress tracking
  - Venue selection with map integration and suggestions
  - Format and rules configuration with templates
  - Prize structure and entry fee management
  - Registration and payment settings
  - Promotional tools and social media integration
- **Event Management Dashboard**:
  - Registration monitoring with real-time updates
  - Participant communication tools
  - Check-in and attendance tracking
  - Result reporting and prize distribution
  - Post-event feedback collection and analysis

#### Local Community Interface
**Community Discovery:**
- **Community Map View**:
  - Interactive map showing local communities
  - Community markers with member count and activity level
  - Distance-based filtering and search
  - Community recommendation based on interests
  - Quick join functionality with approval workflow
- **Community Profile Pages**:
  - Community overview with description and rules
  - Member directory with role indicators
  - Recent community activity and discussions
  - Upcoming events and meetup calendar
  - Community statistics and growth metrics

**Community Management Tools:**
- **Admin Dashboard**:
  - Member management with role assignment
  - Community settings and customization
  - Event organization and coordination tools
  - Community promotion and growth analytics
  - Moderation tools and community guidelines enforcement

### Social Discovery & Recommendations

#### Discovery Dashboard
**Recommendation Engine Interface:**
- **Personalized Discovery Feed**:
  - Algorithm-driven content recommendations
  - User activity-based suggestions for follows and groups
  - Interest matching with detailed similarity scores
  - Location-based community and event suggestions
  - Trending content and viral discussions
- **Social Network Visualization**:
  - Interactive network graph showing connections
  - Mutual connection discovery and introductions
  - Community clustering and interest group identification
  - Influence mapping and thought leader recognition
  - Network growth and engagement analytics

### Mobile Community Experience

#### Mobile-Optimized Social Interface (< 768px)
**Touch-First Social Design:**
- **Mobile Profile Design**:
  - Simplified profile layout with swipe navigation
  - Touch-friendly action buttons and quick access
  - Gesture-based profile browsing and discovery
  - Mobile-optimized avatar and media viewing
- **Mobile Messaging**:
  - Full-screen messaging interface with native feel
  - Swipe gestures for conversation management
  - Voice message recording and playback
  - Mobile keyboard optimization and predictive text
  - Push notification integration with conversation context

**Mobile Forum Experience:**
- **Touch-Optimized Forum Navigation**:
  - Bottom navigation for easy thumb access
  - Swipe gestures for topic browsing and navigation
  - Collapsible interface elements for screen space optimization
  - Touch-friendly voting and interaction elements
  - Mobile-specific moderation tools and reporting

#### Progressive Web App Features
**Advanced Mobile Functionality:**
- **Offline Community Access**:
  - Cached conversations for offline reading
  - Draft message composition with sync queue
  - Offline forum browsing with recent content
  - Background sync for messages and notifications
- **Native Integration**:
  - Push notifications for messages, mentions, and events
  - Native sharing integration for community content
  - Camera integration for media sharing and verification
  - Contact integration for friend discovery and invitations

### Community Safety & Moderation

#### Safety Tools Interface
**User Safety Dashboard:**
- **Privacy Control Center**:
  - Granular privacy settings with clear explanations
  - Block and mute management with bulk operations
  - Content filtering preferences and keyword blocking
  - Activity visibility controls and audience selection
  - Data sharing preferences and third-party integration controls
- **Reporting & Moderation Interface**:
  - Quick reporting tools with category selection
  - Evidence submission with screenshot and context
  - Report status tracking and resolution updates
  - Community moderation participation and voting
  - Appeal process interface with structured forms

#### Community Guidelines Interface
**Guidelines & Education:**
- **Community Standards Display**:
  - Interactive community guidelines with examples
  - Educational content about respectful communication
  - Best practices for trading and community interaction
  - Cultural sensitivity and inclusivity guidelines
  - Progressive disclosure of advanced community features

### Performance Optimization

#### Community Performance Targets
- **Profile Loading**: < 300ms for complete profile with activity feed
- **Message Delivery**: < 100ms for real-time message delivery
- **Forum Navigation**: < 200ms for category and topic page loading
- **Social Discovery**: < 400ms for recommendation generation and display
- **Event Search**: < 500ms for location-based event discovery with map

#### Real-Time Feature Optimization
- **WebSocket Management**:
  - Efficient connection handling for messaging and forums
  - Message queuing and offline synchronization
  - Real-time typing indicators and presence status
  - Live activity feed updates with smart batching
- **Caching Strategy**:
  - Intelligent caching for frequently accessed community content
  - Real-time cache invalidation for dynamic social data
  - Edge caching for global community content delivery
  - Personalized content caching with privacy considerations

### Accessibility Requirements

#### Community Accessibility Standards
**WCAG 2.1 AA Compliance:**
- **Social Interface Accessibility**:
  - Screen reader optimization for social feeds and profiles
  - Keyboard navigation for all community features
  - High contrast modes for messaging and forum interfaces
  - Alternative text for user-generated content and media
- **Communication Accessibility**:
  - Voice-to-text integration for messaging accessibility
  - Text-to-speech for forum content and messages
  - Visual indicators for audio content and notifications
  - Customizable text size and contrast for readability

#### Inclusive Community Design
- **Universal Design Principles**:
  - Intuitive navigation suitable for all experience levels
  - Multiple input methods for different abilities
  - Clear visual hierarchy and information organization
  - Consistent interaction patterns across all community features
- **Cultural Accessibility**:
  - Multi-language support for international communities
  - Cultural sensitivity in community guidelines and moderation
  - Time zone awareness for global community coordination
  - Regional customization for local community features

### Testing Requirements

#### Community Feature Testing
- **Social Network Testing**: Following, messaging, and reputation system functionality
- **Real-time Communication**: WebSocket performance and message delivery reliability
- **Forum System Testing**: Complete discussion workflow and moderation tools
- **Event Management**: End-to-end event creation, registration, and management
- **Mobile Community**: Touch interactions, responsive design, and PWA functionality

#### Integration Testing
- **Cross-System Integration**: Community features with authentication, commerce, and deck building
- **External Service Testing**: TalkJS messaging, social login, maps, and payment integration
- **Performance Testing**: Load testing for high-traffic community events and discussions
- **Security Testing**: Privacy controls, content moderation, and abuse prevention systems
- **Accessibility Testing**: Screen reader compatibility and inclusive design validation