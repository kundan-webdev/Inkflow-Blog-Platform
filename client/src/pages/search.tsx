import { useQuery } from "@tanstack/react-query";
import { useSearch } from "wouter";
import type { ArticleWithAuthor } from "@shared/schema";
import { ArticleCard, ArticleCardSkeleton } from "@/components/article-card";
import { Search as SearchIcon } from "lucide-react";

export default function SearchPage() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const query = params.get("q") || "";

  const { data: articles, isLoading } = useQuery<ArticleWithAuthor[]>({
    queryKey: ["/api/search", `?q=${encodeURIComponent(query)}`],
    enabled: !!query,
  });

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      <div className="mx-auto max-w-[720px] px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SearchIcon className="h-6 w-6 text-muted-foreground" />
            <h1 className="text-2xl font-bold font-serif" data-testid="text-search-title">
              Results for "{query}"
            </h1>
          </div>
        </div>

        <div className="divide-y">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <ArticleCardSkeleton key={i} />)
          ) : articles && articles.length > 0 ? (
            articles.map((article) => <ArticleCard key={article.id} article={article} />)
          ) : (
            <div className="text-center py-16" data-testid="text-no-results">
              <p className="text-muted-foreground text-lg mb-1">No results found</p>
              <p className="text-sm text-muted-foreground">Try different keywords</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
