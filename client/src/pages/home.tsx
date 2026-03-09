import { useQuery } from "@tanstack/react-query";
import type { ArticleWithAuthor } from "@shared/schema";
import { ArticleCard, ArticleCardSkeleton } from "@/components/article-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { TrendingUp, ArrowRight, BookOpen, Users, PenLine, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import heroIllustration from "@assets/hero-illustration.png";

function HeroSection() {
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden border-b min-h-[420px] md:min-h-[480px] flex items-center bg-gradient-to-br from-pink-50 via-rose-50/50 to-amber-50/30 dark:from-pink-950/30 dark:via-rose-950/20 dark:to-stone-950/30">
      <img
        src={heroIllustration}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-[0.15] dark:opacity-[0.08] pointer-events-none"
        data-testid="img-hero"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
      <div className="relative mx-auto max-w-[1200px] px-4 md:px-6 w-full">
        <div className="flex flex-col items-center text-center py-16 md:py-24">
          <div className="animate-fade-in-up max-w-2xl">
            <p
              className="text-sm font-semibold tracking-widest uppercase text-stone-600 dark:text-stone-400 mb-6"
              data-testid="text-hero-tagline"
            >
              Where ideas find their voice
            </p>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-5 leading-[1.1] tracking-tight"
              data-testid="text-hero-title"
            >
              Stay curious.
              <br />
              <span className="text-primary">Start writing.</span>
            </h1>
            <p
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-lg mx-auto leading-relaxed"
              data-testid="text-hero-subtitle"
            >
              Discover stories, thinking, and expertise from writers on any topic.
            </p>
            <div className="flex items-center gap-3 justify-center">
              {!user ? (
                <>
                  <Link href="/auth">
                    <Button size="lg" className="gap-2 text-base px-6 font-semibold" data-testid="button-hero-get-started">
                      Get started
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/auth">
                    <Button variant="outline" size="lg" className="text-base px-6" data-testid="button-hero-sign-in">
                      Sign in
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href="/write">
                  <Button size="lg" className="gap-2 text-base px-6 font-semibold" data-testid="button-hero-write">
                    <PenLine className="h-4 w-4" />
                    Start writing
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsBar() {
  const stats = [
    { icon: BookOpen, label: "Stories shared", value: "10K+" },
    { icon: Users, label: "Active writers", value: "2K+" },
    { icon: Zap, label: "Topics covered", value: "50+" },
  ];

  return (
    <section className="border-b bg-muted/30 animate-fade-in">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <div className="flex flex-wrap justify-center divide-x py-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center gap-3 px-6 md:px-10 py-2" data-testid={`stat-${stat.label.toLowerCase().replace(/\s/g, '-')}`}>
                <Icon className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-lg md:text-xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TrendingSection({ articles }: { articles: ArticleWithAuthor[] }) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="mb-10" id="trending">
      <div className="flex items-center gap-2 mb-6">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/30">
          <TrendingUp className="h-4 w-4 text-pink-600 dark:text-pink-400" />
        </div>
        <h2 className="text-sm font-bold uppercase tracking-wider" data-testid="text-trending-header">
          Trending on Inkflow
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.slice(0, 6).map((article, index) => (
          <Link key={article.id} href={`/article/${article.id}`}>
            <div
              className="flex gap-3 p-4 rounded-xl border border-transparent hover:border-border hover:bg-card/50 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
              data-testid={`card-trending-${article.id}`}
            >
              <span className="text-3xl font-bold text-pink-300/40 dark:text-pink-700/40 leading-none select-none">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-5 h-5 rounded-full bg-stone-700 dark:bg-stone-400 flex items-center justify-center text-[9px] font-bold text-white dark:text-stone-900">
                    {article.author.displayName.charAt(0)}
                  </div>
                  <span className="text-xs font-medium">{article.author.displayName}</span>
                </div>
                <h3 className="text-sm font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                  <span>{article.readTime} min read</span>
                  {article.tags[0] && (
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{article.tags[0]}</Badge>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const { data: articles, isLoading } = useQuery<ArticleWithAuthor[]>({
    queryKey: ["/api/articles"],
  });

  const { data: trending } = useQuery<ArticleWithAuthor[]>({
    queryKey: ["/api/articles/trending"],
  });

  const { data: tags } = useQuery<{ id: string; name: string }[]>({
    queryKey: ["/api/tags"],
  });

  const filteredArticles = activeFilter
    ? articles?.filter((a) => a.tags.includes(activeFilter))
    : articles;

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <StatsBar />

      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 py-8">
          <main className="flex-1 min-w-0">
            <TrendingSection articles={trending || []} />

            {user ? (
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold" data-testid="text-feed-header">Latest Stories</h2>
                </div>

                {tags && tags.length > 0 && (
                  <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide" data-testid="filter-tags">
                    <button
                      onClick={() => setActiveFilter(null)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        !activeFilter
                          ? "bg-foreground text-background"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                      data-testid="filter-all"
                    >
                      All
                    </button>
                    {tags.slice(0, 8).map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => setActiveFilter(activeFilter === tag.name ? null : tag.name)}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          activeFilter === tag.name
                            ? "bg-foreground text-background"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                        data-testid={`filter-tag-${tag.id}`}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                )}

                <div className="space-y-0">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="border-b last:border-b-0">
                        <ArticleCardSkeleton />
                      </div>
                    ))
                  ) : filteredArticles && filteredArticles.length > 0 ? (
                    filteredArticles.map((article) => (
                      <div key={article.id} className="border-b last:border-b-0">
                        <ArticleCard article={article} />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16" data-testid="text-empty-feed">
                      <div className="w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mx-auto mb-4">
                        <PenLine className="h-8 w-8 text-pink-500" />
                      </div>
                      <p className="text-muted-foreground text-lg mb-2">
                        {activeFilter ? `No stories in "${activeFilter}"` : "No articles yet"}
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        {activeFilter ? "Try a different filter" : "Be the first to share your story"}
                      </p>
                      {!activeFilter && (
                        <Link href="/write">
                          <Button data-testid="button-write-first">Start writing</Button>
                        </Link>
                      )}
                      {activeFilter && (
                        <Button variant="outline" onClick={() => setActiveFilter(null)} data-testid="button-clear-filter">
                          Clear filter
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </main>

          <aside className="hidden lg:block w-72 xl:w-80 flex-shrink-0">
            <div className="sticky top-20 space-y-8">
              <div className="animate-fade-in-right">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4" data-testid="text-discover-topics">
                  Discover more topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tags?.map((tag) => (
                    <Link key={tag.id} href={`/tag/${tag.name}`}>
                      <Badge
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-all duration-200"
                        data-testid={`badge-sidebar-tag-${tag.id}`}
                      >
                        {tag.name}
                      </Badge>
                    </Link>
                  ))}
                  {!tags && (
                    Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="h-6 w-16 bg-muted animate-pulse rounded-full" />
                    ))
                  )}
                </div>
              </div>

              {!user && (
                <div className="rounded-xl border bg-card p-5 animate-fade-in-right" style={{ animationDelay: "200ms" }}>
                  <h3 className="font-bold mb-2">Join Inkflow</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create an account to personalize your feed, bookmark stories, and start writing.
                  </p>
                  <Link href="/auth">
                    <Button size="sm" className="w-full" data-testid="button-sidebar-join">Get started</Button>
                  </Link>
                </div>
              )}

              <div className="border-t pt-6">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Inkflow is a place to read, write, and deepen your understanding.
                  Share your ideas and connect with curious minds.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
