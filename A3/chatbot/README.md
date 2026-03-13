# AI Chatbot with Next.js

A modern, full-stack chatbot application built with Next.js App Router, PostgreSQL, and OpenAI API.

## Features

- 🤖 **AI-Powered Conversations**: Integration with Gemini and ChatGPT (OpenAI)
- 🔐 **Authentication System**: Secure login and signup with JWT
- 💾 **Chat History**: All conversations are saved in PostgreSQL
- 🎨 **Modern UI**: Sleek design with Tailwind CSS and dark mode support
- 📱 **Responsive**: Works seamlessly on desktop and mobile devices
- 🔒 **Secure**: Password hashing with bcrypt and token-based authentication

## Tech Stack

- **Frontend**: Next.js 16 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **AI**: Google Gemini API and OpenAI Chat Completions API
- **Authentication**: JWT with bcryptjs

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- Gemini API key (get one at https://makersuite.google.com/app/apikey)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   - Edit `.env.local` file with your actual credentials:
     ```
     DATABASE_URL=postgresql://username:password@localhost:5432/chatbot_db
     GEMINI_API_KEY=your-actual-gemini-api-key
   OPENAI_API_KEY=your-actual-openai-api-key
     JWT_SECRET=your-secure-random-jwt-secret
     ```

## Model Switching

- Use the model selector in the chat header to switch between Gemini and ChatGPT models.
- Supported Gemini models: `gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-2.0-flash-lite`
- Supported ChatGPT models: `gpt-4o-mini`, `gpt-4o`, `gpt-4.1-mini`

## Development Request Logging

- In development mode (`NODE_ENV=development`), every outbound model request is appended to `logs/api-requests.log`.
- Each log entry includes timestamp, provider, model, session id, and the exact payload sent to the model API (chat history + current user message).

3. **Set up the database**:
   - Create a PostgreSQL database named `chatbot_db`
   - The tables will be created automatically when you first run the app

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
chatbot/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts      # Login endpoint
│   │   │   └── signup/route.ts     # Signup endpoint
│   │   ├── chat/route.ts           # Chat with AI endpoint
│   │   └── sessions/
│   │       ├── route.ts            # Get/create chat sessions
│   │       └── [id]/route.ts       # Session details/delete
│   ├── chat/page.tsx               # Main chat interface
│   ├── login/page.tsx              # Login page
│   ├── signup/page.tsx             # Signup page
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Global styles
├── lib/
│   ├── db.ts                       # Database connection & schema
│   └── auth.ts                     # Authentication utilities
└── .env.local                      # Environment variables
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Chat Sessions Table
```sql
CREATE TABLE chat_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Usage

1. **Sign Up**: Create a new account on the signup page
2. **Login**: Sign in with your credentials
3. **Start Chatting**: Click "New Chat" to start a conversation
4. **View History**: Access previous conversations from the sidebar
5. **Delete Chats**: Remove unwanted conversations by clicking the × button

## Security Notes

- Passwords are hashed using bcrypt before storage
- JWT tokens expire after 7 days
- All API routes are protected with authentication middleware
- Environment variables are used for sensitive data
- SQL injection is prevented using parameterized queries

## License

MIT

