import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const PgSession = connectPgSimple(session);
  app.use(
    session({
      store: new PgSession({
        pool: pool,
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || (process.env.NODE_ENV === "production" ? (() => { throw new Error("SESSION_SECRET is required in production"); })() : "dev-secret-change-me"),
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      },
    })
  );

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, displayName } = req.body;
      if (!username?.trim() || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      if (username.length < 3 || username.length > 30) {
        return res.status(400).json({ message: "Username must be between 3 and 30 characters" });
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.status(400).json({ message: "Username can only contain letters, numbers, and underscores" });
      }
      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ message: "Username already taken" });
      }
      const user = await storage.createUser({ username: username.trim(), password, displayName: displayName?.trim() || username.trim() });
      req.session.userId = user.id;
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      const user = await storage.validatePassword(username, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.session.userId = user.id;
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUserById(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  });

  app.get("/api/articles", async (req, res) => {
    const articles = await storage.getArticles(req.session.userId);
    res.json(articles);
  });

  app.get("/api/articles/trending", async (req, res) => {
    const articles = await storage.getTrendingArticles(req.session.userId);
    res.json(articles);
  });

  app.get("/api/articles/:id", async (req, res) => {
    const article = await storage.getArticleById(req.params.id, req.session.userId);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.json(article);
  });

  app.post("/api/articles", requireAuth, async (req, res) => {
    try {
      const { title, content, subtitle, coverImage, published, tags } = req.body;
      if (!title?.trim() || !content?.trim()) {
        return res.status(400).json({ message: "Title and content are required" });
      }
      if (title.length > 200) {
        return res.status(400).json({ message: "Title must be under 200 characters" });
      }
      if (tags) {
        if (!Array.isArray(tags) || tags.length > 5) {
          return res.status(400).json({ message: "Maximum 5 tags allowed" });
        }
        if (!tags.every((t: any) => typeof t === "string" && t.trim().length > 0 && t.trim().length <= 30)) {
          return res.status(400).json({ message: "Each tag must be a non-empty string under 30 characters" });
        }
      }
      const article = await storage.createArticle(req.session.userId!, {
        title: title.trim(),
        content,
        subtitle: subtitle?.trim() || "",
        coverImage: coverImage || "",
        published: published ?? false,
        tags: tags || [],
      });
      res.json(article);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.patch("/api/articles/:id", requireAuth, async (req, res) => {
    try {
      const { title, content, subtitle, coverImage, published, tags } = req.body;
      if (title !== undefined && !title?.trim()) {
        return res.status(400).json({ message: "Title cannot be empty" });
      }
      if (tags) {
        if (!Array.isArray(tags) || tags.length > 5) {
          return res.status(400).json({ message: "Maximum 5 tags allowed" });
        }
        if (!tags.every((t: any) => typeof t === "string" && t.trim().length > 0 && t.trim().length <= 30)) {
          return res.status(400).json({ message: "Each tag must be a non-empty string under 30 characters" });
        }
      }
      const article = await storage.updateArticle(String(req.params.id), req.session.userId!, {
        ...(title !== undefined && { title: title.trim() }),
        ...(content !== undefined && { content }),
        ...(subtitle !== undefined && { subtitle: subtitle?.trim() || "" }),
        ...(coverImage !== undefined && { coverImage }),
        ...(published !== undefined && { published }),
        ...(tags !== undefined && { tags }),
      });
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(article);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete("/api/articles/:id", requireAuth, async (req, res) => {
    const deleted = await storage.deleteArticle(String(req.params.id), req.session.userId!);
    if (!deleted) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.json({ message: "Deleted" });
  });

  app.post("/api/articles/:id/clap", requireAuth, async (req, res) => {
    await storage.toggleClap(String(req.params.id), req.session.userId!);
    res.json({ message: "Toggled" });
  });

  app.post("/api/articles/:id/bookmark", requireAuth, async (req, res) => {
    await storage.toggleBookmark(String(req.params.id), req.session.userId!);
    res.json({ message: "Toggled" });
  });

  app.get("/api/articles/:id/comments", async (req, res) => {
    const commentsList = await storage.getComments(req.params.id);
    res.json(commentsList);
  });

  app.post("/api/articles/:id/comments", requireAuth, async (req, res) => {
    try {
      const { content } = req.body;
      if (!content?.trim()) {
        return res.status(400).json({ message: "Content is required" });
      }
      if (content.length > 5000) {
        return res.status(400).json({ message: "Comment too long" });
      }
      const comment = await storage.addComment(String(req.params.id), req.session.userId!, content.trim());
      res.json(comment);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/bookmarks", requireAuth, async (req, res) => {
    const articles = await storage.getBookmarkedArticles(req.session.userId!);
    res.json(articles);
  });

  app.get("/api/my-articles", requireAuth, async (req, res) => {
    const articles = await storage.getMyArticles(req.session.userId!);
    res.json(articles);
  });

  app.get("/api/users/:username", async (req, res) => {
    const profile = await storage.getUserProfile(req.params.username, req.session.userId);
    if (!profile) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(profile);
  });

  app.get("/api/users/:username/articles", async (req, res) => {
    const articles = await storage.getArticlesByAuthor(req.params.username, req.session.userId);
    res.json(articles);
  });

  app.post("/api/users/:username/follow", requireAuth, async (req, res) => {
    const user = await storage.getUserByUsername(String(req.params.username));
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await storage.toggleFollow(req.session.userId!, user.id);
    res.json({ message: "Toggled" });
  });

  app.get("/api/tags", async (req, res) => {
    const tagsList = await storage.getTags();
    res.json(tagsList);
  });

  app.get("/api/tags/:name/articles", async (req, res) => {
    const articles = await storage.getArticlesByTag(req.params.name, req.session.userId);
    res.json(articles);
  });

  app.patch("/api/auth/interests", requireAuth, async (req, res) => {
    try {
      const { interests } = req.body;
      if (!Array.isArray(interests) || interests.length > 10) {
        return res.status(400).json({ message: "Interests must be an array of up to 10 items" });
      }
      if (!interests.every((i: any) => typeof i === "string" && i.trim().length > 0 && i.trim().length <= 50)) {
        return res.status(400).json({ message: "Each interest must be a non-empty string under 50 characters" });
      }
      const normalizedInterests = interests.map((i: string) => i.trim().toLowerCase());
      const user = await storage.updateUserInterests(req.session.userId!, normalizedInterests);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/search", async (req, res) => {
    const q = req.query.q as string;
    if (!q) {
      return res.json([]);
    }
    const articles = await storage.searchArticles(q, req.session.userId);
    res.json(articles);
  });

  return httpServer;
}
