import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import type { ArticleWithAuthor, Comment, User } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Heart, MessageCircle, Bookmark, BookmarkCheck, Share2, PenLine, Trash2 } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useState } from "react";

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [commentText, setCommentText] = useState("");

  const { data: article, isLoading } = useQuery<ArticleWithAuthor>({
    queryKey: ["/api/articles", id],
  });

  const { data: comments } = useQuery<(Comment & { author: Pick<User, "id" | "username" | "displayName" | "avatarUrl"> })[]>({
    queryKey: ["/api/articles", id, "comments"],
  });

  const clapMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/articles/${id}/clap`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/articles/${id}/bookmark`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => apiRequest("POST", `/api/articles/${id}/comments`, { content }),
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["/api/articles", id, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles", id] });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/articles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({ title: "Article deleted" });
      setLocation("/");
    },
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied to clipboard" });
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-background">
        <div className="mx-auto max-w-[720px] px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-3/4 bg-muted rounded" />
            <div className="h-6 w-1/2 bg-muted rounded" />
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-3 w-48 bg-muted rounded" />
              </div>
            </div>
            <div className="h-64 bg-muted rounded-md" />
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded" style={{ width: `${70 + Math.random() * 30}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center" data-testid="text-article-not-found">
        <p className="text-muted-foreground">Article not found</p>
      </div>
    );
  }

  const isOwner = user?.id === article.authorId;
  const publishDate = article.createdAt ? format(new Date(article.createdAt), "MMM d, yyyy") : "";

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      <article className="mx-auto max-w-[720px] px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl md:text-[42px] font-bold font-serif leading-tight mb-3" data-testid="text-article-title">
            {article.title}
          </h1>
          {article.subtitle && (
            <p className="text-xl md:text-2xl text-muted-foreground leading-snug mb-6" data-testid="text-article-subtitle">
              {article.subtitle}
            </p>
          )}

          <div className="flex items-center justify-between gap-4">
            <Link href={`/profile/${article.author.username}`}>
              <div className="flex items-center gap-3 cursor-pointer">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {article.author.displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium" data-testid="text-article-author">{article.author.displayName}</p>
                  <p className="text-xs text-muted-foreground">
                    {publishDate} · {article.readTime} min read
                  </p>
                </div>
              </div>
            </Link>
            {isOwner && (
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => setLocation(`/edit/${article.id}`)} data-testid="button-edit-article">
                  <PenLine className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate()} data-testid="button-delete-article">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </header>

        <Separator className="mb-8" />

        {article.coverImage && (
          <div className="mb-8 rounded-md overflow-hidden">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full object-cover max-h-[480px]"
              data-testid="img-article-cover"
            />
          </div>
        )}

        <div
          className="prose prose-lg dark:prose-invert max-w-none font-serif leading-relaxed mb-10"
          data-testid="text-article-content"
        >
          {article.content.split("\n").map((paragraph, i) => (
            paragraph.trim() ? <p key={i}>{paragraph}</p> : <br key={i} />
          ))}
        </div>

        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {article.tags.map((tag) => (
              <Link key={tag} href={`/tag/${tag}`}>
                <Badge variant="secondary" className="cursor-pointer" data-testid={`badge-article-tag-${tag}`}>
                  {tag}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        <Separator className="mb-6" />

        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 ${article.hasClapped ? "text-primary" : ""}`}
              onClick={() => clapMutation.mutate()}
              disabled={!user}
              data-testid="button-clap"
            >
              <Heart className={`h-5 w-5 ${article.hasClapped ? "fill-current" : ""}`} />
              <span>{article.clapCount}</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2" data-testid="button-comments-count">
              <MessageCircle className="h-5 w-5" />
              <span>{article.commentCount}</span>
            </Button>
          </div>
          <div className="flex items-center gap-1">
            {user && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => bookmarkMutation.mutate()}
                data-testid="button-bookmark"
              >
                {article.hasBookmarked ? (
                  <BookmarkCheck className="h-5 w-5 text-primary fill-current" />
                ) : (
                  <Bookmark className="h-5 w-5" />
                )}
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={handleShare} data-testid="button-share">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <section className="mb-8">
          <h3 className="text-xl font-bold font-serif mb-6" data-testid="text-responses-header">
            Responses ({article.commentCount})
          </h3>

          {user && (
            <div className="mb-8">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {user.displayName?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="What are your thoughts?"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="mb-2 resize-none"
                    data-testid="input-comment"
                  />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={() => commentMutation.mutate(commentText)}
                      disabled={!commentText.trim() || commentMutation.isPending}
                      data-testid="button-post-comment"
                    >
                      Respond
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {comments?.map((comment) => (
              <div key={comment.id} className="flex gap-3" data-testid={`card-comment-${comment.id}`}>
                <Avatar className="h-8 w-8 mt-0.5">
                  <AvatarFallback className="text-xs bg-muted">
                    {comment.author.displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Link href={`/profile/${comment.author.username}`}>
                      <span className="text-sm font-medium cursor-pointer">{comment.author.displayName}</span>
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {comment.createdAt
                        ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
                        : ""}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{comment.content}</p>
                </div>
              </div>
            ))}
            {comments?.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-4" data-testid="text-no-comments">
                No responses yet. Be the first to share your thoughts.
              </p>
            )}
          </div>
        </section>
      </article>
    </div>
  );
}
