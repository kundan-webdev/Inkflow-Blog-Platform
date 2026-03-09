import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import type { ArticleWithAuthor } from "@shared/schema";
import { ArticleCard, ArticleCardSkeleton } from "@/components/article-card";
import { Bookmark } from "lucide-react";

export default function Bookmarks() {
  const { user } = useAuth();

  const { data: articles, isLoading } = useQuery<ArticleWithAuthor[]>({
    queryKey: ["/api/bookmarks"],
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center" data-testid="text-login-bookmark">
        <p className="text-muted-foreground">Please sign in to view your bookmarks.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      <div className="mx-auto max-w-[720px] px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Bookmark className="h-6 w-6" />
          <h1 className="text-2xl font-bold font-serif" data-testid="text-bookmarks-title">Your Bookmarks</h1>
        </div>

        <div className="divide-y">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <ArticleCardSkeleton key={i} />)
          ) : articles && articles.length > 0 ? (
            articles.map((article) => <ArticleCard key={article.id} article={article} />)
          ) : (
            <div className="text-center py-16" data-testid="text-no-bookmarks">
              <Bookmark className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg mb-1">No bookmarks yet</p>
              <p className="text-sm text-muted-foreground">Save articles to read later</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
