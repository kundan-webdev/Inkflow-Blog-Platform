import { db } from "./db";
import { eq, desc, sql, and, ilike, or, inArray } from "drizzle-orm";
import {
  users, articles, tags, articleTags, claps, comments, bookmarks, follows,
  type User, type InsertUser, type Article, type InsertArticle, type ArticleWithAuthor, type Comment,
} from "@shared/schema";
import { randomUUID, createHash, randomBytes, timingSafeEqual } from "crypto";

function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const useSalt = salt || randomBytes(16).toString("hex");
  const hash = createHash("sha512").update(password + useSalt).digest("hex");
  return { hash, salt: useSalt };
}

function verifyPassword(password: string, storedHash: string): boolean {
  if (storedHash.includes(":")) {
    const [salt, hash] = storedHash.split(":");
    const result = hashPassword(password, salt);
    try {
      return timingSafeEqual(Buffer.from(result.hash), Buffer.from(hash));
    } catch {
      return false;
    }
  }
  const legacyHash = createHash("sha256").update(password).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(legacyHash, "hex"), Buffer.from(storedHash, "hex"));
  } catch {
    return false;
  }
}

function createPasswordHash(password: string): string {
  const { hash, salt } = hashPassword(password);
  return `${salt}:${hash}`;
}

export interface IStorage {
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  validatePassword(username: string, password: string): Promise<User | null>;

  createArticle(authorId: string, article: InsertArticle & { tags?: string[] }): Promise<Article>;
  updateArticle(id: string, authorId: string, article: Partial<InsertArticle> & { tags?: string[] }): Promise<Article | null>;
  deleteArticle(id: string, authorId: string): Promise<boolean>;
  getArticleById(id: string, userId?: string): Promise<ArticleWithAuthor | null>;
  getArticles(userId?: string): Promise<ArticleWithAuthor[]>;
  getTrendingArticles(userId?: string): Promise<ArticleWithAuthor[]>;
  getArticlesByAuthor(username: string, userId?: string): Promise<ArticleWithAuthor[]>;
  getMyArticles(userId: string): Promise<ArticleWithAuthor[]>;
  getArticlesByTag(tagName: string, userId?: string): Promise<ArticleWithAuthor[]>;
  searchArticles(query: string, userId?: string): Promise<ArticleWithAuthor[]>;

  toggleClap(articleId: string, userId: string): Promise<void>;
  toggleBookmark(articleId: string, userId: string): Promise<void>;
  getBookmarkedArticles(userId: string): Promise<ArticleWithAuthor[]>;

  addComment(articleId: string, authorId: string, content: string): Promise<Comment>;
  getComments(articleId: string): Promise<(Comment & { author: Pick<User, "id" | "username" | "displayName" | "avatarUrl"> })[]>;

  toggleFollow(followerId: string, followingId: string): Promise<void>;
  getUserProfile(username: string, currentUserId?: string): Promise<any>;

  updateUserInterests(userId: string, interests: string[]): Promise<User | null>;

  getTags(): Promise<{ id: string; name: string }[]>;
}

export class DatabaseStorage implements IStorage {
  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = createPasswordHash(insertUser.password);
    const [user] = await db.insert(users).values({
      ...insertUser,
      password: hashedPassword,
      displayName: insertUser.displayName || insertUser.username,
    }).returning();
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async validatePassword(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    if (!verifyPassword(password, user.password)) return null;
    return user;
  }

  private calculateReadTime(content: string): number {
    const words = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  }

  private async ensureTags(tagNames: string[]): Promise<string[]> {
    const tagIds: string[] = [];
    for (const name of tagNames) {
      const normalizedName = name.toLowerCase().trim();
      if (!normalizedName) continue;
      const existing = await db.select().from(tags).where(eq(tags.name, normalizedName));
      if (existing.length > 0) {
        tagIds.push(existing[0].id);
      } else {
        const [newTag] = await db.insert(tags).values({ name: normalizedName }).returning();
        tagIds.push(newTag.id);
      }
    }
    return tagIds;
  }

  async createArticle(authorId: string, articleData: InsertArticle & { tags?: string[] }): Promise<Article> {
    const { tags: tagNames, ...data } = articleData;
    const readTime = this.calculateReadTime(data.content);
    const [article] = await db.insert(articles).values({
      ...data,
      authorId,
      readTime,
    }).returning();

    if (tagNames && tagNames.length > 0) {
      const tagIds = await this.ensureTags(tagNames);
      for (const tagId of tagIds) {
        await db.insert(articleTags).values({ articleId: article.id, tagId }).onConflictDoNothing();
      }
    }

    return article;
  }

  async updateArticle(id: string, authorId: string, articleData: Partial<InsertArticle> & { tags?: string[] }): Promise<Article | null> {
    const { tags: tagNames, ...data } = articleData;
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.content) {
      updateData.readTime = this.calculateReadTime(data.content);
    }

    const [article] = await db.update(articles)
      .set(updateData)
      .where(and(eq(articles.id, id), eq(articles.authorId, authorId)))
      .returning();

    if (!article) return null;

    if (tagNames !== undefined) {
      await db.delete(articleTags).where(eq(articleTags.articleId, id));
      if (tagNames.length > 0) {
        const tagIds = await this.ensureTags(tagNames);
        for (const tagId of tagIds) {
          await db.insert(articleTags).values({ articleId: id, tagId }).onConflictDoNothing();
        }
      }
    }

    return article;
  }

  async deleteArticle(id: string, authorId: string): Promise<boolean> {
    const result = await db.delete(articles)
      .where(and(eq(articles.id, id), eq(articles.authorId, authorId)))
      .returning();
    return result.length > 0;
  }

  private async enrichArticles(rawArticles: Article[], userId?: string): Promise<ArticleWithAuthor[]> {
    if (rawArticles.length === 0) return [];

    const result: ArticleWithAuthor[] = [];

    for (const article of rawArticles) {
      const [author] = await db.select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
      }).from(users).where(eq(users.id, article.authorId));

      const articleTagRows = await db.select({ name: tags.name })
        .from(articleTags)
        .innerJoin(tags, eq(articleTags.tagId, tags.id))
        .where(eq(articleTags.articleId, article.id));

      const [clapResult] = await db.select({
        total: sql<number>`COALESCE(SUM(${claps.count}), 0)`,
      }).from(claps).where(eq(claps.articleId, article.id));

      const [commentResult] = await db.select({
        count: sql<number>`COUNT(*)`,
      }).from(comments).where(eq(comments.articleId, article.id));

      let hasClapped = false;
      let hasBookmarked = false;

      if (userId) {
        const [userClap] = await db.select().from(claps)
          .where(and(eq(claps.articleId, article.id), eq(claps.userId, userId)));
        hasClapped = !!userClap;

        const [userBookmark] = await db.select().from(bookmarks)
          .where(and(eq(bookmarks.articleId, article.id), eq(bookmarks.userId, userId)));
        hasBookmarked = !!userBookmark;
      }

      result.push({
        ...article,
        author: author || { id: "", username: "unknown", displayName: "Unknown", avatarUrl: "" },
        tags: articleTagRows.map((t) => t.name),
        clapCount: Number(clapResult?.total || 0),
        commentCount: Number(commentResult?.count || 0),
        hasClapped,
        hasBookmarked,
      });
    }

    return result;
  }

  async getArticleById(id: string, userId?: string): Promise<ArticleWithAuthor | null> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    if (!article) return null;
    if (!article.published && article.authorId !== userId) return null;
    const enriched = await this.enrichArticles([article], userId);
    return enriched[0] || null;
  }

  async getArticles(userId?: string): Promise<ArticleWithAuthor[]> {
    const rawArticles = await db.select().from(articles)
      .where(eq(articles.published, true))
      .orderBy(desc(articles.createdAt))
      .limit(50);
    return this.enrichArticles(rawArticles, userId);
  }

  async getTrendingArticles(userId?: string): Promise<ArticleWithAuthor[]> {
    const rawArticles = await db.select().from(articles)
      .where(eq(articles.published, true))
      .orderBy(desc(articles.createdAt))
      .limit(6);
    return this.enrichArticles(rawArticles, userId);
  }

  async getArticlesByAuthor(username: string, userId?: string): Promise<ArticleWithAuthor[]> {
    const [author] = await db.select().from(users).where(eq(users.username, username));
    if (!author) return [];
    const rawArticles = await db.select().from(articles)
      .where(and(eq(articles.authorId, author.id), eq(articles.published, true)))
      .orderBy(desc(articles.createdAt));
    return this.enrichArticles(rawArticles, userId);
  }

  async getMyArticles(userId: string): Promise<ArticleWithAuthor[]> {
    const rawArticles = await db.select().from(articles)
      .where(eq(articles.authorId, userId))
      .orderBy(desc(articles.createdAt));
    return this.enrichArticles(rawArticles, userId);
  }

  async getArticlesByTag(tagName: string, userId?: string): Promise<ArticleWithAuthor[]> {
    const [tag] = await db.select().from(tags).where(eq(tags.name, tagName.toLowerCase()));
    if (!tag) return [];
    const articleIds = await db.select({ articleId: articleTags.articleId })
      .from(articleTags)
      .where(eq(articleTags.tagId, tag.id));
    if (articleIds.length === 0) return [];
    const rawArticles = await db.select().from(articles)
      .where(and(
        inArray(articles.id, articleIds.map((a) => a.articleId)),
        eq(articles.published, true)
      ))
      .orderBy(desc(articles.createdAt));
    return this.enrichArticles(rawArticles, userId);
  }

  async searchArticles(query: string, userId?: string): Promise<ArticleWithAuthor[]> {
    const searchTerm = `%${query}%`;
    const rawArticles = await db.select().from(articles)
      .where(and(
        eq(articles.published, true),
        or(
          ilike(articles.title, searchTerm),
          ilike(articles.subtitle, searchTerm),
          ilike(articles.content, searchTerm),
        )
      ))
      .orderBy(desc(articles.createdAt))
      .limit(20);
    return this.enrichArticles(rawArticles, userId);
  }

  async toggleClap(articleId: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(claps)
      .where(and(eq(claps.articleId, articleId), eq(claps.userId, userId)));
    if (existing) {
      await db.delete(claps).where(eq(claps.id, existing.id));
    } else {
      await db.insert(claps).values({ articleId, userId, count: 1 });
    }
  }

  async toggleBookmark(articleId: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(bookmarks)
      .where(and(eq(bookmarks.articleId, articleId), eq(bookmarks.userId, userId)));
    if (existing) {
      await db.delete(bookmarks)
        .where(and(eq(bookmarks.articleId, articleId), eq(bookmarks.userId, userId)));
    } else {
      await db.insert(bookmarks).values({ articleId, userId });
    }
  }

  async getBookmarkedArticles(userId: string): Promise<ArticleWithAuthor[]> {
    const bookmarkedIds = await db.select({ articleId: bookmarks.articleId })
      .from(bookmarks)
      .where(eq(bookmarks.userId, userId))
      .orderBy(desc(bookmarks.createdAt));
    if (bookmarkedIds.length === 0) return [];
    const rawArticles = await db.select().from(articles)
      .where(inArray(articles.id, bookmarkedIds.map((b) => b.articleId)));
    return this.enrichArticles(rawArticles, userId);
  }

  async addComment(articleId: string, authorId: string, content: string): Promise<Comment> {
    const [comment] = await db.insert(comments).values({
      articleId,
      authorId,
      content,
    }).returning();
    return comment;
  }

  async getComments(articleId: string): Promise<(Comment & { author: Pick<User, "id" | "username" | "displayName" | "avatarUrl"> })[]> {
    const rawComments = await db.select().from(comments)
      .where(eq(comments.articleId, articleId))
      .orderBy(desc(comments.createdAt));

    const result = [];
    for (const comment of rawComments) {
      const [author] = await db.select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
      }).from(users).where(eq(users.id, comment.authorId));
      result.push({
        ...comment,
        author: author || { id: "", username: "unknown", displayName: "Unknown", avatarUrl: "" },
      });
    }
    return result;
  }

  async toggleFollow(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) return;
    const [existing] = await db.select().from(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
    if (existing) {
      await db.delete(follows)
        .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
    } else {
      await db.insert(follows).values({ followerId, followingId });
    }
  }

  async getUserProfile(username: string, currentUserId?: string): Promise<any> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    if (!user) return null;

    const [articleCount] = await db.select({ count: sql<number>`COUNT(*)` })
      .from(articles)
      .where(and(eq(articles.authorId, user.id), eq(articles.published, true)));

    const [followerCount] = await db.select({ count: sql<number>`COUNT(*)` })
      .from(follows)
      .where(eq(follows.followingId, user.id));

    const [followingCount] = await db.select({ count: sql<number>`COUNT(*)` })
      .from(follows)
      .where(eq(follows.followerId, user.id));

    let isFollowing = false;
    if (currentUserId) {
      const [follow] = await db.select().from(follows)
        .where(and(eq(follows.followerId, currentUserId), eq(follows.followingId, user.id)));
      isFollowing = !!follow;
    }

    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      interests: user.interests || [],
      articleCount: Number(articleCount?.count || 0),
      followerCount: Number(followerCount?.count || 0),
      followingCount: Number(followingCount?.count || 0),
      isFollowing,
    };
  }

  async updateUserInterests(userId: string, interests: string[]): Promise<User | null> {
    const [user] = await db.update(users)
      .set({ interests })
      .where(eq(users.id, userId))
      .returning();
    return user || null;
  }

  async getTags(): Promise<{ id: string; name: string }[]> {
    return db.select().from(tags).orderBy(tags.name);
  }
}

export const storage = new DatabaseStorage();
