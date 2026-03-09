import { useQuery } from "@tanstack/react-query";
import type { ArticleWithAuthor } from "@shared/schema";
import { ArticleCard, ArticleCardSkeleton } from "@/components/article-card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Compass } from "lucide-react";

export default function Discover() {
  const { data: tags } = useQuery<{ id: string; name: string }[]>({
    queryKey: ["/api/tags"],
  });

  const { data: articles, isLoading } = useQuery<ArticleWithAuthor[]>({
    queryKey: ["/api/articles"],
  });

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      <div className="mx-auto max-w-[900px] px-4 py-8 md:py-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30">
            <Compass className="h-5 w-5 text-pink-600 dark:text-pink-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-discover-title">Discover</h1>
        </div>
        <p className="text-muted-foreground mb-8 ml-[52px]">
          Explore topics and find stories that match your interests.
        </p>

        <div className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4" data-testid="text-browse-topics">Browse topics</h2>
          <div className="flex flex-wrap gap-2">
            {tags?.map((tag) => (
              <Link key={tag.id} href={`/tag/${tag.name}`}>
                <Badge
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-all duration-200 text-sm py-1.5 px-3"
                  data-testid={`badge-discover-tag-${tag.id}`}
                >
                  {tag.name}
                </Badge>
              </Link>
            ))}
            {!tags && (
              Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-8 w-20 bg-muted animate-pulse rounded-full" />
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider mb-6" data-testid="text-all-stories">All stories</h2>
          <div className="space-y-0">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="border-b last:border-b-0">
                  <ArticleCardSkeleton />
                </div>
              ))
            ) : articles && articles.length > 0 ? (
              articles.map((article) => (
                <div key={article.id} className="border-b last:border-b-0">
                  <ArticleCard article={article} />
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-12" data-testid="text-no-articles">
                No articles found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
