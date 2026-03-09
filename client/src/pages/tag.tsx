import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import type { ArticleWithAuthor } from "@shared/schema";
import { ArticleCard, ArticleCardSkeleton } from "@/components/article-card";
import { Hash } from "lucide-react";

export default function TagPage() {
  const { name } = useParams<{ name: string }>();

  const { data: articles, isLoading } = useQuery<ArticleWithAuthor[]>({
    queryKey: ["/api/tags", name, "articles"],
  });

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      <div className="mx-auto max-w-[720px] px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Hash className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold font-serif capitalize" data-testid="text-tag-title">{name}</h1>
        </div>

        <div className="divide-y">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <ArticleCardSkeleton key={i} />)
          ) : articles && articles.length > 0 ? (
            articles.map((article) => <ArticleCard key={article.id} article={article} />)
          ) : (
            <div className="text-center py-16" data-testid="text-no-tag-articles">
              <p className="text-muted-foreground text-lg mb-1">No articles with this tag</p>
              <p className="text-sm text-muted-foreground">Check back later for new content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
