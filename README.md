<div align="center">

# 🖊️ Inkflow Blog Platform

**A production-grade, decoupled full-stack blog platform — built, broken, and fixed in the real world.**

[![Live Demo](https://img.shields.io/badge/Live-Demo-FC5810?style=for-the-badge&logo=vercel&logoColor=white)](https://inkflow-eight.vercel.app)
[![Frontend](https://img.shields.io/badge/Frontend-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://render.com)
[![Database](https://img.shields.io/badge/Database-Neon_PostgreSQL-00E699?style=for-the-badge&logo=postgresql&logoColor=black)](https://neon.tech)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](./LICENSE)

> Inkflow is a fully decoupled blog platform with separate frontend and backend deployments, real-world CORS handling, and secure cross-domain authentication via cookies.

</div>

---

## 📸 Screenshots

> _Coming soon — dashboard, article page, and auth flow_

---

## 🏗️ Architecture

```
┌─────────────────────────────────┐
│       User's Browser            │
└──────────────┬──────────────────┘
               │  HTTPS
               ▼
┌─────────────────────────────────┐
│   Frontend — Vercel             │
│   React + Vite + TanStack Query │
└──────────────┬──────────────────┘
               │  REST API (JSON)
               ▼
┌─────────────────────────────────┐
│   Backend API — Render          │
│   Node.js + Express + TypeScript│
└──────────────┬──────────────────┘
               │  SQL
               ▼
┌─────────────────────────────────┐
│   Neon PostgreSQL Database      │
└─────────────────────────────────┘
```

- Frontend and Backend are **independently deployed**
- Communication via **REST API**
- Auth via **secure, cross-domain HTTP-only cookies**

---

## ⚡ Tech Stack

| Layer      | Technology                                              |
|------------|---------------------------------------------------------|
| Frontend   | React, TypeScript, Vite, Tailwind CSS, TanStack Query  |
| Backend    | Node.js, Express.js, TypeScript                        |
| Database   | Neon PostgreSQL                                        |
| Auth       | Session-based with secure cookies                      |
| Deployment | Vercel (Frontend), Render (Backend)                    |

---

## ✅ Key Features

- 🔐 **User Authentication** — Register, Login, Session Management
- 📝 **Blog Article Creation** — Create and fetch articles via REST API
- 🍪 **Secure Cross-Domain Cookies** — `sameSite: none` + `secure: true`
- 🌐 **Fully Decoupled Architecture** — Independent frontend & backend deploys
- 🛡️ **CORS Configured** — Whitelist-based origin policy
- 🚀 **Production Deployed** — Live on Vercel + Render

---

## 🔧 Deployment Issues & Real-World Fixes

This project encountered — and solved — four real production issues. Documented below for learning reference.

---

### 1. 🔴 Vite Build Error on Vercel

**Error:**
```
Could not resolve entry module "index.html"
```

**Cause:** `index.html` was inside `/client`, but Vite expects it at the project root during production builds.

**Fix:**
- Move `index.html` to the root directory
- Update the script path:
  ```html
  <script type="module" src="/client/src/main.tsx"></script>
  ```
- Update SSR config in `server/vite.ts` so local dev still works

---

### 2. 🔴 API 404 — Double Slash in URL

**Error:**
```
GET https://...onrender.com//api/articles 404
```

**Cause:** `VITE_API_URL` had a trailing slash → combined with `/api/...` → double slash.

**Fix:** Strip trailing slash in `client/src/lib/queryClient.ts`:
```ts
const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "")
```

---

### 3. 🔴 CORS Block — Cross-Domain Request Rejected

**Error:**
```
Blocked by CORS policy: No 'Access-Control-Allow-Origin' header
```

**Cause:** Frontend (`vercel.app`) and Backend (`render.com`) are on different domains — browser blocks by default.

**Fix:** In `server/index.ts`:
```ts
app.use(cors({
  origin: "https://inkflow-eight.vercel.app",
  credentials: true
}))
```

---

### 4. 🔴 Auth Cookie Blocked — 401 Unauthorized

**Error:**
```
401 Unauthorized (login not persisting)
```

**Cause:** Browser silently blocks cookies on cross-domain requests unless explicitly configured.

**Fix:** In `server/routes.ts`:
```ts
app.set("trust proxy", 1);

session({
  cookie: {
    secure: true,
    sameSite: "none"
  }
})
```

---

## 🚀 Running Locally

### 1. Clone the Repository

```bash
git clone https://github.com/kundan-webdev/Inkflow-Blog-Platform.git
cd Inkflow-Blog-Platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root:

```env
DATABASE_URL=your_neon_postgres_url
VITE_API_URL=http://localhost:5000
SESSION_SECRET=your_secret_key
```

### 4. Start Development Server

```bash
npm run dev
```

Frontend and backend will start concurrently. Open `http://localhost:5173`.

---

## 🗺️ Roadmap

- [ ] Rich text editor (TipTap / Quill)
- [ ] Comments system
- [ ] Article reactions (like / bookmark)
- [ ] User profiles with avatar upload
- [ ] Markdown support
- [ ] Image uploads via Cloudinary
- [ ] Search and tag filtering

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create your branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push and open a PR: `git push origin feature/your-feature`

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

<div align="center">

⭐ If this project helped you understand real-world deployment, leave a star!

</div>