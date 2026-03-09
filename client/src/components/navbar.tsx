import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PenLine, Sun, Moon, Search, TrendingUp, Compass } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center cursor-pointer group typewriter">
              <span className="text-xl font-extrabold tracking-tight hidden sm:inline typewriter-text" data-testid="text-logo">Inkflow</span>
              <span className="hidden sm:inline typewriter-cursor" />
            </div>
          </Link>

          {user && (
            <nav className="hidden md:flex items-center gap-1 ml-2">
              <Link href="/#trending">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-1.5 text-sm ${location === '/' ? 'text-foreground' : 'text-muted-foreground'}`}
                  data-testid="nav-trending"
                >
                  <TrendingUp className="h-4 w-4" />
                  Trending
                </Button>
              </Link>
              <Link href="/discover">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-1.5 text-sm ${location === '/discover' ? 'text-foreground' : 'text-muted-foreground'}`}
                  data-testid="nav-discover"
                >
                  <Compass className="h-4 w-4" />
                  Discover
                </Button>
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          {user ? (
            <>
              <form onSubmit={handleSearch} className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  data-testid="input-search"
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 lg:w-64 pl-9 h-9 rounded-full bg-muted/50 border-none focus-visible:ring-1"
                />
              </form>

              <Button
                size="icon"
                variant="ghost"
                className="sm:hidden"
                onClick={() => setLocation("/search")}
                data-testid="button-search-mobile"
              >
                <Search className="h-5 w-5" />
              </Button>

              <Button size="icon" variant="ghost" onClick={toggleTheme} data-testid="button-theme-toggle">
                {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>

              <Link href="/write">
                <Button variant="ghost" size="sm" className="gap-2" data-testid="button-write">
                  <PenLine className="h-4 w-4" />
                  <span className="hidden sm:inline">Write</span>
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring" data-testid="button-user-menu">
                    <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-foreground/20 transition-all">
                      <AvatarFallback className="text-xs bg-stone-700 dark:bg-stone-400 text-white dark:text-stone-900 font-bold">
                        {user.displayName?.charAt(0)?.toUpperCase() || user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 mb-1">
                    <p className="text-sm font-medium">{user.displayName}</p>
                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation(`/profile/${user.username}`)} data-testid="menu-profile">
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/bookmarks")} data-testid="menu-bookmarks">
                    Bookmarks
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/my-articles")} data-testid="menu-my-articles">
                    My Articles
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} data-testid="menu-logout" className="text-destructive">
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" onClick={toggleTheme} data-testid="button-theme-toggle">
                {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
              <Link href="/auth">
                <Button variant="ghost" size="sm" data-testid="button-signin">
                  Sign in
                </Button>
              </Link>
              <Link href="/auth">
                <Button size="sm" className="rounded-full px-4" data-testid="button-get-started">
                  Get started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {user && (
        <div className="border-t md:hidden">
          <div className="mx-auto max-w-[1200px] px-4">
            <div className="flex items-center gap-1 py-1.5">
              <Link href="/#trending">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs" data-testid="nav-trending-mobile">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Trending
                </Button>
              </Link>
              <Link href="/discover">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs" data-testid="nav-discover-mobile">
                  <Compass className="h-3.5 w-3.5" />
                  Discover
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
