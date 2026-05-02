# Database Schema & Reference

## Collections Overview

The application uses 7 MongoDB collections organized by multi-tenant structure.

### 1. Projects (Tenant Boundary)

```javascript
{
  _id: ObjectId,
  name: String,              // e.g., "Demo Project"
  slug: String,              // e.g., "demo" (unique)
  description: String,
  ownerId: ObjectId,         // References User
  createdAt: Date,
  updatedAt: Date
}
```

**Sample Query:**
```javascript
db.projects.findOne({ slug: "demo" })
```

---

### 2. Users (Project Members)

```javascript
{
  _id: ObjectId,
  email: String,             // e.g., "admin@example.com"
  name: String,
  role: String,              // "admin" or "member"
  projectId: ObjectId,       // References Project (tenant boundary)
  createdAt: Date
}
```

**Sample Query:**
```javascript
// Find all users in demo project
db.users.find({ projectId: ObjectId("..."), role: "admin" })

// Find user by email + project
db.users.findOne({ email: "admin@example.com", projectId: ObjectId("...") })
```

---

### 3. ProductInstances (Products per Project)

```javascript
{
  _id: ObjectId,
  projectId: ObjectId,       // References Project
  productType: String,       // e.g., "sales-assistant", "support-bot"
  name: String,
  namespace: String,         // e.g., "sales", "support"
  config: Object,            // Custom product configuration
  createdAt: Date
}
```

**Sample Query:**
```javascript
// Get all product instances for a project
db.productinstances.find({ projectId: ObjectId("...") })

// Get specific product instance
db.productinstances.findOne({ namespace: "sales", projectId: ObjectId("...") })
```

---

### 4. Integrations (Integration Toggles)

```javascript
{
  _id: ObjectId,
  projectId: ObjectId,           // References Project
  productInstanceId: ObjectId,   // References ProductInstance
  type: String,                  // e.g., "shopify", "crm"
  enabled: Boolean,
  config: Object,                // Integration-specific config
  createdAt: Date
}
```

**Sample Query:**
```javascript
// Get all integrations for a product instance
db.integrations.find({ 
  productInstanceId: ObjectId("...") 
})

// Get enabled integrations
db.integrations.find({ 
  productInstanceId: ObjectId("..."),
  enabled: true 
})

// Toggle integration
db.integrations.updateOne(
  { _id: ObjectId("...") },
  { $set: { enabled: true } }
)
```

---

### 5. Conversations (Chat Sessions)

```javascript
{
  _id: ObjectId,
  projectId: ObjectId,           // References Project
  productInstanceId: ObjectId,   // References ProductInstance
  userId: ObjectId,              // References User
  title: String,                 // e.g., "Chat - 5/2/2026"
  messages: [ObjectId],          // Array of message IDs
  createdAt: Date,
  updatedAt: Date
}
```

**Sample Query:**
```javascript
// Get all conversations for a user's product instance
db.conversations.find({
  projectId: ObjectId("..."),
  productInstanceId: ObjectId("..."),
  userId: ObjectId("...")
})

// Get conversation with messages (requires population)
db.conversations.aggregate([
  { $match: { _id: ObjectId("...") } },
  { $lookup: {
    from: "messages",
    localField: "messages",
    foreignField: "_id",
    as: "messages"
  }}
])
```

---

### 6. Messages (Chat Messages)

```javascript
{
  _id: ObjectId,
  conversationId: ObjectId,  // References Conversation
  role: String,              // "user" or "assistant"
  content: String,
  steps: [String],           // e.g., ["Checking integrations", "Calling AI"]
  createdAt: Date
}
```

**Sample Query:**
```javascript
// Get messages for a conversation
db.messages.find({ conversationId: ObjectId("...") }).sort({ createdAt: 1 })

// Get recent AI responses
db.messages.find({
  conversationId: ObjectId("..."),
  role: "assistant"
}).sort({ createdAt: -1 }).limit(5)
```

---

### 7. DashboardConfigs (Config-Driven UI)

```javascript
{
  _id: ObjectId,
  projectId: ObjectId,       // References Project (unique per project)
  sections: [                // Array of sections
    {
      id: String,            // e.g., "overview"
      title: String,         // e.g., "Overview"
      order: Number,
      widgets: [             // Array of widgets
        {
          id: String,        // e.g., "total-conversations"
          type: String,      // "card", "chart", "table", "metric"
          title: String,
          order: Number,
          config: Object     // Widget-specific config
        }
      ]
    }
  ],
  updatedAt: Date
}
```

**Sample Query:**
```javascript
// Get dashboard config for a project
db.dashboardconfigs.findOne({ projectId: ObjectId("...") })

// Update widget title
db.dashboardconfigs.updateOne(
  { projectId: ObjectId("...") },
  { $set: { "sections.0.widgets.0.title": "New Title" } }
)

// Update widget status
db.dashboardconfigs.updateOne(
  { projectId: ObjectId("...") },
  { $set: { "sections.1.widgets.0.config.status": "active" } }
)

// Add new widget to section
db.dashboardconfigs.updateOne(
  { projectId: ObjectId("...") },
  { $push: { 
    "sections.0.widgets": {
      id: "new-widget",
      type: "metric",
      title: "New Metric",
      order: 5,
      config: { value: 0 }
    }
  }}
)
```

---

## Verification Queries

After running `npm run seed`, verify data is populated:

```javascript
// 1. Check project
db.projects.findOne()
// Should show { name: "Demo Project", slug: "demo", ... }

// 2. Check users
db.users.find()
// Should show admin@example.com and user@example.com

// 3. Check product instances
db.productinstances.find()
// Should show "Sales Assistant" and "Support Bot"

// 4. Check integrations
db.integrations.find()
// Should show Shopify (enabled: true) and CRM (enabled: false)

// 5. Check dashboard config
db.dashboardconfigs.findOne()
// Should show sections with widgets

// Total document counts:
db.projects.countDocuments()      // 1
db.users.countDocuments()         // 2
db.productinstances.countDocuments() // 2
db.integrations.countDocuments()  // 2
db.conversations.countDocuments() // 0 (created during chat)
db.messages.countDocuments()      // 0 (created during chat)
db.dashboardconfigs.countDocuments() // 1
```

---

## Common Operations

### Create New User (First-Time Login)

```javascript
db.users.insertOne({
  email: "newuser@example.com",
  name: "New User",
  role: "member",
  projectId: ObjectId("your-project-id"),
  createdAt: new Date()
})
```

### Change User Role to Admin

```javascript
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)
```

### Enable CRM Integration

```javascript
db.integrations.updateOne(
  { type: "crm" },
  { $set: { enabled: true } }
)
```

### Update Dashboard Layout

```javascript
// Update section title
db.dashboardconfigs.updateOne(
  {},
  { $set: { "sections.0.title": "Dashboard Metrics" } }
)

// Remove a widget
db.dashboardconfigs.updateOne(
  {},
  { $pull: { "sections.0.widgets": { id: "widget-to-remove" } } }
)

// Reorder widgets
db.dashboardconfigs.updateOne(
  { "sections.0.widgets.id": "widget-id" },
  { $set: { "sections.0.widgets.$.order": 10 } }
)
```

### Get Conversation Stats

```javascript
// Total conversations
db.conversations.countDocuments()

// Conversations per user
db.conversations.aggregate([
  { $group: { _id: "$userId", count: { $sum: 1 } } }
])

// Most active product instance
db.conversations.aggregate([
  { $group: { 
    _id: "$productInstanceId", 
    count: { $sum: 1 } 
  }},
  { $sort: { count: -1 } }
])

// Total messages
db.messages.countDocuments()

// Messages per role
db.messages.aggregate([
  { $group: { _id: "$role", count: { $sum: 1 } } }
])
```

---

## Index Recommendations (Production)

For better query performance:

```javascript
// Fast lookup by slug
db.projects.createIndex({ slug: 1 }, { unique: true })

// Fast user lookup
db.users.createIndex({ email: 1, projectId: 1 })

// Fast conversation queries
db.conversations.createIndex({ projectId: 1, userId: 1 })
db.conversations.createIndex({ productInstanceId: 1, updatedAt: -1 })

// Fast message queries
db.messages.createIndex({ conversationId: 1, createdAt: 1 })

// Fast integration lookup
db.integrations.createIndex({ productInstanceId: 1, type: 1 })

// Dashboard config unique per project
db.dashboardconfigs.createIndex({ projectId: 1 }, { unique: true })
```

---

## Data Relationships

```
Project
  ├── Users (many, filtered by projectId)
  ├── ProductInstances (many, by projectId)
  │   ├── Integrations (many, by productInstanceId)
  │   └── Conversations (many, by productInstanceId)
  │       └── Messages (many, by conversationId)
  └── DashboardConfig (one-to-one, by projectId)
```

---

## Troubleshooting

### Why is my data missing?

1. Check if seed was successful:
```javascript
db.projects.find()
```

2. Verify MONGODB_URI is correct:
```javascript
// In mongosh:
db.version()  // Should return MongoDB version
```

3. Reseed if needed:
```bash
npm run seed  // Runs with upsert, so it's safe
```

### How do I reset everything?

```javascript
// Clear all collections
db.projects.deleteMany({})
db.users.deleteMany({})
db.productinstances.deleteMany({})
db.integrations.deleteMany({})
db.conversations.deleteMany({})
db.messages.deleteMany({})
db.dashboardconfigs.deleteMany({})

// Then seed again:
// npm run seed
```

### How do I check if an integration is enabled?

```javascript
db.integrations.findOne({ 
  type: "shopify",
  enabled: true 
})
```

If returns null, integration is disabled.

---

For application-level queries and mutations, see the Services layer in `/services/index.ts`.
