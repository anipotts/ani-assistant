### 1.7 Configure API Route Versioning

- **Task**: Setup versioning structure for API routes
- **Acceptance**: API route structure supports /api/v1/ prefix for all endpoints
- **Files**: `src/app/api/v1/route.ts` (base handler for version info)

### 1.8 Setup Edge Runtime Configuration

- **Task**: Configure Next.js for Edge Runtime support
- **Acceptance**: Edge Runtime configuration working for designated API routes
- **Files**: `next.config.js` (updated), `src/lib/edge-runtime.ts`

### 1.9 Configure Rate Limiting Middleware

- **Task**: Implement rate limiting for API routes
- **Acceptance**: Rate limits applied with proper error responses
- **Files**: `src/middleware.ts`, `src/lib/rate-limit.ts`# Ani Assistant MVP — Task Breakdown

This document outlines granular, testable tasks for building the Ani Assistant MVP. Each task has a clear scope, acceptance criteria, and a single focus of concern.

## Phase 0: Spike & Proof of Concept

### 0.1 Create Test Gmail Webhook Flow

- **Task**: Build minimal Express.js server to receive Gmail push notifications
- **Acceptance**: Server receives webhook, validates header, and logs payload
- **Files**: `poc/gmail-webhook-server.js`

### 0.2 Create Basic OpenAI Response Test

- **Task**: Setup simple prompt → completion flow with OpenAI API
- **Acceptance**: Successfully sends sample email to OpenAI and receives response
- **Files**: `poc/openai-test.js`

### 0.3 Test Streaming Response UI

- **Task**: Create simple HTML/JS page that demonstrates streaming API responses
- **Acceptance**: Text appears incrementally as it streams from a mock endpoint
- **Files**: `poc/streaming-ui.html`, `poc/stream-mock.js`

### 0.4 Validate pgvector Query Performance

- **Task**: Setup test Supabase database with pgvector and test embedding queries
- **Acceptance**: Successfully stores and retrieves embeddings with similarity search
- **Files**: `poc/vector-test.js`, `poc/schema.sql`

### 0.5 Create API Testing Collection

- **Task**: Create Postman/Insomnia collection with test endpoints
- **Acceptance**: Collection includes test requests for all major API endpoints
- **Files**: `poc/ani-assistant-api.postman_collection.json`

### 1.1 Initialize Next.js Project

- **Task**: Create a new Next.js 14 project with TypeScript and App Router
- **Acceptance**: Project runs without errors, TypeScript configured correctly
- **Command**: `npx create-next-app@latest ani-assistant --typescript --eslint --app --tailwind --src-dir`
- **Files**: `package.json`, `tsconfig.json`, `next.config.js`, `src/app/page.tsx`

### 1.2 Setup Tailwind CSS and shadcn/ui

- **Task**: Install and configure Tailwind CSS with shadcn/ui components
- **Acceptance**: Tailwind CSS working, shadcn component library accessible
- **Command**: `npx shadcn-ui@latest init`
- **Files**: `tailwind.config.js`, `components.json`

### 1.3 Install Core Dependencies

- **Task**: Install necessary npm packages for the project
- **Acceptance**: All packages installed without conflicts
- **Packages**:
  - `next-auth` for authentication
  - `@supabase/supabase-js` for database
  - `langchain` for AI orchestration
  - `openai` for OpenAI API
  - `swr` for data fetching
  - `next-pwa` for PWA support
  - `zod` for validation
  - Additional utility libraries
- **Files**: Updated `package.json`, `package-lock.json`

### 1.4 Configure ESLint and Prettier

- **Task**: Setup proper linting and code formatting
- **Acceptance**: ESLint and Prettier working with appropriate rules
- **Files**: `.eslintrc.json`, `.prettierrc`

### 1.5 Setup Environment Variables

- **Task**: Create environment variable files and sample templates
- **Acceptance**: `.env.local` and `.env.example` files created with all required variables
- **Files**: `.env.local`, `.env.example`

### 1.6 Setup Project Structure

- **Task**: Create folder structure for the application
- **Acceptance**: All required directories exist
- **Directories**:
  - `src/app/` - Next.js app router pages
  - `src/components/` - UI components
  - `src/lib/` - Utility functions and shared logic
  - `src/services/` - External service integrations
  - `src/types/` - TypeScript type definitions
  - `src/db/` - Database schemas and queries
  - `src/ai/` - AI and LangChain related code
  - `public/` - Public assets

## Phase 2: Authentication & User Management

### 2.1 Setup NextAuth Provider

- **Task**: Configure NextAuth.js v4.24.5 with Google provider for authentication
- **Acceptance**: NextAuth configured with proper session handling
- **Files**: `src/app/api/v1/auth/[...nextauth]/route.ts`, `src/lib/auth.ts`

### 2.2 Create Auth UI Components

- **Task**: Create login, signup and session management UI components
- **Acceptance**: Login/logout functionality works, session state managed properly
- **Files**: `src/components/auth/login-button.tsx`, `src/components/auth/user-dropdown.tsx`

### 2.3 Create Protected Routes

- **Task**: Add middleware to protect routes requiring authentication
- **Acceptance**: Unauthenticated users redirected to login page
- **Files**: `src/middleware.ts`

### 2.4 User Profile Management

- **Task**: Create user profile page and edit functionality
- **Acceptance**: Users can view and edit their profile info
- **Files**: `src/app/settings/profile/page.tsx`, `src/components/settings/profile-form.tsx`

### 2.5 User Preferences Storage

- **Task**: Create API endpoint for storing user preferences
- **Acceptance**: User preferences saved to database and retrieved successfully
- **Files**: `src/app/api/v1/user/preferences/route.ts`

### 2.6 Implement JWT Configuration

- **Task**: Configure NextAuth JWT with short expiration (24h) and secure settings
- **Acceptance**: JWTs expire correctly and are stored in httpOnly cookies
- **Files**: `src/lib/auth.ts` (updated)

## Phase 3: Database Setup

### 3.1 Configure Supabase Client

- **Task**: Setup Supabase client v2.40.0 with connection pooling
- **Acceptance**: Successfully connect to Supabase from the application
- **Files**: `src/lib/supabase.ts`

### 3.2 Create Database Users Table

- **Task**: Create users table in Supabase with RLS policies
- **Acceptance**: Table created with correct schema, RLS policies in place
- **Files**: `src/db/schema/users.sql`

### 3.3 Create Messages Tables

- **Task**: Create messages_raw, message_threads, and thread_messages tables with indexes
- **Acceptance**: Tables created with correct schema, relationships, and appropriate indexes
- **Files**: `src/db/schema/messages.sql`

### 3.4 Create Embeddings Table with pgvector

- **Task**: Setup embeddings table with pgvector extension and ivfflat index
- **Acceptance**: Table created, pgvector extension enabled, vector similarity search works
- **Files**: `src/db/schema/embeddings.sql`

### 3.5 Create Usage Tracking Tables

- **Task**: Create ai_delegations and api_usage tables with RLS policies
- **Acceptance**: Tables created with correct schema and RLS policies
- **Files**: `src/db/schema/usage.sql`

### 3.6 Create Webhook Idempotency Table

- **Task**: Create webhook_receipts table for tracking processed webhooks
- **Acceptance**: Table created with unique constraints on source and external_id
- **Files**: `src/db/schema/webhooks.sql`

### 3.7 Create TypeScript Types for Database Schema

- **Task**: Define TypeScript interfaces matching database schema
- **Acceptance**: TypeScript types created for all database tables
- **Files**: `src/types/database.ts`

### 3.8 Create Database Access Functions

- **Task**: Create utility functions for common database operations
- **Acceptance**: Functions work correctly, handle errors appropriately
- **Files**: `src/db/queries.ts`

### 3.9 Implement Supabase RLS Policies

- **Task**: Create Row-Level Security policies for all tables
- **Acceptance**: Policies restrict access to only the user's own data
- **Files**: `src/db/rls-policies.sql`

### 3.10 Setup Encrypted Token Storage

- **Task**: Implement AES-256 encryption for sensitive tokens
- **Acceptance**: OAuth refresh tokens stored encrypted in database
- **Files**: `src/lib/encryption.ts`

## Phase 4: UI Components

### 4.1 Create App Shell

- **Task**: Build the main layout and navigation structure
- **Acceptance**: Layout renders with header, sidebar, and main content area
- **Files**: `src/app/layout.tsx`, `src/components/layout/app-shell.tsx`

### 4.2 Create Thread List Component

- **Task**: Build the thread list component for inbox view
- **Acceptance**: Component renders thread previews with correct formatting
- **Files**: `src/components/inbox/thread-list.tsx`, `src/components/inbox/thread-preview.tsx`

### 4.3 Create Thread Detail View

- **Task**: Build the thread detail component for conversation view
- **Acceptance**: Component renders full conversation thread with proper styling
- **Files**: `src/components/thread/thread-detail.tsx`, `src/components/thread/message-bubble.tsx`

### 4.4 Create Message View with Raw Fallback

- **Task**: Build message view with fallback for unparseable content
- **Acceptance**: Component handles both formatted and raw content gracefully
- **Files**: `src/components/thread/message-view.tsx`, `src/components/thread/raw-content-view.tsx`

### 4.5 Create Message Composer

- **Task**: Build the message composer for replying to threads
- **Acceptance**: Users can type and format messages
- **Files**: `src/components/thread/message-composer.tsx`

### 4.6 Create Delegation Panel with Lazy Loading

- **Task**: Build the AI delegation panel with dynamic imports
- **Acceptance**: Panel shows delegation options, loads on demand
- **Files**: `src/components/thread/delegation-panel.tsx`

### 4.7 Create Draft Editor with Lazy Loading

- **Task**: Build the rich text editor for AI drafts with dynamic imports
- **Acceptance**: Editor loads on demand, allows draft editing
- **Files**: `src/components/thread/draft-editor.tsx`

### 4.8 Create Settings Interface

- **Task**: Build the settings and preferences interface
- **Acceptance**: Settings page with different sections for app preferences
- **Files**: `src/app/settings/page.tsx`, `src/components/settings/settings-panel.tsx`

### 4.9 Create Usage Dashboard Component

- **Task**: Build usage statistics and cost tracking interface
- **Acceptance**: Usage data displayed in readable format with charts
- **Files**: `src/app/settings/usage/page.tsx`, `src/components/settings/usage-dashboard.tsx`

### 4.10 Implement Code Splitting and Performance Optimizations

- **Task**: Configure dynamic imports and code splitting by route
- **Acceptance**: Initial bundle size optimized, components load on demand
- **Files**: Various component files, `next.config.js` (updated)

## Phase 5: Gmail Integration

### 5.1 Create Gmail OAuth Flow

- **Task**: Implement Gmail OAuth2 authentication flow
- **Acceptance**: Successfully acquire Gmail access and refresh tokens
- **Files**: `src/services/gmail/auth.ts`

### 5.2 Setup Gmail API Client

- **Task**: Create wrapper for Gmail API client
- **Acceptance**: Can make authenticated requests to Gmail API
- **Files**: `src/services/gmail/client.ts`

### 5.3 Implement Gmail Message Fetching

- **Task**: Create functions to fetch emails from Gmail
- **Acceptance**: Successfully retrieve emails with proper formatting
- **Files**: `src/services/gmail/messages.ts`

### 5.4 Implement Gmail Thread Management

- **Task**: Create functions to manage email threads
- **Acceptance**: Group emails into threads correctly
- **Files**: `src/services/gmail/threads.ts`

### 5.5 Create Gmail Webhook Handler with Idempotency

- **Task**: Create API endpoint for Gmail push notifications with duplicate detection
- **Acceptance**: Webhook receives, validates Gmail notifications, and prevents duplicates
- **Files**: `src/app/api/v1/webhooks/gmail/route.ts`, `src/services/webhooks/idempotency.ts`

### 5.6 Implement Gmail Message Sending

- **Task**: Create function to send emails via Gmail API
- **Acceptance**: Successfully send emails with proper threading
- **Files**: `src/services/gmail/send.ts`

### 5.7 Create Gmail Integration Settings Page

- **Task**: Build interface for connecting/disconnecting Gmail
- **Acceptance**: Users can manage their Gmail integration
- **Files**: `src/app/settings/integrations/gmail/page.tsx`

### 5.8 Implement Secure Token Storage

- **Task**: Create secure storage for Gmail refresh tokens using encryption
- **Acceptance**: Tokens stored securely with proper encryption/decryption
- **Files**: `src/services/gmail/token-manager.ts`

## Phase 6: AI Orchestration

### 6.1 Setup OpenAI Client

- **Task**: Create wrapper for OpenAI API v4.24.1
- **Acceptance**: Can make requests to OpenAI API with proper error handling
- **Files**: `src/ai/openai-client.ts`

### 6.2 Create LangChain Helper

- **Task**: Setup LangChain v0.1.8 with basic chain templates
- **Acceptance**: LangChain correctly initialized with models
- **Files**: `src/ai/langchain-setup.ts`

### 6.3 Implement Embedding Generation

- **Task**: Create function to generate embeddings for messages
- **Acceptance**: Successfully generate and store embeddings
- **Files**: `src/ai/embeddings.ts`

### 6.4 Create RAG Query System

- **Task**: Implement retrieval augmented generation for context
- **Acceptance**: Can query similar messages based on vector similarity
- **Files**: `src/ai/rag.ts`

### 6.5 Build Prompt Templates

- **Task**: Create prompt templates for delegation with defined schema
- **Acceptance**: Templates generate appropriate prompts following the schema
- **Files**: `src/ai/prompts.ts`, `src/types/prompt-schema.ts`

### 6.6 Implement Token Budget Management

- **Task**: Create utility for managing token allocation across prompt components
- **Acceptance**: Properly allocates tokens between system, messages, context, and response
- **Files**: `src/ai/token-budget.ts`

### 6.7 Implement Delegation Handler

- **Task**: Create API endpoint for delegation requests
- **Acceptance**: Endpoint processes delegation requests with AI
- **Files**: `src/app/api/v1/threads/[id]/delegate/route.ts`

### 6.8 Implement Response Streaming

- **Task**: Add streaming support for AI responses
- **Acceptance**: AI responses stream to UI in real-time
- **Files**: `src/ai/streaming.ts`

### 6.9 Create Token Usage Tracking

- **Task**: Add token counting and cost tracking
- **Acceptance**: Accurately track and record API usage
- **Files**: `src/ai/token-counter.ts`, `src/services/usage-tracking.ts`

### 6.10 Implement Model Fallback Logic

- **Task**: Create automatic fallback from GPT-4 to GPT-3.5 on rate limits
- **Acceptance**: System gracefully handles rate limits and falls back to alternative model
- **Files**: `src/ai/model-fallback.ts`

## Phase 7: Twilio Integration

### 7.1 Setup Twilio Client

- **Task**: Create wrapper for Twilio API
- **Acceptance**: Can make authenticated requests to Twilio API
- **Files**: `src/services/twilio/client.ts`

### 7.2 Create Twilio Webhook Handler with Idempotency

- **Task**: Create API endpoint for Twilio SMS webhooks with signature validation
- **Acceptance**: Webhook receives, validates SMS notifications, and prevents duplicates
- **Files**: `src/app/api/v1/webhooks/twilio/route.ts`, `src/services/twilio/signature-validator.ts`

### 7.3 Implement SMS Thread Management

- **Task**: Create functions to manage SMS conversations
- **Acceptance**: Group SMS messages into threads correctly
- **Files**: `src/services/twilio/threads.ts`

### 7.4 Implement SMS Sending

- **Task**: Create function to send SMS via Twilio API
- **Acceptance**: Successfully send SMS messages
- **Files**: `src/services/twilio/send.ts`

### 7.5 Create Twilio Integration Settings Page

- **Task**: Build interface for connecting/disconnecting Twilio
- **Acceptance**: Users can manage their Twilio integration
- **Files**: `src/app/settings/integrations/twilio/page.tsx`

### 7.6 Implement Phone Number Verification

- **Task**: Add functionality to verify user's phone number
- **Acceptance**: Phone number verification works with verification code
- **Files**: `src/services/twilio/verification.ts`

## Phase 8: Notification System

### 8.1 Setup OneSignal Client

- **Task**: Integrate OneSignal for push notifications
- **Acceptance**: OneSignal SDK initialized correctly
- **Files**: `src/services/notifications/onesignal.ts`

### 8.2 Create Service Worker for PWA

- **Task**: Setup service worker with next-pwa v5.6.0
- **Acceptance**: Service worker registered, PWA installable
- **Files**: `public/sw.js`, `next.config.js` (updated)

### 8.3 Implement Push Subscription Management

- **Task**: Create functions to manage push subscriptions
- **Acceptance**: Users can subscribe/unsubscribe from notifications
- **Files**: `src/services/notifications/subscriptions.ts`

### 8.4 Create Notification Trigger System

- **Task**: Implement logic for when to send notifications
- **Acceptance**: Notifications triggered for new messages
- **Files**: `src/services/notifications/triggers.ts`

### 8.5 Create Notification Settings UI

- **Task**: Build interface for notification preferences
- **Acceptance**: Users can manage notification settings
- **Files**: `src/app/settings/notifications/page.tsx`

### 8.6 Implement Web Push Notification Handler

- **Task**: Create handler for web push notifications
- **Acceptance**: Push notifications received and displayed properly
- **Files**: `src/services/notifications/handler.ts`

## Phase 9: Core Functionality

### 9.1 Implement Inbox Data Fetching

- **Task**: Create API endpoint for thread listing (Edge Runtime)
- **Acceptance**: Successfully fetch and display threads
- **Files**: `src/app/api/v1/threads/route.ts`

### 9.2 Implement Thread Detail Fetching

- **Task**: Create API endpoint for thread details
- **Acceptance**: Successfully fetch thread with all messages
- **Files**: `src/app/api/v1/threads/[id]/route.ts`

### 9.3 Implement Message Sending Flow

- **Task**: Create API endpoint for sending messages (Edge Runtime)
- **Acceptance**: Successfully send messages via appropriate channel
- **Files**: `src/app/api/v1/threads/[id]/send/route.ts`

### 9.4 Create Thread Archive Functionality

- **Task**: Add ability to archive/unarchive threads
- **Acceptance**: Threads can be archived and filtered
- **Files**: `src/app/api/v1/threads/[id]/archive/route.ts`

### 9.5 Implement Read/Unread Management

- **Task**: Add functions to mark threads as read/unread (Edge Runtime)
- **Acceptance**: Unread count updated correctly
- **Files**: `src/app/api/v1/threads/[id]/read/route.ts`

### 9.6 Create Compose New Message Flow

- **Task**: Build interface and API for new message composition
- **Acceptance**: Users can start new conversations
- **Files**: `src/app/compose/page.tsx`, `src/app/api/v1/compose/route.ts`

### 9.7 Implement Progressive Loading States

- **Task**: Add loading indicators and skeleton screens for all data fetching operations
- **Acceptance**: UI shows appropriate loading states during data fetching
- **Files**: `src/components/ui/skeleton.tsx`, various component files

## Phase 10: Monitoring & Testing

### 10.1 Setup Sentry Integration

- **Task**: Configure Sentry for error tracking
- **Acceptance**: Errors properly captured and reported to Sentry
- **Files**: `src/lib/sentry.ts`

### 10.2 Create Error Boundary Components

- **Task**: Add error boundaries for graceful failure handling
- **Acceptance**: UI doesn't crash on component errors
- **Files**: `src/components/error-boundary.tsx`

### 10.3 Implement Logging System

- **Task**: Create structured logging with correlation IDs
- **Acceptance**: Logs capture relevant information for debugging
- **Files**: `src/lib/logger.ts`

### 10.4 Setup Jest Tests

- **Task**: Configure Jest for unit testing
- **Acceptance**: Test suite runs without errors
- **Files**: `jest.config.js`, `src/tests/setup.ts`

### 10.5 Write Core Utility Tests

- **Task**: Create unit tests for critical utility functions
- **Acceptance**: Tests pass with good coverage
- **Files**: `src/tests/utils/*.test.ts`

### 10.6 Write API Route Tests

- **Task**: Create tests for API endpoints
- **Acceptance**: API routes return correct responses
- **Files**: `src/tests/api/*.test.ts`

### 10.7 Write Component Tests

- **Task**: Create tests for key UI components
- **Acceptance**: Components render correctly with different props
- **Files**: `src/tests/components/*.test.ts`

### 10.8 Setup Playwright E2E Tests

- **Task**: Configure Playwright for end-to-end testing
- **Acceptance**: E2E tests run successfully
- **Files**: `playwright.config.ts`, `e2e/`

### 10.9 Create Testing Matrix and Coverage Plan

- **Task**: Develop a plan for test coverage across different components
- **Acceptance**: Test coverage plan aligns with testing matrix in architecture
- **Files**: `testing-plan.md`

### 10.10 Implement API Mocks for Testing

- **Task**: Create mock implementations of external APIs for testing
- **Acceptance**: Tests run without requiring actual external API calls
- **Files**: `src/tests/mocks/gmail-api.ts`, `src/tests/mocks/twilio-api.ts`, `src/tests/mocks/openai-api.ts`

## Phase 11: Deployment & Polish

### 11.1 Configure Vercel Deployment

- **Task**: Setup Vercel project and deployment
- **Acceptance**: Application deploys successfully to Vercel
- **Files**: `vercel.json`

### 11.2 Configure Production Environment

- **Task**: Set up production environment variables
- **Acceptance**: All env variables configured in Vercel dashboard
- **Files**: N/A (Vercel dashboard)

### 11.3 Implement Progressive Loading States

- **Task**: Add loading states and skeletons to UI
- **Acceptance**: UI shows appropriate loading indicators
- **Files**: `src/components/ui/skeleton.tsx`, loading state files

### 11.4 Add Responsive Design Improvements

- **Task**: Ensure UI works well on mobile devices
- **Acceptance**: Application is fully responsive on all screens
- **Files**: Various component files with responsive tweaks

### 11.5 Create Landing Page

- **Task**: Build public landing page for the application
- **Acceptance**: Informative landing page explaining the app
- **Files**: `src/app/page.tsx` (when not authenticated)

### 11.6 Implement Analytics

- **Task**: Add Vercel Analytics for usage tracking
- **Acceptance**: Analytics data being collected correctly
- **Files**: `src/lib/analytics.ts`

### 11.7 Create Application Manifest

- **Task**: Create web manifest for PWA installation
- **Acceptance**: PWA can be installed on devices
- **Files**: `public/manifest.json`

### 11.8 Generate Icons and Splash Screens

- **Task**: Create app icons for various platforms
- **Acceptance**: Icons display correctly on all devices
- **Files**: Various icon files in `public/`

### 11.9 Final Cross-Browser Testing

- **Task**: Test application in multiple browsers
- **Acceptance**: Application works in Chrome, Firefox, Safari, Edge
- **Files**: N/A (manual testing)

### 11.10 Performance Optimization

- **Task**: Run Lighthouse audit and fix issues
- **Acceptance**: Good scores on performance, accessibility, SEO
- **Files**: Various files based on audit results

## Post-MVP Tasks (Next Phase)

### Future Task Areas

- Implement Redis Streams for background processing queue
- Migrate from pgvector to Pinecone for improved vector search
- Add calendar integration for scheduling awareness
- Create team workspace features
- Add attachment handling for emails
- Implement custom AI personas
- Add analytics dashboard for usage patterns
- Create mobile app wrapper with React Native
- Implement sentiment analysis for urgent message detection
- Add automated follow-up reminders
