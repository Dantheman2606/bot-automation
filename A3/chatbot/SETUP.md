# Setup Instructions

## Quick Setup Guide

Follow these steps to get the chatbot running:

### 1. Install Dependencies

First, navigate to the chatbot directory and install all required packages:

```bash
cd A3/chatbot
npm install
```

### 2. Set Up PostgreSQL Database

You need a running PostgreSQL instance. If you don't have one:

**Option A: Using Docker (Recommended)**
```bash
docker run --name chatbot-db -e POSTGRES_PASSWORD=yourpassword -e POSTGRES_DB=chatbot_db -p 5432:5432 -d postgres:latest
```

**Option B: Install PostgreSQL locally**
- Download from https://www.postgresql.org/download/
- Install and create a database named `chatbot_db`

### 3. Configure Environment Variables

Edit the `.env.local` file in the chatbot directory with your actual values:

```env
# Database Configuration (update with your credentials)
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/chatbot_db

# Gemini API Key (get from https://makersuite.google.com/app/apikey)
GEMINI_API_KEY=your-actual-api-key-here

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Next Auth Configuration
NEXTAUTH_SECRET=your-nextauth-secret-change-in-production
NEXTAUTH_URL=http://localhost:3000
```

**To generate secure secrets**, run:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Initialize Database Tables

The database tables will be created automatically when the app first connects. Alternatively, you can run:

```bash
npx tsx scripts/setup-db.ts
```

Or manually execute the SQL from `lib/db.ts` in your PostgreSQL client.

### 5. Run the Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3000

### 6. Test the Application

1. Open http://localhost:3000 in your browser
2. Click "Get Started" to create an account
3. Fill in your details and sign up
4. Start chatting with the AI!

## Troubleshooting

### Database Connection Issues

**Error: "password authentication failed"**
- Check your DATABASE_URL has the correct username and password
- Verify PostgreSQL is running: `pg_isready` (on systems with PostgreSQL client tools)

**Error: "database does not exist"**
- Create the database: 
  ```sql
  CREATE DATABASE chatbot_db;
  ```

### Gemini API Issues

**Error: "Invalid API key"**
- Verify your API key is correct
- Get API key from: https://makersuite.google.com/app/apikey
- Ensure API key is enabled for Gemini API

**Error: "Rate limit exceeded"**
- You've exceeded the free tier limits
- Wait or check your quota at https://makersuite.google.com/

### Port Already in Use

If port 3000 is already in use:
```bash
npm run dev -- -p 3001
```

Then access at http://localhost:3001

## Database Management

### View Tables
```sql
\dt
```

### View Data
```sql
SELECT * FROM users;
SELECT * FROM chat_sessions;
SELECT * FROM messages;
```

### Reset Database (CAUTION: Deletes all data)
```sql
DROP TABLE messages CASCADE;
DROP TABLE chat_sessions CASCADE;
DROP TABLE users CASCADE;
```

Then restart the app to recreate tables.

## Development Tips

### Enable Hot Reload for API Routes
API routes don't hot reload by default. Restart the dev server after making changes to API routes.

### View Logs
- Server logs appear in your terminal
- Client logs appear in browser console (F12)

### Test API Endpoints
Use tools like:
- Postman
- curl
- Thunder Client (VS Code extension)

Example curl request:
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
```

## Production Deployment

Before deploying to production:

1. **Set secure environment variables**
2. **Enable database SSL**
3. **Set up database backups**
4. **Configure CORS if needed**
5. **Enable rate limiting**
6. **Set up monitoring**

Recommended platforms:
- Vercel (easiest for Next.js)
- Railway (includes PostgreSQL)
- Render
- AWS/Azure/GCP

## Need Help?

Check the main README.md for more detailed information about the project structure and API endpoints.
