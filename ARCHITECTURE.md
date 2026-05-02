# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser / Client                         │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js Frontend (React)                        │
├─────────────────────────────────────────────────────────────┤
│ Components                                                   │
│ ├─ ChatInterface                                            │
│ ├─ AdminDashboard (Config-driven from MongoDB)            │
│ └─ Product Instance Selector                               │
│                                                             │
│ Hooks (TanStack Query)                                      │
│ ├─ useConversations()                                       │
│ ├─ useSendMessage()                                         │
│ ├─ useDashboardConfig()                                     │
│ └─ useUpdateDashboardConfig()                               │
└──────────────────────────┬──────────────────────────────────┘
                           │ API Calls
                           ▼
┌─────────────────────────────────────────────────────────────┐
│          Next.js Route Handlers (API Layer)                 │
├─────────────────────────────────────────────────────────────┤
│ /api/auth/login           ┐                                 │
│ /api/auth/logout          │                                 │
│ /api/conversations        │ Thin validation only            │
│ /api/messages             │ Delegates to services           │
│ /api/admin/dashboard      │                                 │
│                           ┘                                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│        Services Layer (Business Logic)                      │
├─────────────────────────────────────────────────────────────┤
│ ConversationService                                         │
│ ├─ createConversation()                                     │
│ ├─ getConversation()                                        │
│ └─ addMessage()                                             │
│                                                             │
│ AIService                                                   │
│ ├─ generateResponse()   ──┐                                │
│ └─ callGeminiAPI()        │─── Integrates with Real AI     │
│                          ┘                                  │
│ ProductInstanceService                                      │
│ ├─ getProductInstances()                                    │
│ └─ createProductInstance()                                  │
│                                                             │
│ IntegrationService                                          │
│ ├─ getIntegrations()                                        │
│ ├─ updateIntegration()                                      │
│ └─ getEnabledIntegrations()                                 │
│                                                             │
│ DashboardService                                            │
│ ├─ getDashboardConfig()   ──┐                              │
│ └─ updateDashboardConfig()   │─── Config-Driven UI        │
│                             ┘                              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│         Access Layer (Authorization)                        │
├─────────────────────────────────────────────────────────────┤
│ canUserAccessProject(userId, projectId)                    │
│ isProjectAdmin(userId, projectId)                          │
│ requireProjectAccess(userId, projectId)                    │
│ requireProjectAdmin(userId, projectId)                     │
│                                                             │
│ Pure functions - no side effects                           │
│ Tests database for authorization rules                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│      Database Layer (MongoDB + Mongoose)                    │
├─────────────────────────────────────────────────────────────┤
│ Collections:                                                │
│ ├─ users                  (email, name, role, projectId)  │
│ ├─ projects               (name, slug, ownerId)           │
│ ├─ productinstances       (projectId, type, namespace)    │
│ ├─ integrations           (projectId, type, enabled)      │
│ ├─ conversations          (projectId, userId, messages)   │
│ ├─ messages               (conversationId, content)       │
│ └─ dashboardconfigs       (projectId, sections, widgets) │
│                                                             │
│ Schema validation via Mongoose                            │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### Example 1: Send Chat Message

```
User types message
        ↓
MessageInput component calls useSendMessage()
        ↓
POST /api/messages (with conversationId, content)
        ↓
Route handler validates with Zod
        ↓
Gets session, verifies project access
        ↓
ConversationService.addMessage() (user message)
        ↓
AIService.generateResponse() 
  ├─ Gets enabled integrations
  ├─ Calls Gemini API (or mock)
  └─ Returns response + steps
        ↓
ConversationService.addMessage() (AI response)
        ↓
Response sent to client
        ↓
useSendMessage hook updates cache
        ↓
MessageList component re-renders with new messages
```

### Example 2: Update Admin Dashboard Config

```
Admin clicks "Edit Layout"
        ↓
DashboardEditor component shows current config
        ↓
Admin modifies widgets, sections
        ↓
Admin clicks "Save Changes"
        ↓
useUpdateDashboardConfig() calls
  PUT /api/admin/dashboard
        ↓
Route handler checks if user is admin
        ↓
requireProjectAdmin() checks database
        ↓
If admin, updateDashboardConfigSchema validates
        ↓
DashboardService.updateDashboardConfig()
        ↓
MongoDB document updated (dashboardconfigs collection)
        ↓
Returned to client with updated config
        ↓
useDashboardConfig hook invalidates and refetches
        ↓
AdminDashboard component re-renders with new sections/widgets
        ↓
User sees new layout immediately!
```

### Example 3: Login

```
User enters email + project slug
        ↓
LoginPage calls useLogin()
        ↓
POST /api/auth/login
        ↓
Route handler validates with loginSchema
        ↓
ProjectService.getProjectBySlug()
        ↓
UserService.getOrCreateUser() (auto-create on first login)
        ↓
createSessionToken() generates JWT
        ↓
setSessionCookie() stores in httpOnly cookie
        ↓
Response sent to client
        ↓
useLogin hook succeeds
        ↓
useRouter().push() navigates to /projects/{slug}
        ↓
ProjectLayout checks getSessionFromCookie()
        ↓
Verified → render dashboard and chat
```

## Multi-Tenant Scoping

Every request maintains multi-tenant isolation:

```
Tenant Boundary = Project

User ──owned by──> Project (via projectId)
Product Instance ──belongs to──> Project
Integration ──belongs to──> Project
Conversation ──belongs to──> Project
DashboardConfig ──belongs to──> Project

Authorization Flow:
1. Extract session (who is logging in)
2. Get requested projectId
3. Check if user.projectId === requestedProjectId
4. If yes → allow operation
5. If no → deny with 403

Result: Users cannot see/access other projects' data
```

## Config-Driven UI Pattern

### Traditional Approach
```
Code → Build → Deploy → UI Changes Visible
```

### Config-Driven Approach
```
Code (static)
    ↓
MongoDB Config
    ↓
       ├─ Update config in MongoDB
       ├─ UI reads config
       └─ UI renders accordingly
    ↓
UI Changes Visible (no code change!)
```

### In Our Dashboard

```
DashboardConfig MongoDB Document:
{
  projectId: "...",
  sections: [
    {
      id: "overview",
      title: "Overview",
      order: 1,
      widgets: [
        {
          id: "metric-1",
          type: "metric",
          title: "Active Users",
          config: { value: 42 }
        }
      ]
    }
  ]
}

AdminDashboard.tsx:
1. Loads config from MongoDB via API
2. Maps over sections
3. For each section, maps over widgets
4. DashboardWidget renders based on widget.type
5. Displays widget.config values

Result: Change MongoDB → See new dashboard layout!
```

## Session & Authorization

```
┌─────────────────────────────────┐
│ Client: Browser                 │
│ (Stores httpOnly cookie)        │
└────────────────┬────────────────┘
                 │ Include cookie in every request
                 ▼
┌─────────────────────────────────┐
│ Route Handler                   │
│ 1. getSessionFromCookie()       │
│ 2. Verify JWT token            │
│ 3. Extract user info           │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│ Access Layer                    │
│ 1. Check user.projectId match   │
│ 2. Check user.role if needed    │
│ 3. Throw AccessDeniedError      │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│ Services Layer                  │
│ (Proceed if authorized)         │
└─────────────────────────────────┘
```

## Deployment Targets

### Vercel (Production-Ready)

- Auto-deploys from GitHub
- Serverless functions for API routes
- Set env vars in Vercel dashboard
- MongoDB Atlas recommended

### Docker (Local or Self-Hosted)

```
docker-compose up
├─ MongoDB on :27017
├─ App on :3000
└─ Auto-seeded on first run
```

### Environment Requirements

```
✓ Node.js 18+
✓ MongoDB 5+
✓ Optional: Gemini API key
✓ NEXTAUTH_SECRET (any random string)
```

## Type Safety

- **Zod Schemas**: Validate all inputs (API routes)
- **TypeScript Types**: Compile-time type checking
- **Mongoose Models**: Schema validation at DB layer
- **React TypeScript**: Component props type-safe

```typescript
Input → Zod Validate → Type-safe Service → DB
                    ↓
                Error if invalid
```

## Performance Considerations

### TanStack Query

- Caches API responses
- Automatic refetching on window focus
- Optimistic updates
- Background invalidation

### Conversation List

- Queries conversations by projectId + productInstanceId
- Returns only essential fields (title, createdAt)
- Sorted by updatedAt descending

### Dashboard Config

- Cached after first load
- Invalidates on update
- Lightweight JSON structure

## Error Handling

```
Route Handler
    ↓
Try-Catch
    ├─ Validation errors → 400
    ├─ Access denied → 403
    ├─ Not found → 404
    └─ Server errors → 500
    ↓
Error response to client
    ↓
Hook shows error message
    ↓
User sees feedback
```

---

For more details, see the **README.md** and source code comments.
