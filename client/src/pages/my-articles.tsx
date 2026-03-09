import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import type { ArticleWithAuthor } from "@shared/schema";
import { ArticleCard, ArticleCardSkeleton } from "@/components/article-card";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PenLine } from "lucide-react";

export default function MyArticles() {
  const { user } = useAuth();

  const { data: articles, isLoading } = useQuery<ArticleWithAuthor[]>({
    queryKey: ["/api/my-articles"],
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <p className="text-muted-foreground" data-testid="text-login-my-articles">Please sign in to view your articles.</p>
      </div>
    );
  }

  const published = articles?.filter((a) => a.published) || [];
  const drafts = articles?.filter((a) => !a.published) || [];

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      <div className="mx-auto max-w-[720px] px-4 py-12">
        <div className="flex items-center justify-between mb-8 gap-4">
          <h1 className="text-2xl font-bold font-serif" data-testid="text-my-articles-title">Your Articles</h1>
          <Link href="/write">
            <Button size="sm" className="gap-2" data-testid="button-new-article">
              <PenLine className="h-4 w-4" />
              New Article
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="divide-y">
            {Array.from({ length: 3 }).map((_, i) => <ArticleCardSkeleton key={i} />)}
          </div>
        ) : (
          <>
            {drafts.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2" data-testid="text-drafts-header">
                  Drafts
                  <Badge variant="secondary">{drafts.length}</Badge>
                </h2>
                <div className="divide-y">
                  {drafts.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4" data-testid="text-published-header">
                Published
              </h2>
              <div className="divide-y">
                {published.length > 0 ? (
                  published.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))
                ) : (
                  <div className="text-center py-12" data-testid="text-no-published">
                    <p className="text-muted-foreground mb-2">No published articles yet</p>
                    <Link href="/write">
                      <Button variant="ghost" size="sm">Write your first article</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
