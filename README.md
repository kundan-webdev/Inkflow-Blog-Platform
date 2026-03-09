# Inkflow - Blog Platform

A Medium-inspired blog platform built with React, Express, PostgreSQL, and TypeScript.

## Running Locally

- Create `.env` file : In terminal, type `cp .env.example .env` (verify it is created in root level)
- Update `DATABASE_URL` FROM SUPABASE/NEON/POSTGRESQL and `SESSION_SECRET`- ANY RANDOM KEY in .env
- Install npm dependencies - `npm install` 
- Push schema from database into project - `npm run db:push`
- `npm run dev` starts the dev server on port 5000
- Seed data auto-populates on first run (users: alice, bob, carol, dave - password: password123)

## Architecture

- **Frontend**: React + Vite + TailwindCSS + shadcn/ui
- **Backend**: Express.js with session-based auth
- **Database**: PostgreSQL with Drizzle ORM
- **Routing**: wouter (frontend), Express (backend)

## Key Features

- User registration and authentication (session-based)
- Interest-based onboarding for new users (pick topics on signup)
- Article CRUD (create, read, update, delete)
- Rich article reading experience with serif typography
- Clap/like system (toggle)
- Comments on articles
- Bookmark/reading list
- User profiles with follow system
- Tag-based article categorization
- Search functionality
- Dark/light mode theme toggle
- Trending articles section
- Responsive design with animations
- Enhanced landing page with hero section, stats bar, and AI-generated illustration

## Security

- Password hashing uses SHA-512 with per-user random salt (stored as `salt:hash`)
- Backward-compatible with legacy SHA-256 hashes (auto-verifies old format)
- Timing-safe password comparison to prevent timing attacks
- Session cookies: `httpOnly`, `sameSite: lax`, `secure` in production
- SESSION_SECRET required in production (fails fast if missing)
- Draft articles only visible to their author
- Input validation on all routes (registration, article creation, comments)
- Username: 3-30 chars, alphanumeric + underscores only
- Password: minimum 6 characters
- Article titles: max 200 characters
- Tags: max 5 per article, each tag max 30 chars, must be non-empty strings
- Comments: max 5000 characters

## File Structure

### Frontend
- `client/src/App.tsx` - Main app with routing
- `client/src/lib/auth.tsx` - Auth context/provider
- `client/src/components/theme-provider.tsx` - Theme context
- `client/src/components/navbar.tsx` - Top navigation (logged-in: persistent search bar, Trending/Discover nav, Write, avatar menu; logged-out: Sign in, Get started)
- `client/src/components/article-card.tsx` - Article list card component with border separation
- `client/src/pages/home.tsx` - Homepage with hero, stats, trending, tag filter pills, feed (logged-in only), sidebar
- `client/src/pages/auth.tsx` - Login/register page (redirects to onboarding on signup)
- `client/src/pages/onboarding.tsx` - Interest picker page for new users (3-10 topics)
- `client/src/pages/discover.tsx` - Discover page with topic browsing and all articles
- `client/src/pages/write.tsx` - Article editor (create/edit)
- `client/src/pages/article.tsx` - Article detail page with comments
- `client/src/pages/profile.tsx` - User profile page with editable interests
- `client/src/pages/bookmarks.tsx` - Bookmarked articles
- `client/src/pages/my-articles.tsx` - User's own articles (drafts + published)
- `client/src/pages/tag.tsx` - Articles filtered by tag
- `client/src/pages/search.tsx` - Search results
- `client/src/index.css` - Custom CSS animations, scrollbar-hide utility

### Backend
- `server/index.ts` - Express server setup
- `server/routes.ts` - API routes with session auth and input validation
- `server/storage.ts` - Database storage layer (IStorage interface) with salted password hashing
- `server/db.ts` - Database connection (with dotenv for local dev)
- `server/seed.ts` - Seed data (4 users, 6 articles, tags, comments, claps)

### Shared
- `shared/schema.ts` - Drizzle schema, Zod validators, TypeScript types

### Assets
- `attached_assets/hero-illustration.png` - AI-generated hero illustration for landing page

## Database Schema

- `users` - User accounts (includes `interests` text[] column)
- `articles` - Blog posts
- `tags` - Article tags
- `article_tags` - Many-to-many article-tag relation
- `claps` - Article likes/claps
- `comments` - Article comments
- `bookmarks` - User bookmarks
- `follows` - User follow relationships

## Design

- Primary color: Baby pink (340 hue) with purple and brown accents
- Logo: Minimal text wordmark "Inkflow" with typewriter cursor blink animation
- Typography: DM Sans (sans + headings, bold/dark/uniform), JetBrains Mono (mono)
- Clean, minimal editorial design with gradient accents
- CSS animations: fade-in-up, fade-in, fade-in-scale, fade-in-right
- Dark mode support
- Gradient avatar fallbacks, hover transitions, card lift effects

## API Routes

- `PATCH /api/auth/interests` - Update user interests (requires auth)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `GET /api/articles` - List published articles
- `GET /api/articles/trending` - Trending articles
- `GET /api/articles/:id` - Single article
- `POST /api/articles` - Create article
- `PATCH /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article
- `POST /api/articles/:id/clap` - Toggle clap
- `POST /api/articles/:id/bookmark` - Toggle bookmark
- `GET /api/articles/:id/comments` - List comments
- `POST /api/articles/:id/comments` - Add comment
- `GET /api/bookmarks` - Bookmarked articles
- `GET /api/my-articles` - User's articles
- `GET /api/users/:username` - User profile
- `GET /api/users/:username/articles` - User's published articles
- `POST /api/users/:username/follow` - Toggle follow
- `GET /api/tags` - All tags
- `GET /api/tags/:name/articles` - Articles by tag
- `GET /api/search?q=` - Search articles

## Dependencies

- `cross-env` - Cross-platform env variable setting (Windows compatibility)
- `dotenv` - Loads `.env` file for local development
- `connect-pg-simple` - PostgreSQL session store
- `express-session` - Session management


