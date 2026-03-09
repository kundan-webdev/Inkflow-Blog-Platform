import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  bio: text("bio").default(""),
  avatarUrl: text("avatar_url").default(""),
  interests: text("interests").array().default(sql`'{}'::text[]`),
});

export const articles = pgTable("articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  subtitle: text("subtitle").default(""),
  content: text("content").notNull(),
  coverImage: text("cover_image").default(""),
  authorId: varchar("author_id").notNull().references(() => users.id),
  published: boolean("published").default(false),
  readTime: integer("read_time").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tags = pgTable("tags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
});

export const articleTags = pgTable("article_tags", {
  articleId: varchar("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
  tagId: varchar("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.articleId, t.tagId] })]);

export const claps = pgTable("claps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  articleId: varchar("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id),
  count: integer("count").default(1),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  articleId: varchar("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
  authorId: varchar("author_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookmarks = pgTable("bookmarks", {
  userId: varchar("user_id").notNull().references(() => users.id),
  articleId: varchar("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [primaryKey({ columns: [t.userId, t.articleId] })]);

export const follows = pgTable("follows", {
  followerId: varchar("follower_id").notNull().references(() => users.id),
  followingId: varchar("following_id").notNull().references(() => users.id),
}, (t) => [primaryKey({ columns: [t.followerId, t.followingId] })]);

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  bio: true,
  avatarUrl: true,
  interests: true,
});

export const insertArticleSchema = createInsertSchema(articles).pick({
  title: true,
  subtitle: true,
  content: true,
  coverImage: true,
  published: true,
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  content: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Tag = typeof tags.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type ArticleWithAuthor = Article & {
  author: Pick<User, "id" | "username" | "displayName" | "avatarUrl">;
  tags: string[];
  clapCount: number;
  commentCount: number;
  hasClapped: boolean;
  hasBookmarked: boolean;
};
