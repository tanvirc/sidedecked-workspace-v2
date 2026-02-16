---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - docs/specifications/01-authentication-user-management-system.md
---
# Authentication & User Management System - Epic Breakdown

## Overview

This document decomposes 01-authentication-user-management-system into implementation-ready epics and stories for BMAD execution.

## Requirements Inventory

### Functional Requirements

- User Registration & Social Login
- Authentication & Session Management
- User Profile Management
- Individual Seller Verification

### NonFunctional Requirements

- Technical requirements are synchronized from the source specification.
- Security and performance constraints are synchronized from the source specification.

### Additional Requirements

- Business rules and integration constraints remain authoritative in the source specification.

### FR Coverage Map

- Epic-to-story coverage is represented by the complete story list below.

## Epic List

- User Registration & Social Login
- Authentication & Session Management
- User Profile Management
- Individual Seller Verification

## Story Index

- Social Login Registration
- Account Onboarding
- Email Verification
- Social Login Authentication
- Session Management
- Account Security
- Profile Information Management
- Account Settings
- Role Management
- Individual Seller Application Process
- Individual Seller Approval Process

## Full Epic and Story Breakdown

### Epic 1: User Registration & Social Login

#### User Story 1.1: Social Login Registration

_As a new user, I want to register using my Google, Microsoft, Facebook, Apple or GitHub account so that I can quickly create an account without filling out forms._

**UI/UX Implementation:**

- **Page**: `/user/register` (Registration Modal/Page)
- **Components**:
  - SocialLoginButtons component with provider icons (Google, GitHub, Microsoft, Facebook, Apple)
  - LoadingSpinner for OAuth redirect state
  - ErrorAlert for authentication failures
- **Layout**: Two-container design - registration form container above, "Already have account?" container below
- **Visual Design**:
  - Full-width provider buttons with 48px height and provider brand colors
  - "Sign up with [Provider]" text with SVG provider icons
  - Tonal variant buttons with border and hover effects
  - Modern glass morphism effects with subtle shadows
- **Interactions**:
  - Click triggers OAuth2 redirect with PKCE security
  - Loading state shows "Redirecting to [Provider]..." text with spinner
  - Error state displays OAuth errors above buttons with retry option
  - All other buttons disabled during OAuth flow
- **Mobile**: Full-screen modal instead of desktop modal, single column layout with touch-friendly 44px minimum button size

**Acceptance Criteria:**

- ✅ User can click "Sign Up with Google", "Sign Up with GitHub", "Sign Up with Microsoft", "Sign Up with Facebook", or "Sign Up with Apple" buttons (IMPLEMENTED)
- ✅ System redirects to OAuth2 provider authorization page (IMPLEMENTED)
- ✅ User grants permissions and is redirected back to SideDecked (IMPLEMENTED)
- ✅ System creates new user account with information from OAuth2 provider (IMPLEMENTED)
- 🔄 User is automatically logged in and redirected to seller onboarding flow (SELLER ONBOARDING ONLY)
- ✅ System stores OAuth2 provider ID and refresh tokens securely (IMPLEMENTED)
- ✅ User profile is pre-populated with name, email from OAuth2 provider (IMPLEMENTED)
- ✅ System handles OAuth2 errors gracefully with error display and retry options (IMPLEMENTED)

#### User Story 1.2: Account Onboarding

_As a newly registered user, I want to complete my profile setup so that I can personalize my experience and choose my role._

**IMPLEMENTATION STATUS**: 🔄 **PARTIALLY IMPLEMENTED** (Seller onboarding only)

**UI/UX Implementation:**

- **Page**: `/sell/upgrade` (Seller upgrade/onboarding flow) - **IMPLEMENTED**
- **Components**: **IMPLEMENTED**
  - ConsumerSellerOnboarding component with progress indicators
  - Multi-step business verification flow
  - Document upload with drag-and-drop functionality
  - RoleSelection component with radio buttons
  - PreferencesForm component with checkboxes and toggles
- **Layout**: Single-page application with step navigation, center-aligned content
- **Step 1 - Profile Information**:
  - Avatar upload with drag-and-drop or click to upload
  - Display name input field
  - Bio/description textarea
  - Location field with address lookup
  - Navigation: "Skip" link and "Continue" button
- **Step 2 - Role Selection**:
  - Three role cards: Customer, Individual Seller, or Both
  - Each card shows role description and capabilities
  - Single selection with visual feedback
- **Step 3 - Preferences**:
  - TCG games multi-select checkboxes (MTG, Pokemon, Yu-Gi-Oh!, One Piece)
  - Notification preferences toggles
  - Privacy settings radio buttons
- **Mobile**: Stacked form fields, full-screen experience, swipe gestures for navigation

**Acceptance Criteria:**

- 🔄 New users are directed to a 3-step onboarding process immediately after registration (SELLER ONBOARDING ONLY)
  - Location: `storefront/src/components/onboarding/ConsumerSellerOnboarding.tsx`
- 🔄 Step 1: Profile Information (display name, bio, location, avatar upload) (BUSINESS INFO IMPLEMENTED)
  - Note: Focused on business verification rather than personal profile
- ✅ Step 2: Role Selection (Customer, Individual Seller, or Both) (IMPLEMENTED)
  - Location: Seller upgrade flow handles customer-to-individual seller transition
- 🔄 Step 3: Preferences (TCG games of interest, notification preferences, privacy settings) (PARTIAL)
  - Note: Business preferences implemented, personal TCG preferences missing
- ✅ Users can skip optional fields but must complete required fields (IMPLEMENTED)
  - Location: Form validation in onboarding components
- ✅ System validates all inputs and provides clear error messages (IMPLEMENTED)
  - Location: Form validation throughout onboarding flow
- ✅ Users can navigate back/forward through onboarding steps (IMPLEMENTED)
  - Location: Multi-step progress indicators and navigation
- ❌ Onboarding can be completed later from profile settings (NOT BUILT)
  - Note: Only seller onboarding can be resumed

#### User Story 1.3: Email Verification

_As a user, I want to verify my email address so that I can receive important notifications and secure my account._

**UI/UX Implementation:**

- **Pages**: `/user/verify-email` (verification prompt), `/user/verify-email/:token` (verification result)
- **Components**:
  - EmailVerificationBanner component for unverified accounts
  - VerificationStatus component showing success/error states
  - ResendVerificationButton component
- **Verification Prompt Page**:
  - Email icon with envelope illustration
  - "Check your email" heading
  - Instructions text with user's email address
  - "Resend verification email" button
  - "Change email address" link
- **Unverified Account Banner** (appears across site):
  - Yellow/orange warning banner at top of pages
  - "Please verify your email address" message
  - "Resend email" button in banner
  - Dismiss option with reminder in 24 hours
- **Verification Result Page**:
  - Success state: Green checkmark icon, "Email verified!" message, "Continue to dashboard" button
  - Error state: Red X icon, error message, "Request new verification" button
- **Limited Functionality Indicators**:
  - Disabled purchase buttons with tooltip "Email verification required"
  - Grayed out social features with verification prompt
- **Mobile**: Full-screen layouts, larger touch targets for action buttons

**Acceptance Criteria:**

- ❌ System sends verification email immediately after registration (NOT BUILT)
- ❌ Verification email contains secure, time-limited token (24 hours expiration) (NOT BUILT)
- ❌ Users can click email link to verify their account (NOT BUILT)
- ❌ Users can request new verification email if needed (NOT BUILT)
- ❌ Unverified accounts have limited functionality (no purchases, limited social features) (NOT BUILT)
- ❌ Clear indication in UI when email is not verified (NOT BUILT)
- ❌ Users can change email address (triggers new verification) (NOT BUILT)

### Epic 2: Authentication & Session Management

#### User Story 2.1: Social Login Authentication

_As a returning user, I want to log in using my social account so that I can access my account quickly and securely._

**UI/UX Implementation:**

- **Page**: `/user` (Login Modal/Page)
- **Components**:
  - LoginModal component (center-aligned modal on mobile, full page on desktop)
  - SocialLoginButtons component with five providers (Google, GitHub, Microsoft, Facebook, Apple)
  - LoadingOverlay component during OAuth flow
  - ErrorAlert component for authentication failures
- **Layout**: Center-aligned container with header, social login section, divider, form fields, and actions
- **Header Section**:
  - "Log in to your account" title with uppercase styling
  - Clean, minimal design with consistent spacing (4px grid)
- **Social Login Section**:
  - Full-width buttons with provider icons and "Continue with [Provider]" text
  - Tonal variant styling with borders and hover effects
  - Button states: default, hover, loading, disabled
- **Loading States**:
  - Button displays spinner and "Redirecting to [Provider]..." text
  - Page overlay prevents interaction
  - All other buttons become disabled
- **Error Handling**:
  - Clear error messages above buttons for different OAuth failures
  - Retry buttons for temporary failures
  - Alternative login method suggestions
- **Mobile**: Full-screen experience, touch-friendly buttons (min 44px), stacked layout

**Acceptance Criteria:**

- ✅ Users can click "Sign In with Google" or "Sign In with GitHub" (IMPLEMENTED)
  - Location: `storefront/src/components/molecules/SocialLoginButtons/SocialLoginButtons.tsx`
  - Note: Also supports Microsoft, Facebook, Apple (5 total providers)
- ✅ System handles OAuth2 flow with PKCE security (IMPLEMENTED)
  - Location: `backend/apps/backend/src/modules/authentication/`
- ✅ Successful authentication generates JWT access token (15-minute expiration) (IMPLEMENTED)
  - Location: `storefront/src/app/auth/callback/route.ts`
- ✅ System generates JWT refresh token (30-day expiration) (IMPLEMENTED)
  - Location: Token management in OAuth callback handling
- ✅ Tokens are stored securely (httpOnly cookies for web, secure storage for mobile) (IMPLEMENTED)
  - Location: Cookie configuration in callback route with httpOnly, secure, sameSite settings
- ✅ Users are redirected to intended page or dashboard after login (IMPLEMENTED)
  - Location: Redirect logic in `/auth/callback/route.ts`
- 🔄 System handles multiple OAuth2 accounts for same email address (PARTIAL)
  - Note: Basic OAuth handling exists, advanced multi-account management not confirmed
- 🔄 Logout invalidates all tokens and clears secure storage (PARTIAL)
  - Note: Basic logout exists, comprehensive token invalidation not confirmed

#### User Story 2.2: Session Management

_As a logged-in user, I want my session to remain active across browser tabs and persist between visits so that I don't have to constantly re-authenticate._

**UI/UX Implementation:**

- **Pages**: `/user/settings` (Session management section)
- **Components**:
  - SessionCard component for each active session
  - SessionRefreshIndicator component (subtle, non-intrusive)
- **Session Refresh Indicators**:
  - Subtle loading indicator during token refresh (top progress bar)
  - No interruption to user experience
  - Error states if refresh fails with re-authentication prompt
- **Auto-logout Warnings**:
  - Modal warning 5 minutes before session expiry
  - "Stay logged in" and "Log out now" options
  - Countdown timer showing remaining time
- **Session Security Features**:
  - New device login notifications
  - Suspicious activity alerts
  - Location-based login confirmations
- **Mobile**: Swipe-to-revoke gestures on session cards, optimized touch targets

**Acceptance Criteria:**

- 🔄 JWT access tokens automatically refresh before expiration using refresh tokens (PARTIAL)
  - Note: Basic token handling exists, automatic refresh mechanism not confirmed
- ✅ Sessions persist across browser tabs and windows (IMPLEMENTED)
  - Location: HttpOnly cookie-based session management
- ✅ Sessions survive browser restart if refresh token is valid (IMPLEMENTED)
  - Location: Persistent cookie storage with appropriate expiration
- 🔄 Idle sessions expire after 30 days of inactivity (PARTIAL)
  - Note: Cookie expiration set, but idle detection not confirmed
- ❌ System logs all authentication events for security monitoring (NOT BUILT)
- ❌ Session termination on password/security changes (NOT BUILT)

#### User Story 2.3: Account Security

_As a user, I want to secure my account with optional two-factor authentication so that I can protect my valuable card collection and transactions._

**UI/UX Implementation:**

- **Page**: `/user/settings` (Security section)
- **Components**:
  - TwoFactorSetup component with QR code display
  - AuthenticatorAppList component showing compatible apps
  - BackupCodesList component for emergency codes
  - TotpInputField component for verification codes
  - TrustedDevicesManager component
- **2FA Setup Flow**:
  - Toggle switch to enable 2FA with setup wizard
  - Step 1: Instructions and authenticator app recommendations (Google Authenticator, Authy, etc.)
  - Step 2: QR code display with manual entry option
  - Step 3: Verification code input to confirm setup
  - Step 4: Backup codes display with download option
- **2FA Management Interface**:
  - Status indicator (enabled/disabled) with visual badge
  - "Regenerate backup codes" button
  - "Disable 2FA" option with confirmation modal
  - Recovery options clearly explained
- **Trusted Devices Section**:
  - List of trusted devices with device info and trust expiry
  - "Remove trust" option for each device
  - "This device" indicator for current device
- **Security Actions Requiring 2FA**:
  - Modal prompts for sensitive actions (large purchases, account changes)
  - TOTP input field with number pad on mobile
  - "Use backup code" alternative option
- **Mobile**: Large number input fields, clear visual feedback, accessibility features for screen readers

**Acceptance Criteria:**

- ❌ Users can enable 2FA using authenticator apps (TOTP) (NOT BUILT)
- ❌ System generates QR code and backup codes for 2FA setup (NOT BUILT)
- ❌ 2FA is required for sensitive actions (large purchases, account changes) (NOT BUILT)
- ❌ Users can disable 2FA using backup codes or current 2FA token (NOT BUILT)
- ❌ System stores 2FA settings securely and encrypted (NOT BUILT)
- ❌ Clear instructions and help documentation for 2FA setup (NOT BUILT)
- ❌ 2FA bypass for trusted devices (optional, 30-day expiration) (NOT BUILT)

### Epic 3: User Profile Management

#### User Story 3.1: Profile Information Management

_As a user, I want to manage my profile information so that other users can learn about me and I can personalize my experience._

**IMPLEMENTATION STATUS**: ✅ **MOSTLY IMPLEMENTED**

**UI/UX Implementation:**

- **Page**: `/user/settings` (Profile Details section)
- **Components**:
  - AvatarUpload component with crop/resize functionality
  - ProfileImageCropper modal component
  - UserInfoForm component with form validation
  - PrivacySettings component with radio buttons
  - SocialLinksManager component
- **Avatar Management**:
  - Current profile image display (150px circular)
  - Default avatar fallback with user initials in colored background
  - "Change photo" button with camera icon
  - Drag-and-drop upload zone or click to browse
  - Image preview modal with crop tool and zoom controls
  - Format requirements: JPG/PNG, max 5MB, minimum 100x100px
- **Basic Information Form**:
  - Display name input (editable, 3-30 characters)
  - Bio/description textarea (500 character limit with counter)
  - Location field with autocomplete/address lookup
  - Website URL field with validation
  - Contact preferences checkboxes (email, phone, messaging)
- **Privacy Settings Section**:
  - Profile visibility radio buttons with descriptions:
    - Public: "Anyone can view your profile"
    - Friends Only: "Only users you follow can view"
    - Private: "Profile hidden from search and direct access"
  - Activity sharing toggles (purchases, deck activity, collection updates)
  - Data collection preferences with GDPR compliance
- **Social Media Links**:
  - Add/remove social links (Twitter, Instagram, YouTube, Twitch)
  - URL validation and social platform detection
  - Preview cards showing linked profiles
- **Mobile**: Single column layout, larger input fields, optimized keyboard types

**Acceptance Criteria:**

- ✅ Users can edit display name, bio, location, and contact preferences (IMPLEMENTED)
  - Location: `storefront/src/components/molecules/ProfileDetailsForm/ProfileDetailsForm.tsx`
  - Note: First name, last name, phone, email editing implemented
- ❌ Avatar upload with image cropping and resizing (max 5MB, JPG/PNG) (NOT BUILT)
- ❌ Profile privacy settings (public, friends only, private) (NOT BUILT)
- ❌ Users can link multiple social media accounts (optional) (NOT BUILT)
- 🔄 Profile shows join date, reputation score, and activity metrics (PARTIAL)
  - Note: Basic profile display exists, detailed metrics not confirmed
- ❌ Users can add personal website and social links (NOT BUILT)
- ❌ Profile changes are logged for security monitoring (NOT BUILT)
- ❌ Public profiles are discoverable through search (NOT BUILT)

#### User Story 3.2: Account Settings

_As a user, I want to manage my account settings so that I can control notifications, privacy, and security preferences._

**UI/UX Implementation:**

- **Page**: `/user/settings` (Account Settings sections)
- **Components**:
  - SettingsNavigation component with tabbed interface
  - NotificationPreferences component with toggle switches
  - PrivacyControls component
  - SecuritySettings component
  - DataExportRequest component
  - AccountDeletion component with confirmation flow
- **Layout**: 4-column responsive grid with left sidebar navigation and main content area
- **Notification Preferences Section**:
  - Email notifications toggle group (marketing, product updates, transactional)
  - In-app notification settings with categories (orders, messages, price alerts)
  - Mobile push notification toggles (if mobile app available)
  - Frequency settings for digest emails (daily, weekly, monthly)
  - "Test notification" buttons for each type
- **Privacy Controls Section**:
  - Profile visibility settings (detailed in User Story 3.1)
  - Activity sharing preferences with granular controls
  - Search engine indexing toggle
  - Data sharing with third-party integrations
  - Marketing communication preferences
- **Security Settings Section**:
  - Password change form (current, new, confirm)
  - Two-factor authentication management (detailed in User Story 2.3)
  - Login notifications toggle
  - Session management (detailed in User Story 2.2)
  - Security questions setup (optional)
- **Data Management Section**:
  - "Download my data" button with GDPR export
  - Data deletion requests with explanation of consequences
  - Account deactivation vs. deletion options
- **Mobile**: Accordion-style sections, full-width toggle switches, simplified navigation

**Acceptance Criteria:**

- ❌ Notification preferences for email, in-app, and mobile push (NOT BUILT)
- ❌ Privacy controls for profile visibility, activity sharing, and data collection (NOT BUILT)
- 🔄 Security settings for 2FA, session management, and login notifications (PARTIAL)
  - Location: `storefront/src/components/molecules/ProfilePasswordForm/ProfilePasswordForm.tsx`
  - Note: Password change form exists, 2FA and session management not built
- ❌ Email preferences for marketing, product updates, and transactional emails (NOT BUILT)
- ❌ Data export functionality for user data (GDPR compliance) (NOT BUILT)
- ❌ Account deactivation and deletion options with clear consequences (NOT BUILT)

#### User Story 3.3: Role Management

_As a user, I want to change my account role so that I can start selling cards or focus only on buying/collecting._

**UI/UX Implementation:**

- **Pages**: `/user/settings` (Role section), `/sell/upgrade` (Individual Seller application)
- **Components**:
  - RoleStatusCard component showing current role and permissions
  - RoleUpgradePrompt component for Individual Seller upgrade
  - RoleComparisonTable component
  - UpgradeProgress component showing application status
- **Current Role Display**:
  - Role badge with icon (Customer: shopping bag, Individual Seller: store front, Admin: shield)
  - Permission summary list showing what user can/cannot do
  - Role benefits highlighting (e.g., "As a Individual Seller, you can list unlimited items")
- **Role Change Interface**:
  - "Become a Individual Seller" prominent call-to-action button for customers
  - Role comparison table showing Customer vs Individual Seller features:
    - Customer: Buy items, create wishlists, build decks, join community
    - Individual Seller: All customer features + list items, manage inventory, access analytics
  - Requirements checklist for Individual Seller upgrade (identity verification, terms acceptance)
- **Individual Seller Upgrade Flow**:
  - "Start Application" button leading to `/sell/upgrade`
  - Progress indicator showing application status (Not Started → In Review → Approved/Rejected)
  - Status cards with estimated processing time (1-8 hours)
  - Email notification preferences for status updates
- **Role Management (for existing Individual Sellers)**:
  - "Pause selling" toggle to temporarily disable Individual Seller features
  - "Focus on buying" mode that hides Individual Seller dashboard sections
  - Cannot downgrade from Individual Seller to customer (data retention)
- **Mobile**: Stacked role cards, simplified comparison view, prominent upgrade button

**Acceptance Criteria:**

- ✅ Users can upgrade from Customer to Individual Seller through verification process (IMPLEMENTED)
  - Location: `storefront/src/app/[locale]/(main)/sell/upgrade/page.tsx`
  - Location: `storefront/src/components/seller/CustomerToSellerUpgrade`
- ✅ Individual Seller verification requires identity documents and business information (IMPLEMENTED)
  - Location: `storefront/src/components/onboarding/ConsumerSellerOnboarding.tsx`
- 🔄 Role changes are processed within 1-8 hours (PARTIAL)
  - Note: Application flow exists, processing timeline not confirmed
- ✅ Users can have both Customer and Individual Seller roles simultaneously (IMPLEMENTED)
  - Note: Architecture supports role progression from customer to Individual Seller
- ✅ Clear explanation of each role's capabilities and restrictions (IMPLEMENTED)
  - Location: Role comparison and upgrade flow descriptions
- 🔄 Role-specific dashboard and navigation changes (PARTIAL)
  - Location: `storefront/src/components/molecules/UserNavigation/UserNavigation.tsx`
  - Note: Basic navigation exists, role-specific features not fully confirmed
- ✅ Individual Sellers must agree to additional terms and conditions (IMPLEMENTED)
  - Location: Terms agreement in seller onboarding flow
- 🔄 Role changes trigger appropriate notification emails (PARTIAL)
  - Note: Email infrastructure exists, specific role change notifications not confirmed

### Epic 4: Individual Seller Verification

#### User Story 4.1: Individual Seller Application Process

_As a customer, I want to apply to become a Individual Seller so that I can sell my card collection on the platform._

**UI/UX Implementation:**

- **Page**: `/sell/upgrade` (Individual Seller Application Form)
- **Components**:
  - MultiStepForm component with progress indicator
  - BusinessInfoForm component
  - DocumentUpload component with drag-and-drop
  - BankAccountForm component
  - TermsAgreement component
  - ApplicationReview component
- **Progress Indicator**:
  - Step counter (1 of 3, 2 of 3, 3 of 3) with visual progress bar
  - Step titles: "Business Information", "Identity Verification", "Financial Setup"
  - Completed steps show checkmarks, current step highlighted
- **Step 1 - Business Information**:
  - Form layout: Two-column on desktop, single column on mobile
  - Legal name input (required, pre-filled from profile)
  - Business name input (optional, with "Same as legal name" checkbox)
  - Tax ID input with format validation and regional variations
  - Business address form with address lookup/autocomplete
  - Business type radio buttons (Individual, LLC, Corporation, etc.)
- **Step 2 - Identity Verification**:
  - Document upload component with drag-and-drop zone
  - File requirements clearly displayed (JPG, PNG, PDF; max 10MB)
  - Upload progress indicators and file preview thumbnails
  - Document type selector (Driver's License, Passport, State ID)
  - Additional business documents section (if business entity selected)
  - Photo capture option for mobile users
- **Step 3 - Financial Setup**:
  - Bank account form with routing and account number validation
  - Payout preferences (daily, weekly, monthly)
  - Fee structure display with calculation examples
  - Terms and conditions with expandable sections
  - "I agree to the terms" checkbox with link to full terms
- **Mobile**: Full-screen experience, larger upload zones, optimized form fields, camera integration for document capture

**Acceptance Criteria:**

- ✅ Multi-step Individual Seller application form with progress indicator (IMPLEMENTED)
  - Location: `storefront/src/components/onboarding/ConsumerSellerOnboarding.tsx`
  - Note: 5-step process with progress tracking
- ✅ Required information: legal name, business name (if applicable), tax ID, address (IMPLEMENTED)
  - Location: Business information forms in onboarding component
- 🔄 Identity verification using government-issued ID upload (IMPLEMENTED)
  - Location: Document upload component with drag-and-drop functionality
- ✅ Bank account information for payouts (validated via micro-deposits) (IMPLEMENTED)
  - Location: Payment setup step in onboarding flow
- 🔄 Agreement to Individual Seller terms, conditions, and fee structure (IMPLEMENTED)
  - Location: Terms acceptance in seller onboarding
- 🔄 Application status tracking and estimated processing time (PARTIAL)
  - Note: Application flow exists, detailed status tracking not confirmed
- 🔄 Email notifications for application status changes (PARTIAL)
  - Note: Email infrastructure exists, specific application notifications not confirmed

#### User Story 4.2: Individual Seller Approval Process

_As an administrator, I want to review and approve Individual Seller applications so that I can ensure platform quality and compliance._

**UI/UX Implementation:**

- **Page**: `TBD` (Backend admin portal)
- **Components**:
  - ApplicationQueue component with sortable table
  - ApplicationDetailModal component
  - DocumentViewer component with zoom and annotation
  - ApprovalActionButtons component
  - DecisionNotesForm component
  - AutomatedChecksPanel component
- **Application Queue Interface**:
  - Data table with columns: Applicant Name, Application Date, Status, Risk Score, Actions
  - Status badges with color coding (Pending: yellow, Under Review: blue, Approved: green, Rejected: red)
  - Sortable columns and filterable by status, date range, risk score
  - Batch actions for bulk approval/rejection of low-risk applications
  - Search functionality by applicant name or application ID
- **Application Detail Modal**:
  - Full-screen modal with applicant information summary
  - Tabbed interface: Overview, Documents, Financial Info, Automated Checks
  - Applicant profile summary with photo and basic information
  - Timeline showing application progress and admin actions
- **Document Viewer Section**:
  - High-resolution document display with zoom controls
  - Side-by-side comparison view for multiple documents
  - Annotation tools for flagging issues or questions
  - Document validation checklist (readable, not expired, matches info, etc.)
- **Decision Interface**:
  - Prominent action buttons: "Approve Application" (green) and "Reject Application" (red)
  - "Request Additional Information" option with template messages
  - Internal notes field for admin team communication
  - Decision reason dropdown for rejection (incomplete docs, failed verification, etc.)
- **Automated Checks Panel**:
  - Identity verification API results
  - Sanctions/watchlist screening results
  - Previous application history
  - Risk score calculation breakdown
- **Mobile**: Responsive table view, modal optimization for smaller screens, touch-friendly controls

**Acceptance Criteria:**

- ❌ Admin dashboard showing pending Individual Seller applications (NOT BUILT)
- ❌ Document verification workflow with approval/rejection options (NOT BUILT)
- ❌ Automated checks for banned individuals or fraudulent information (NOT BUILT)
- ❌ Manual review process for edge cases or high-risk applications (NOT BUILT)
- 🔄 Approval notifications sent to applicants with next steps (PARTIAL)
  - Note: Email infrastructure exists, specific approval notifications not confirmed
- 🔄 Rejection notifications with specific reasons and reapplication guidance (PARTIAL)
  - Note: Email infrastructure exists, specific rejection notifications not confirmed
- 🔄 Individual Seller account activation upon approval with initial setup guidance (PARTIAL)
  - Note: Seller role upgrade flow exists, post-approval activation process not confirmed
- ❌ Background check integration for high-volume or suspicious applications (NOT BUILT)

