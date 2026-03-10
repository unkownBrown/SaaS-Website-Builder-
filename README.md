# ⚡ Forge — AI Website Builder

A full-stack SaaS app that lets users describe a website in plain language and instantly generates production-ready HTML + Tailwind CSS code, with live preview, code editor, download, and project saving.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| AI Model | Llama 3.3 70B via Groq API (free, fast) |
| Auth | Supabase Auth (email/password) |
| Language | TypeScript |

## Features

- 🤖 **AI Generation** — Llama 3.3 70B generates complete, styled HTML websites
- 👁 **Live Preview** — See the website render instantly in an iframe
- ✏️ **Code Editor** — Editable source code with syntax highlighting
- ⊟ **Split View** — Preview + code side by side
- 💾 **Save Projects** — Authenticated users save to Supabase with RLS
- 📥 **Download** — One-click HTML file download
- 🔒 **Auth** — Sign up / sign in with Supabase Auth
- 📊 **Dashboard** — Manage all your projects with mini previews

## Project Structure

```
ai-website-builder/
├── app/
│   ├── api/
│   │   ├── generate/route.ts     # POST: AI website generation
│   │   └── projects/route.ts     # CRUD: Save/load projects
│   ├── auth/page.tsx             # Sign in / sign up
│   ├── builder/page.tsx          # Main builder app
│   ├── dashboard/page.tsx        # Project management
│   ├── globals.css               # Global styles + design tokens
│   └── layout.tsx                # Root layout
├── components/
│   └── builder/
│       ├── BuilderNav.tsx        # Top navigation bar
│       ├── CodePane.tsx          # Code editor pane
│       ├── PreviewPane.tsx       # iframe preview pane
│       ├── PromptBar.tsx         # Bottom prompt input
│       └── StatusBar.tsx         # Generation status indicator
├── lib/
│   ├── ai.ts                     # Groq API integration
│   ├── utils.ts                  # Utility functions
│   └── supabase/
│       ├── client.ts             # Browser Supabase client
│       ├── server.ts             # Server Supabase client
│       └── schema.sql            # Database schema
├── types/index.ts                # TypeScript types
├── .env.local.example            # Environment variables template
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo>
cd ai-website-builder
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `lib/supabase/schema.sql`
3. Copy your project URL and anon key from **Project Settings > API**

### 3. Get a Groq API Key (free)

1. Sign up at [console.groq.com](https://console.groq.com)
2. Create an API key (free tier is very generous)
3. The app uses `llama-3.3-70b-versatile` by default

### 4. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile
```

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Alternative AI Models

You can change the model in `.env.local`:

| Model | Speed | Quality | Notes |
|-------|-------|---------|-------|
| `llama-3.3-70b-versatile` | Fast | ⭐⭐⭐⭐⭐ | Recommended |
| `mixtral-8x7b-32768` | Fast | ⭐⭐⭐⭐ | Good for long context |
| `gemma2-9b-it` | Very fast | ⭐⭐⭐ | Lightweight |

All are open-source models, all free on Groq.

## Deployment

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add all environment variables in the Vercel dashboard.

### Deploy to Netlify / Railway

Set environment variables and run `npm run build && npm start`.

## Database Schema

The app uses a single `projects` table with Row Level Security:

```sql
projects (
  id         uuid PRIMARY KEY,
  user_id    uuid REFERENCES auth.users,
  name       text,
  prompt     text,
  html_content text,
  created_at timestamptz,
  updated_at timestamptz
)
```

RLS policies ensure users can only read/write their own projects.

## Extending the App

- **Streaming responses** — Use `ReadableStream` in the API route for real-time generation
- **Version history** — Add a `versions` table to track iterations
- **Templates** — Pre-built prompt templates for common website types
- **Custom domains** — Deploy generated sites to subdomains
- **Team sharing** — Share projects with collaborators
