npm run seed# Quick Start Guide

## 5-Minute Setup

### 1. Install Dependencies

```bash
npm install
```

**Time: ~2 minutes**

### 2. Start MongoDB

**Option A: Local MongoDB**

```bash
mongod
```

**Option B: Docker**

```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

**Option C: MongoDB Atlas**

Sign up at https://www.mongodb.com/cloud/atlas and get your connection string.

### 3. Configure Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Update `MONGODB_URI` in `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017/ai-assistant
NEXTAUTH_SECRET=development-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### 4. Seed Database

```bash
npm run seed
```

**Output:**
```
✓ Project created: demo
✓ Users created: admin@example.com, user@example.com
✓ Product instances created: Sales Assistant, Support Bot
✓ Integrations created
✓ Dashboard configuration created
✅ Seed completed successfully!
```

### 5. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### 6. Login

Use these credentials:

| Email | Role | Password |
|-------|------|----------|
| `admin@example.com` | Admin | N/A (no password) |
| `user@example.com` | Member | N/A (no password) |

**Project slug:** `demo`

---

## Key URLs

After login:

- **Chat Interface**: http://localhost:3000/projects/demo
- **Admin Dashboard**: http://localhost:3000/projects/demo/admin (admin only)
- **API Login**: `POST http://localhost:3000/api/auth/login`

---

## Testing Config-Driven Dashboard

### From UI

1. Login as `admin@example.com`
2. Click "Admin Dashboard" (only visible to admins)
3. Click "Edit Layout"
4. Change widget titles or remove widgets
5. Click "Save Changes"
6. Click "Done Editing" to see the update

### From MongoDB

1. Connect to MongoDB:

```bash
mongosh mongodb://localhost:27017/ai-assistant
```

2. Update dashboard config:

```javascript
// See current config
db.dashboardconfigs.findOne()

// Update section title
db.dashboardconfigs.updateOne(
  {},
  { $set: { "sections.0.title": "Updated Title" } }
)

// Update widget
db.dashboardconfigs.updateOne(
  {},
  { $set: { "sections.0.widgets.0.config.value": 100 } }
)
```

3. Refresh admin dashboard in browser - changes appear instantly!

---

## Sample Curl Commands

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "projectSlug": "demo"}' \
  -c cookies.txt
```

### Create Conversation

```bash
curl -X POST http://localhost:3000/api/conversations \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "projectId": "your-project-id",
    "productInstanceId": "sales-assistant-1",
    "title": "Test Chat"
  }'
```

### Get Dashboard Config

```bash
curl -X GET "http://localhost:3000/api/admin/dashboard?projectId=your-project-id" \
  -b cookies.txt
```

---

## Troubleshooting

### MongoDB Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
- Start MongoDB: `mongod` or `docker run -d -p 27017:27017 mongo`
- Check connection string in `.env.local`

### Port 3000 Already in Use

```bash
npm run dev -- -p 3001
```

### Seed Script Fails

```bash
npm run type-check
```

If TypeScript errors, ensure `tsconfig.json` is correct.

### Cookies Not Persisting

- Clear browser cookies
- Check `.env.local` has correct `NEXTAUTH_SECRET`
- Ensure `NODE_ENV=development`

---

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API route handlers
│   ├── projects/          # Project routes
│   ├── login/             # Login page
│   └── layout.tsx         # Root layout
├── components/            # React components
├── db/                    # MongoDB models
├── lib/                   # Utilities (access, session, etc.)
├── services/              # Business logic
├── hooks/                 # React Query hooks
├── types/                 # TypeScript types
└── scripts/               # Utility scripts (seed)
```

---

## Next Steps

1. ✅ App is running
2. 👤 Login and explore chat interface
3. ⚙️ Try admin dashboard (as admin user)
4. ✏️ Edit dashboard and see changes
5. 📊 Check MongoDB collections
6. 🔗 Try Shopify/CRM integration toggles

---

## Building for Production

```bash
npm run build
npm start
```

Then deploy to Vercel:

```bash
vercel deploy
```

Set environment variables in Vercel dashboard.

---

## Support

See **README.md** for full documentation.
