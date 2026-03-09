import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import Home from "@/pages/home";
import Auth from "@/pages/auth";
import Write from "@/pages/write";
import ArticlePage from "@/pages/article";
import Profile from "@/pages/profile";
import Bookmarks from "@/pages/bookmarks";
import MyArticles from "@/pages/my-articles";
import TagPage from "@/pages/tag";
import SearchPage from "@/pages/search";
import Onboarding from "@/pages/onboarding";
import Discover from "@/pages/discover";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/write" component={Write} />
      <Route path="/edit/:id" component={Write} />
      <Route path="/article/:id" component={ArticlePage} />
      <Route path="/profile/:username" component={Profile} />
      <Route path="/bookmarks" component={Bookmarks} />
      <Route path="/my-articles" component={MyArticles} />
      <Route path="/tag/:name" component={TagPage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/discover" component={Discover} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <div className="min-h-screen bg-background">
              <Navbar />
              <Router />
            </div>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
