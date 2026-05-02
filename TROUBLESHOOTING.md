# Common Issues & Troubleshooting

## Installation Issues

### Error: "Cannot find module 'mongoose'"

```bash
npm install
npm run dev
```

### Error: "Port 3000 already in use"

```bash
# Use a different port
npm run dev -- -p 3001

# Or kill the process using port 3000
# On macOS/Linux:
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# On Windows (PowerShell):
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## Database Connection Issues

### Error: "connect ECONNREFUSED 127.0.0.1:27017"

**Means:** MongoDB is not running.

**Solution:**

Option 1: Start MongoDB locally
```bash
mongod
```

Option 2: Use Docker
```bash
docker run -d -p 27017:27017 mongo
```

Option 3: Use MongoDB Atlas (cloud)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-assistant
```

### Error: "MongoAuthError: authentication failed"

**Means:** MongoDB connection string credentials are wrong.

**Solution:**
1. Check username/password in connection string
2. Verify connection string format:
   ```
   mongodb+srv://user:pass@host/database
   ```
3. Check for special characters (URL encode them)

### Error: "MongoNetworkError: getaddrinfo ENOTFOUND host"

**Means:** MongoDB host is unreachable.

**Solution:**
1. Verify host URL is correct
2. Check MongoDB Atlas IP whitelist (add your IP)
3. Check network/firewall settings

---

## Authentication & Session Issues

### Issue: "Unauthorized" error on all API calls

**Means:** Session cookie is missing or invalid.

**Solution:**
1. Login first: `POST /api/auth/login`
2. Verify cookie is stored (check browser DevTools → Application → Cookies)
3. Ensure credentials are correct

### Issue: Login button doesn't work

**Cause:** Email or project slug is wrong.

**Solution:**
- Use demo credentials:
  - Email: `admin@example.com` or `user@example.com`
  - Project slug: `demo`
  - No password needed

### Issue: "AccessDeniedError" on protected routes

**Means:** User doesn't have permission.

**Solution:**
1. For admin routes, login as `admin@example.com`
2. Check user role in database:
   ```javascript
   db.users.findOne({ email: "your-email@example.com" })
   ```
3. Update role if needed:
   ```javascript
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin" } }
   )
   ```

---

## Chat & Conversation Issues

### Issue: Can't create a new conversation

**Means:** Product instance or project ID is invalid.

**Solution:**
1. Verify project exists and you have access:
   ```javascript
   db.projects.findOne({ slug: "demo" })
   ```
2. Verify product instance exists:
   ```javascript
   db.productinstances.find()
   ```
3. Make sure you're using correct IDs in API call

### Issue: AI doesn't respond

**Means:** Either Gemini API is not configured or there's an error.

**Solution:**
1. Check logs for error message in terminal
2. Verify `GEMINI_API_KEY` is set in `.env.local`:
   ```bash
   # Check
   echo $GEMINI_API_KEY
   
   # Add if missing
   # 1. Get key from https://ai.google.dev
   # 2. Add to .env.local
   # 3. Restart dev server: npm run dev
   ```
3. Without API key, you'll get mock responses (still works for testing)

### Issue: Messages not saving

**Means:** Database or service error.

**Solution:**
1. Check MongoDB is running
2. Check browser console for errors
3. Check terminal logs
4. Verify conversation exists in database:
   ```javascript
   db.conversations.findOne()
   ```

---

## Admin Dashboard Issues

### Issue: Admin Dashboard option doesn't appear

**Means:** You're not logged in as admin.

**Solution:**
1. Check your user role:
   ```javascript
   db.users.findOne({ email: "your-email@example.com" })
   ```
2. If role is "member", update it:
   ```javascript
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin" } }
   )
   ```
3. Logout and login again

### Issue: Dashboard layout doesn't update

**Means:** Config not persisted to MongoDB.

**Solution:**
1. Check config exists:
   ```javascript
   db.dashboardconfigs.findOne()
   ```
2. If missing, reseed:
   ```bash
   npm run seed
   ```
3. Check browser console for errors
4. Try editing from MongoDB directly:
   ```javascript
   db.dashboardconfigs.updateOne(
     {},
     { $set: { "sections.0.title": "Test Update" } }
   )
   ```
5. Refresh browser

### Issue: Widgets not showing

**Means:** Widget type is not implemented.

**Solution:**
1. Check widget type is valid:
   ```javascript
   // Valid types: "card", "chart", "table", "metric"
   db.dashboardconfigs.findOne()
   ```
2. Check `DashboardWidget.tsx` for supported types
3. Verify widget config matches expected format

---

## Integration Issues

### Issue: Integrations not toggling

**Means:** Integration update failed.

**Solution:**
1. Check integration exists:
   ```javascript
   db.integrations.find()
   ```
2. Manually toggle:
   ```javascript
   db.integrations.updateOne(
     { type: "shopify" },
     { $set: { enabled: true } }
   )
   ```
3. Refresh browser

### Issue: Integration config not saved

**Means:** Invalid config object.

**Solution:**
1. Verify config is valid JSON:
   ```javascript
   db.integrations.findOne({ type: "shopify" })
   // Check config field is valid
   ```
2. Update with valid config:
   ```javascript
   db.integrations.updateOne(
     { type: "shopify" },
     { $set: { 
       config: { 
         apiKey: "demo_key",
         storeName: "demo-store.myshopify.com"
       }
     }}
   )
   ```

---

## Development Issues

### Issue: TypeScript errors

**Solution:**
```bash
npm run type-check
```

Fix errors indicated or check types in `/types/index.ts`

### Issue: "Cannot find module '@/...'"

**Means:** Path alias not resolved.

**Solution:**
1. Verify `tsconfig.json` path aliases
2. Restart VS Code TypeScript server (Cmd+Shift+P → TypeScript: Restart TS Server)
3. Check file actually exists at that path

### Issue: Build fails locally but works in dev

**Solution:**
```bash
npm run build
npm run type-check
npm start
```

Check error messages carefully.

---

## Performance Issues

### Issue: Slow API responses

**Solution:**
1. Check MongoDB indexes:
   ```javascript
   db.conversations.getIndexes()
   ```
2. Check query performance:
   ```javascript
   db.conversations.find().explain("executionStats")
   ```
3. Consider adding indexes (see DATABASE_SCHEMA.md)

### Issue: Slow dashboard loading

**Solution:**
1. Check dashboard config size:
   ```javascript
   db.dashboardconfigs.findOne().size
   ```
2. Reduce number of widgets
3. Check TanStack Query cache settings

---

## Browser Issues

### Issue: Cookies not persisting

**Solution:**
1. Check if cookies are enabled
2. Check browser privacy settings
3. Verify `.env.local` has `NEXTAUTH_SECRET` set
4. Try different browser
5. Clear cookies and try again

### Issue: Can't upload/edit data

**Means:** Form validation failed.

**Solution:**
1. Check browser console for validation errors
2. Verify input data matches expected format (see Zod schemas in `lib/validation.ts`)
3. Try with sample data first

### Issue: Page keeps refreshing

**Means:** Infinite redirect loop.

**Solution:**
1. Clear cookies: DevTools → Application → Cookies → Delete all
2. Logout and login again
3. Check redirect logic in `/app/projects/[slug]/layout.tsx`

---

## MongoDB Debugging

### Connect to MongoDB and check data

```bash
# Local MongoDB
mongosh mongodb://localhost:27017/ai-assistant

# MongoDB Atlas
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/ai-assistant"
```

### Useful commands

```javascript
// See all databases
show dbs

// Use ai-assistant database
use ai-assistant

// See all collections
show collections

// Count documents
db.users.countDocuments()
db.conversations.countDocuments()

// Find one document
db.projects.findOne()

// Find with filter
db.users.find({ role: "admin" })

// Update document
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)

// Delete collection (careful!)
db.conversations.deleteMany({})

// View collection stats
db.conversations.stats()
```

---

## Reset Everything

If things get really messed up:

```bash
# 1. Stop dev server (Ctrl+C)

# 2. Clear database
mongosh mongodb://localhost:27017/ai-assistant
# Then run:
db.dropDatabase()

# 3. Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# 4. Reseed database
npm run seed

# 5. Start fresh
npm run dev
```

---

## Getting Help

1. **Check logs:**
   - Browser console (DevTools)
   - Terminal where you ran `npm run dev`

2. **Check relevant files:**
   - Authentication issues → `/lib/session.ts`
   - Database issues → `/lib/db.ts`, `/db/models.ts`
   - API issues → `/app/api/*`
   - Services issues → `/services/*`

3. **Review documentation:**
   - Architecture: `ARCHITECTURE.md`
   - Database: `DATABASE_SCHEMA.md`
   - Setup: `QUICKSTART.md`
   - Full README: `README.md`

4. **Verify assumptions:**
   - MongoDB is running
   - `.env.local` is configured
   - Port 3000 is available
   - Node 18+ is installed
