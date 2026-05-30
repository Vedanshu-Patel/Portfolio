# Vedanshu Patel — Portfolio

Personal career website. Built with Next.js 14 (App Router), TypeScript, and Tailwind CSS.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + glassmorphism utilities
- **Animations:** Framer Motion
- **Background:** tsparticles
- **3D tilt:** react-parallax-tilt
- **Audio:** use-sound (subtle UI sounds, off by default)
- **Icons:** lucide-react

## Folder structure

```
app/             # Next.js App Router pages and layout
components/      # Reusable UI (hero, nav, project card, etc.)
lib/
  data.ts        # Typed resume content (single source of truth)
  utils.ts       # cn() helper for className composition
public/          # Static assets — resume.pdf, images, og-image
```

## Scripts

```bash
npm run dev       # start dev server on http://localhost:3000
npm run build     # production build
npm run start     # serve production build
npm run lint      # next lint
npm run format    # prettier write
```

## Chatbot

The site ships with an AI twin chatbot ([components/ChatWidget.tsx](components/ChatWidget.tsx)) — a floating action button in the bottom-right that opens a conversational panel. The bot's persona, knowledge base, and guardrails are built from [lib/data.ts](lib/data.ts) by [lib/persona.ts](lib/persona.ts) and served by [app/api/chat/route.ts](app/api/chat/route.ts) using Gemini 2.5 Flash.

### Required env vars

Create `.env.local` (gitignored) with:

```
# Gemini — https://aistudio.google.com/app/apikey
GEMINI_API_KEY=

# Upstash Redis — https://upstash.com → REST API tab
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# EmailJS — https://emailjs.com (public key is safe in the browser by design)
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=
NEXT_PUBLIC_EMAILJS_SERVICE_ID=
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=

# Admin dashboard (single-password gate over /admin)
ADMIN_PASSWORD=
ADMIN_COOKIE_SECRET=   # 32+ random bytes, base64 — generate via
                       # [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

`.env.local.example` is committed as a template.

Next reads env vars at startup, so **restart `npm run dev` after editing**.

### Reset the conversation

The chat panel header has a **trash-can button** that wipes the local conversation. Or open DevTools → Application → Local Storage and delete the `vp_chat_v1` key. Conversations auto-expire after 30 days of inactivity.

### Admin dashboard

Visit `/admin` — middleware will redirect you to `/admin/login`. Sign in with `ADMIN_PASSWORD`. The dashboard shows:

- **Top stats** — unique sessions (30d), total events, total leads.
- **Intent breakdown** — what visitors ask most.
- **Daily activity** — 14-day sparkline.
- **Knowledge gaps** — low-confidence questions. *Each entry is a concrete TODO for `lib/data.ts`.*
- **Recent leads** — captured emails with messages + session context.

The dashboard is gated by a signed HTTP-only cookie ([lib/admin-auth.ts](lib/admin-auth.ts)). Rotating `ADMIN_PASSWORD` invalidates all existing sessions automatically.

### Routes

| Path | Purpose |
| --- | --- |
| `POST /api/chat` | LLM call, rate-limited per session (20/hr) |
| `POST /api/lead` | Logs a lead to Upstash |
| `POST /api/admin/login` | Sets the admin cookie |
| `POST /api/admin/logout` | Clears the admin cookie |
| `GET /api/admin/stats` | Aggregated dashboard data |
| `/admin` | Dashboard (protected) |
| `/admin/login` | Login form |

### Redis keys

| Key | Type | Use |
| --- | --- | --- |
| `events:list` | LIST | Every chat call (last 5000 retained) |
| `intent:counts` | HASH | Running tally per intent |
| `gaps:list` | LIST | Questions where the bot's confidence was low (last 500) |
| `leads:list` | LIST | Submitted leads with conversation context (last 1000) |
| `rate:<sessionId>` | INT | Per-session message counter, 1h TTL |
