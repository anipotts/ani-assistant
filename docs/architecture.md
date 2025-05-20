## 8. Implementation Roadmap

### Phase 0: Spike & PoC (Week 0-1)

- Build minimal Gmail webhook → delegate flow proof of concept
- Create Postman collection for testing API endpoints
- Test OpenAI response streaming with basic UI
- Validate pgvector similarity search performance

### Phase 1: Core Infrastructure (Week 1-2)

- Setup Next.js project with TypeScript and Tailwind
- Configure Supabase and create schema
- Implement authentication flow with NextAuth.js
- Basic UI scaffolding and navigation

### Phase 2: Gmail Integration (Week 2-3)

- Gmail OAuth setup and token management
- Webhook configuration for real-time updates
- Email fetching and thread organization
- Basic inbox UI with thread list and message view

### Phase 3: AI Delegation (Week 3-4)

- LangChain orchestrator implementation
- OpenAI integration with token management
- RAG system with pgvector
- Delegation UI with override options

### Phase 4: SMS & Notifications (Week 4-5)

- Twilio integration for SMS
- OneSignal setup for push notifications
- SMS thread management
- Unified inbox for email and SMS

### Phase 5: Polish & Launch (Week 5-6)

- Analytics and usage tracking
- Settings and preferences UI
- Performance optimization
- Comprehensive testing and bug fixes
- Production deployment# Ani Assistant — Architecture Document

A comprehensive architecture guide for building "Ani Assistant," a personalized email and SMS management assistant with AI-powered response delegation.

## 1. Tech Stack

### Frontend

- **Framework**: Next.js 14.0.4 (App Router) with TypeScript 5.2+
- **UI Library**: shadcn/ui component library built on Tailwind CSS v3.4.0
- **PWA Support**: `next-pwa` v5.6.0 for offline capabilities
- **State Management**: React Context API + SWR v2.2.4 for data fetching

### Backend / API

- **Server**: Next.js API Routes (Edge Runtime for webhooks and critical paths, Node.js Runtime for AI processing)
- **AI Orchestration**: LangChainJS v0.1.8 for prompt management, RAG, and conversation memory
- **Models**: OpenAI GPT-4 Turbo primary; GPT-3.5 Turbo as fallback
- **External APIs**:
  - Gmail API via OAuth2
  - Twilio API for SMS functionality
  - OneSignal for push notifications

### Database & Storage

- **Primary Database**: Supabase (PostgreSQL + pgvector)
- **Caching**: Vercel KV (Redis) for rapid access to frequently used data
- **Vector Store**: pgvector initially; prepared for migration to Pinecone when scaling

### DevOps & Deployment

- **Hosting**: Vercel (Frontend + API)
- **Environment Management**: Vercel environment variables for all secrets
- **Monitoring**: Sentry for error tracking and performance monitoring
- **Analytics**: Vercel Analytics for usage patterns

## 2. System Architecture

```
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│   Frontend    │      │    API Layer  │      │   External    │
│   (Next.js)   │◄────►│  (Next.js API │◄────►│   Services    │
│               │  Pull│    Routes)    │  Pull│               │
└───────────────┘      └───────┬───────┘      └───────────────┘
                              │                       ▲
                              ▼                       │
                     ┌─────────────────┐     ┌────────────────┐
                     │   LangChain     │     │                │
                     │  Orchestrator   │────►│   OpenAI API   │
                     │                 │ Pull│                │
                     └────────┬────────┘     └────────────────┘
                              │
                              ▼
┌───────────────┐     ┌─────────────────┐     ┌────────────────┐
│  OneSignal    │     │    Supabase     │     │                │
│    Push       │◄────│    Database     │◄────┤   Gmail API    │
│Notifications  │ Push│   & pgvector    │ Push│  (Webhooks)    │
└───────────────┘     └─────────────────┘     └────────────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │   Twilio API    │
                     │   (SMS)         │
                     │    Webhooks     │
                     └─────────────────┘
```

**Runtime Distribution:**

- Edge Runtime: Webhooks, thread listing, message sending
- Node.js Runtime: AI processing, RAG operations, heavy compute tasks

## 3. Database Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  gmail_refresh_token TEXT,
  twilio_phone_number TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
-- Apply RLS policy to restrict users to their own data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_isolation ON users FOR ALL TO authenticated USING (id = auth.uid());

-- Raw messages (both inbound and outbound)
CREATE TABLE messages_raw (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms')),
  external_id TEXT, -- Gmail message ID or Twilio SID
  sender TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT, -- NULL for SMS
  body TEXT NOT NULL,
  raw_content JSONB, -- Original API response
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- Apply RLS policy to restrict users to their own messages
ALTER TABLE messages_raw ENABLE ROW LEVEL SECURITY;
CREATE POLICY messages_isolation ON messages_raw FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE INDEX idx_messages_user_id ON messages_raw(user_id);
CREATE INDEX idx_messages_external_id ON messages_raw(external_id) WHERE external_id IS NOT NULL;

-- Message threads
CREATE TABLE message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  thread_key TEXT NOT NULL, -- email thread ID or normalized phone number
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms')),
  title TEXT, -- Subject for email, contact name for SMS
  snippet TEXT, -- Preview text
  last_message_at TIMESTAMPTZ,
  unread_count INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, thread_key)
);
-- Apply RLS policy and create indexes
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY threads_isolation ON message_threads FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE INDEX idx_threads_user_last_message ON message_threads(user_id, last_message_at DESC);
CREATE INDEX idx_threads_user_thread_key ON message_threads(user_id, thread_key); -- For fast lookups

-- Thread messages junction
CREATE TABLE thread_messages (
  thread_id UUID REFERENCES message_threads(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages_raw(id) ON DELETE CASCADE,
  position INTEGER NOT NULL, -- For ordered retrieval
  PRIMARY KEY (thread_id, message_id)
);
-- Apply RLS policy and create indexes
ALTER TABLE thread_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY thread_messages_isolation ON thread_messages FOR ALL TO authenticated
  USING (thread_id IN (SELECT id FROM message_threads WHERE user_id = auth.uid()));
CREATE INDEX idx_thread_messages_position ON thread_messages(thread_id, position); -- For ordered fetch

-- Vector embeddings for RAG
CREATE TABLE embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages_raw(id) ON DELETE CASCADE,
  embedding_vector vector(1536) NOT NULL, -- OpenAI embedding dimension
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ON embeddings USING ivfflat (embedding_vector vector_cosine_ops);
-- Apply RLS policy
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;
CREATE POLICY embeddings_isolation ON embeddings FOR ALL TO authenticated
  USING (message_id IN (SELECT id FROM messages_raw WHERE user_id = auth.uid()));

-- AI delegation history
CREATE TABLE ai_delegations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES message_threads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) NOT NULL,
  prompt TEXT NOT NULL, -- The constructed prompt
  override_instructions TEXT, -- User's custom instructions
  response TEXT NOT NULL, -- AI generated response
  was_edited BOOLEAN, -- Whether user edited before sending
  edit_distance INTEGER, -- If edited, how much changed
  model TEXT NOT NULL, -- Which AI model was used
  tokens_used INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- Apply RLS policy
ALTER TABLE ai_delegations ENABLE ROW LEVEL SECURITY;
CREATE POLICY delegations_isolation ON ai_delegations FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE INDEX idx_delegations_user_thread ON ai_delegations(user_id, thread_id);

-- API usage tracking
CREATE TABLE api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  service TEXT NOT NULL, -- 'openai', 'gmail', 'twilio'
  operation TEXT NOT NULL, -- 'embedding', 'completion', 'send', etc.
  tokens INTEGER, -- For OpenAI
  cost_usd NUMERIC(10, 6) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- Apply RLS policy
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY usage_isolation ON api_usage FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE INDEX idx_usage_user_service ON api_usage(user_id, service, created_at);

-- Webhook idempotency table
CREATE TABLE webhook_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL, -- 'gmail', 'twilio', etc
  external_id TEXT NOT NULL, -- Message ID, SID, or signature
  processed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(source, external_id)
);
```

## 4. Core Components

### 4.1 Frontend

#### Pages & Routes

- `/` - Inbox dashboard with thread list and quick actions
- `/threads/[id]` - Thread detail view with message history
- `/compose` - New message composition
- `/settings` - User preferences and API connections
- `/settings/integrations` - OAuth setup for Gmail and Twilio
- `/settings/usage` - Usage statistics and cost tracking

#### Key Components

- `<ThreadList>` - Sortable, filterable list of conversation threads
- `<MessageView>` - Individual message display with formatting (includes RawContentView fallback for unparseable content)
- `<ThreadDetail>` - Full conversation history with actions
- `<DelegationPanel>` - Controls for AI delegation with override options (lazy-loaded)
- `<DraftEditor>` - Rich text editor for reviewing AI drafts (lazy-loaded)
- `<SettingsForm>` - User preferences and API connection management

#### Performance Optimizations

- Dynamic imports for heavy components (DelegationPanel, DraftEditor)
- Incremental Static Regeneration for static parts of the UI
- Code-splitting by route to minimize initial bundle size
- Image optimization with Next.js Image component
- Client-side data caching with SWR

### 4.2 API Routes

#### Authentication & User

- `POST /api/v1/auth/[...nextauth]` - Authentication endpoints (NextAuth.js)
- `GET /api/v1/user/profile` - Get current user profile
- `PUT /api/v1/user/preferences` - Update user preferences

#### Webhooks

- `POST /api/v1/webhooks/gmail` - Gmail push notifications (Edge Runtime)
- `POST /api/v1/webhooks/twilio` - Twilio SMS webhooks (Edge Runtime)

#### Thread Management

- `GET /api/v1/threads` - List all threads with pagination (Edge Runtime)
- `GET /api/v1/threads/[id]` - Get single thread with messages
- `PUT /api/v1/threads/[id]/archive` - Archive thread
- `PUT /api/v1/threads/[id]/unarchive` - Unarchive thread

#### Message Actions

- `POST /api/v1/threads/[id]/delegate` - Request AI-generated response (Rate limit: 10 req/min)
- `POST /api/v1/threads/[id]/send` - Send final message (email or SMS) (Edge Runtime)
- `POST /api/v1/threads/[id]/read` - Mark thread as read (Edge Runtime)

#### Analytics & Usage

- `GET /api/v1/usage/summary` - Get usage statistics
- `GET /api/v1/usage/cost` - Get cost breakdown

#### Rate Limiting

- Standard routes: 60 requests per minute
- AI delegation: 10 requests per minute
- Error response format:

```json
{
  "error": {
    "status": 429,
    "message": "Rate limit exceeded",
    "retryAfter": 30
  }
}
```

### 4.3 LangChain Orchestrator

#### Prompt Management

```typescript
// Simplified example
const createDelegationPrompt = async (threadId: string, overrideInstructions?: string) => {
  // 1. Get thread history
  const { messages } = await getThreadMessages(threadId);

  // 2. Get relevant context via RAG
  const relevantContext = await retrieveRelevantContextFromRAG(messages);

  // 3. Build prompt with components
  return {
    systemPrompt: `You are Ani Assistant, a personal AI helping to draft responses to messages.
                   ${userStyleGuide}
                   ${overrideInstructions || ""}`,
    messages: formatMessagesForLLM(messages),
    context: relevantContext,
  };
};
```

#### Prompt Schema

```typescript
interface DelegationPrompt {
  systemPrompt: string;
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
    name?: string;
    timestamp?: string;
  }>;
  context: Array<{
    id: string;
    snippet: string;
    relevanceScore: number;
    source: "email" | "sms";
    timestamp: string;
  }>;
  overrideInstructions?: string;
  tokenBudget: {
    systemTokens: number;
    messagesTokens: number;
    contextTokens: number;
    responseTokens: number;
    totalBudget: number;
  };
}
```

#### RAG Implementation

- Vector similarity search via pgvector
- Conversation context retrieval based on semantic similarity
- Automatic embedding generation for all messages

#### Model Management

- Automatic fallback from GPT-4 to GPT-3.5 on rate limits or errors
- Token counting and budget management
- Streaming response support for real-time UI updates

### 4.4 Integration Services

#### Gmail Service

- OAuth2 flow management with token encryption and rotation
- Webhook handling for real-time email notifications (with idempotency checks)
- Thread and message retrieval
- Email sending with proper threading

#### Twilio Service

- Phone number verification
- SMS receipt via webhooks (with signature validation and idempotency)
- Message sending with proper formatting
- Thread management for SMS conversations

#### Notification Service

- OneSignal integration for web push
- Notification preference management
- Badge counting and unread management

#### Webhook Idempotency

- All incoming webhooks are checked against the `webhook_receipts` table
- Duplicate webhook events are identified by source + external_id
- De-duplication prevents double-processing of retried webhook deliveries

## 5. Data Flow

### 5.1 Incoming Message Flow

1. Email arrives → Gmail webhook triggered → POST to `/api/webhooks/gmail`
2. API verifies webhook signature and extracts message data
3. Message is stored in `messages_raw` table
4. Thread is created/updated in `message_threads`
5. Junction record created in `thread_messages`
6. Embedding generated and stored for RAG
7. Push notification sent to user via OneSignal
8. Inbox updated in real-time via SWR revalidation

### 5.2 Delegation Flow

1. User selects "Delegate" on a thread → calls `/api/threads/[id]/delegate`
2. API fetches thread history and relevant context
3. LangChain orchestrator constructs prompt with:
   - System instructions + user style preferences
   - Thread history in chronological order
   - RAG-retrieved similar past conversations
   - User override instructions (if any)
4. Request sent to OpenAI API (streaming)
5. Draft response streamed to frontend
6. User can edit draft in rich text editor
7. Usage recorded in `api_usage` table

### 5.3 Send Flow

1. User approves draft (with/without edits) → calls `/api/threads/[id]/send`
2. API determines channel (email/SMS) from thread
3. For email: Gmail API sends message with proper In-Reply-To headers
4. For SMS: Twilio API sends message to recipient
5. Sent message recorded in `messages_raw` with `direction='outbound'`
6. Thread updated with new message and timestamps
7. Delegation record updated with final sent text and edit metrics
8. Usage costs recorded in `api_usage`

## 6. Security Considerations

### Authentication & Authorization

- NextAuth.js for secure authentication flow
- JWT with short expiration (24 hours), stored in HttpOnly cookies
- Supabase Row-Level Security (RLS) policies enforce data isolation
- All API routes validate user session before access

### API Security

- Rate limiting on all endpoints using Vercel Edge middleware
- CORS restrictions to prevent unauthorized access
- Input validation and sanitization on all user inputs
- Webhook signature verification for Gmail and Twilio

### Secrets Management

- All secrets stored in Vercel environment variables
- OAuth refresh tokens encrypted at rest in database using AES-256
- No API keys exposed to client-side code
- Secret rotation for refresh tokens using Supabase's encryption functions or a vault solution like HashiCorp Vault

### Data Protection

- TLS/HTTPS enforced for all communications
- Minimal scope OAuth tokens (principle of least privilege)
- Regular token rotation for long-lived credentials
- Option for users to purge message history older than X days

## 7. Scalability Considerations

### Current Design (MVP)

- Single-tenant design focused on individual users
- Supabase pgvector for RAG storage (suitable for ~100k messages)
- Vercel serverless functions with connection pooling

### Future Scale Path

1. **Data Tier Upgrade**

   - Migrate from pgvector to Pinecone for faster vector search
   - Implement sharding strategy for user data

2. **Compute Tier Enhancements**

   - Move heavy LLM processing to dedicated workers
   - Implement queuing system for high-volume processing (Redis Streams)
   - Deploy Bullmq for background job processing

3. **Multi-Tenant Support**

   - Team workspaces with shared access
   - Role-based permissions system
   - Cross-user knowledge sharing (opt-in)

4. **Performance Optimizations**
   - Edge caching for static resources
   - Background processing for embeddings generation
   - Batch processing for non-time-sensitive operations

## 8. Implementation Roadmap

### Phase 1: Core Infrastructure (Week 1-2)

- Setup Next.js project with TypeScript and Tailwind
- Configure Supabase and create schema
- Implement authentication flow with NextAuth.js
- Basic UI scaffolding and navigation

### Phase 2: Gmail Integration (Week 2-3)

- Gmail OAuth setup and token management
- Webhook configuration for real-time updates
- Email fetching and thread organization
- Basic inbox UI with thread list and message view

### Phase 3: AI Delegation (Week 3-4)

- LangChain orchestrator implementation
- OpenAI integration with token management
- RAG system with pgvector
- Delegation UI with override options

### Phase 4: SMS & Notifications (Week 4-5)

- Twilio integration for SMS
- OneSignal setup for push notifications
- SMS thread management
- Unified inbox for email and SMS

### Phase 5: Polish & Launch (Week 5-6)

- Analytics and usage tracking
- Settings and preferences UI
- Performance optimization
- Comprehensive testing and bug fixes
- Production deployment

## 9. Monitoring & Analytics

### Error Tracking

- Sentry integration for real-time error reporting
- Custom error boundaries for graceful failure handling
- Structured logging with correlation IDs

### Performance Monitoring

- Vercel Analytics for page performance
- Custom metrics for LLM response times
- API endpoint timing measurements

### Usage Analytics

- Cost tracking per user, thread, and operation
- Token usage optimization monitoring
- Feature usage patterns for future improvements

## 10. Testing Strategy

### Unit Testing

- Jest for core business logic
- React Testing Library for component tests
- Mock implementations for external APIs

### Integration Testing

- API route testing with supertest
- Database operations testing with test fixtures
- LangChain prompt testing with model simulators

### End-to-End Testing

- Playwright for critical user flows
- Webhook simulation for third-party integrations
- Performance testing under load

### Testing Matrix

| Feature            | Unit Tests | Integration Tests | E2E Tests    |
| ------------------ | ---------- | ----------------- | ------------ |
| Auth Flow          | ✅         | ✅                | ✅           |
| Gmail Integration  | ✅         | ✅                | ✅           |
| Twilio Integration | ✅         | ✅                | ✅           |
| Thread Management  | ✅         | ✅                | ✅           |
| Message Viewing    | ✅         | ✅                | ✅           |
| AI Delegation      | ✅         | ✅                | ⚠️ (partial) |
| Message Composer   | ✅         | ✅                | ✅           |
| Settings Pages     | ✅         | ⚠️ (partial)      | ⚠️ (partial) |
| RAG Functionality  | ✅         | ✅                | ❌           |
| Push Notifications | ✅         | ⚠️ (partial)      | ❌           |

_Note: ⚠️ (partial) indicates selective testing of critical paths only_

---

## Appendix

### A. Environment Variables

```
# NextAuth
NEXTAUTH_URL=https://ani-assistant.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-key

# OpenAI
OPENAI_API_KEY=your-openai-key

# Gmail
GMAIL_CLIENT_ID=your-gmail-client-id
GMAIL_CLIENT_SECRET=your-gmail-client-secret
GMAIL_REDIRECT_URI=https://ani-assistant.vercel.app/api/auth/callback/google

# Twilio
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token

# OneSignal
NEXT_PUBLIC_ONESIGNAL_APP_ID=your-onesignal-app-id
ONESIGNAL_API_KEY=your-onesignal-api-key

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

### B. API Reference Documentation

For detailed API documentation, see the following resources:

- OpenAI API: https://platform.openai.com/docs/api-reference
- Gmail API: https://developers.google.com/gmail/api/reference/rest
- Twilio API: https://www.twilio.com/docs/usage/api
- Supabase API: https://supabase.io/docs/reference
- LangChain JS: https://js.langchain.com/docs/
- OneSignal API: https://documentation.onesignal.com/reference

### C. Design Decisions

1. **Next.js App Router**: Provides both static and server components for optimal performance
2. **Tailwind with shadcn/ui**: Consistent design system with minimal CSS overhead
3. **Supabase**: Combines PostgreSQL with auth and vector search capabilities
4. **LangChain**: Abstracts LLM complexity and provides tools for RAG
5. **Vercel Deployment**: Seamless integration with Next.js and serverless functions
