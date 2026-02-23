# Quick Start Guide 🚀

Get your AI Chatbot running in 5 minutes!

## Prerequisites Checklist
- [ ] Node.js 18+ installed
- [ ] PostgreSQL running
- [ ] Gemini API key

## Step-by-Step Setup

### 1️⃣ Install Dependencies (2 minutes)
```bash
cd A3/chatbot
npm install
```

### 2️⃣ Set Up Database (1 minute)

**Quick Docker Setup:**
```bash
docker run --name chatbot-db -e POSTGRES_PASSWORD=mypassword -e POSTGRES_DB=chatbot_db -p 5432:5432 -d postgres:latest
```

**OR use existing PostgreSQL and create database:**
```sql
CREATE DATABASE chatbot_db;
```

### 3️⃣ Configure Environment (1 minute)

Edit `.env.local` file:
```env
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/chatbot_db
GEMINI_API_KEY=YOUR-ACTUAL-KEY-HERE
JWT_SECRET=run-node-to-generate-this
```

**Generate JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4️⃣ Run the App (30 seconds)
```bash
npm run dev
```

### 5️⃣ Open Browser (10 seconds)
Visit: **http://localhost:3000**

---

## First Time Usage

1. Click **"Get Started"**
2. Fill in signup form
3. Start chatting!

---

## Common Issues

### "Database connection failed"
- Check PostgreSQL is running
- Verify DATABASE_URL is correct

### "Gemini API error"
- Get key from: https://makersuite.google.com/app/apikey
- Ensure API is enabled

### "Port 3000 already in use"
```bash
npm run dev -- -p 3001
```
Then visit: http://localhost:3001

---

## That's It! 🎉

You now have a working AI chatbot with:
- ✅ User authentication
- ✅ Chat history
- ✅ OpenAI integration
- ✅ Beautiful UI

Need more details? Check:
- `SETUP.md` - Detailed setup instructions
- `README.md` - Full project documentation
- `PROJECT_SUMMARY.md` - What was built

**Happy Chatting!** 💬
