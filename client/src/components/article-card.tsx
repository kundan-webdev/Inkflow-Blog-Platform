import { Link } from "wouter";
import type { ArticleWithAuthor } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bookmark, MessageCircle, Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function getInitials(name: string) {
  return name.charAt(0).toUpperCase();
}

export function ArticleCard({ article }: { article: ArticleWithAuthor }) {
  const formattedDate = article.createdAt
    ? formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })
    : "";

  return (
    <article className="group py-6 first:pt-0" data-testid={`card-article-${article.id}`}>
      <div className="flex gap-4 md:gap-6">
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${article.author.username}`}>
            <div className="flex items-center gap-2 mb-2 cursor-pointer">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px] bg-stone-700 dark:bg-stone-400 text-white dark:text-stone-900 font-bold">
                  {getInitials(article.author.displayName)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hover:text-primary transition-colors" data-testid={`text-author-${article.id}`}>
                {article.author.displayName}
              </span>
            </div>
          </Link>

          <Link href={`/article/${article.id}`}>
            <div className="cursor-pointer">
              <h2 className="text-lg md:text-xl font-bold font-serif leading-tight mb-1 group-hover:text-primary transition-colors duration-200 line-clamp-2" data-testid={`text-title-${article.id}`}>
                {article.title}
              </h2>
              {article.subtitle && (
                <p className="text-muted-foreground text-sm md:text-base line-clamp-2 mb-2" data-testid={`text-subtitle-${article.id}`}>
                  {article.subtitle}
                </p>
              )}
            </div>
          </Link>

          <div className="flex items-center justify-between gap-2 mt-3">
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <span>{formattedDate}</span>
              <span className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                {article.readTime} min read
              </span>
              {article.tags.length > 0 && (
                <Link href={`/tag/${article.tags[0]}`}>
                  <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors" data-testid={`badge-tag-${article.id}`}>
                    {article.tags[0]}
                  </Badge>
                </Link>
              )}
            </div>

            <div className="flex items-center gap-3 text-muted-foreground">
              <span className="flex items-center gap-1 text-xs group/clap">
                <Heart className={`h-3.5 w-3.5 transition-colors ${article.hasClapped ? 'text-red-500 fill-red-500' : 'group-hover/clap:text-red-400'}`} />
                {article.clapCount}
              </span>
              <span className="flex items-center gap-1 text-xs">
                <MessageCircle className="h-3.5 w-3.5" />
                {article.commentCount}
              </span>
              {article.hasBookmarked && (
                <Bookmark className="h-3.5 w-3.5 text-primary fill-primary" />
              )}
            </div>
          </div>
        </div>

        {article.coverImage && (
          <Link href={`/article/${article.id}`}>
            <div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden cursor-pointer group-hover:shadow-md transition-shadow duration-200">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                data-testid={`img-cover-${article.id}`}
              />
            </div>
          </Link>
        )}
      </div>
    </article>
  );
}

export function ArticleCardSkeleton() {
  return (
    <div className="py-6">
      <div className="flex gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-6 rounded-full bg-muted animate-pulse" />
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-6 w-3/4 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-full bg-muted animate-pulse rounded mb-2" />
          <div className="flex gap-3 mt-3">
            <div className="h-3 w-16 bg-muted animate-pulse rounded" />
            <div className="h-3 w-16 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="w-24 h-24 md:w-32 md:h-32 bg-muted animate-pulse rounded-lg flex-shrink-0" />
      </div>
    </div>
  );
}
