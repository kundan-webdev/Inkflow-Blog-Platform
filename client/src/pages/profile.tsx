import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import type { ArticleWithAuthor, User } from "@shared/schema";
import { ArticleCard, ArticleCardSkeleton } from "@/components/article-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Settings, X, Check } from "lucide-react";
import {
  Cpu, Palette, Rocket, Brain, BarChart3, BookOpen, Lightbulb,
  Compass, Code, Globe, Heart, Music, Camera, Leaf, Dumbbell,
  Briefcase, GraduationCap, Utensils, Plane, Film
} from "lucide-react";

const INTEREST_OPTIONS = [
  { name: "technology", label: "Technology", icon: Cpu },
  { name: "programming", label: "Programming", icon: Code },
  { name: "design", label: "Design", icon: Palette },
  { name: "startup", label: "Startups", icon: Rocket },
  { name: "ai", label: "AI & ML", icon: Brain },
  { name: "data-science", label: "Data Science", icon: BarChart3 },
  { name: "writing", label: "Writing", icon: BookOpen },
  { name: "productivity", label: "Productivity", icon: Lightbulb },
  { name: "career", label: "Career", icon: Briefcase },
  { name: "leadership", label: "Leadership", icon: Compass },
  { name: "javascript", label: "JavaScript", icon: Globe },
  { name: "health", label: "Health", icon: Heart },
  { name: "music", label: "Music", icon: Music },
  { name: "photography", label: "Photography", icon: Camera },
  { name: "sustainability", label: "Sustainability", icon: Leaf },
  { name: "fitness", label: "Fitness", icon: Dumbbell },
  { name: "education", label: "Education", icon: GraduationCap },
  { name: "food", label: "Food & Cooking", icon: Utensils },
  { name: "travel", label: "Travel", icon: Plane },
  { name: "entertainment", label: "Entertainment", icon: Film },
];

type ProfileData = User & { articleCount: number; followerCount: number; followingCount: number; isFollowing: boolean };

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingInterests, setEditingInterests] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const { data: profile, isLoading: profileLoading } = useQuery<ProfileData>({
    queryKey: ["/api/users", username],
  });

  const { data: articles, isLoading: articlesLoading } = useQuery<ArticleWithAuthor[]>({
    queryKey: ["/api/users", username, "articles"],
  });

  const followMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/users/${username}/follow`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", username] });
    },
  });

  const interestsMutation = useMutation({
    mutationFn: (interests: string[]) => apiRequest("PATCH", "/api/auth/interests", { interests }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", username] });
      setEditingInterests(false);
      toast({ title: "Interests updated" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const startEditingInterests = () => {
    setSelectedInterests(user?.interests || []);
    setEditingInterests(true);
  };

  const toggleInterest = (name: string) => {
    setSelectedInterests((prev) =>
      prev.includes(name)
        ? prev.filter((i) => i !== name)
        : prev.length < 10
        ? [...prev, name]
        : prev
    );
  };

  if (profileLoading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-background">
        <div className="mx-auto max-w-[720px] px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-muted" />
              <div className="space-y-2">
                <div className="h-6 w-48 bg-muted rounded" />
                <div className="h-4 w-32 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center" data-testid="text-profile-not-found">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  const isOwnProfile = user?.username === username;
  const displayInterests = isOwnProfile ? (user?.interests || []) : (profile.interests || []);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      <div className="mx-auto max-w-[720px] px-4 py-12">
        <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
              {profile.displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-bold font-serif" data-testid="text-profile-name">{profile.displayName}</h1>
                <p className="text-muted-foreground text-sm" data-testid="text-profile-username">@{profile.username}</p>
              </div>
              {!isOwnProfile && user && (
                <Button
                  variant={profile.isFollowing ? "secondary" : "default"}
                  size="sm"
                  onClick={() => followMutation.mutate()}
                  data-testid="button-follow"
                >
                  {profile.isFollowing ? "Following" : "Follow"}
                </Button>
              )}
            </div>

            {profile.bio && (
              <p className="mt-3 text-sm leading-relaxed" data-testid="text-profile-bio">{profile.bio}</p>
            )}

            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <span data-testid="text-follower-count">{profile.followerCount} Followers</span>
              <span data-testid="text-following-count">{profile.followingCount} Following</span>
            </div>
          </div>
        </div>

        {displayInterests.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider" data-testid="text-interests-header">Interests</h3>
              {isOwnProfile && !editingInterests && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs text-muted-foreground"
                  onClick={startEditingInterests}
                  data-testid="button-edit-interests"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Edit
                </Button>
              )}
            </div>
            {!editingInterests ? (
              <div className="flex flex-wrap gap-2">
                {displayInterests.map((interest: string) => {
                  const option = INTEREST_OPTIONS.find((o) => o.name === interest);
                  return (
                    <Badge
                      key={interest}
                      variant="secondary"
                      className="text-xs py-1 px-2.5"
                      data-testid={`badge-interest-${interest}`}
                    >
                      {option ? option.label : interest}
                    </Badge>
                  );
                })}
              </div>
            ) : null}
          </div>
        )}

        {isOwnProfile && displayInterests.length === 0 && !editingInterests && (
          <div className="mb-6">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={startEditingInterests}
              data-testid="button-add-interests"
            >
              <Settings className="h-3.5 w-3.5" />
              Add interests
            </Button>
          </div>
        )}

        {editingInterests && (
          <div className="mb-6 p-4 rounded-xl border bg-card animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold" data-testid="text-edit-interests-title">Edit your interests</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedInterests.length} of 10 selected (min 3)</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setEditingInterests(false)}
                  data-testid="button-cancel-interests"
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  className="h-8 w-8"
                  disabled={selectedInterests.length < 3 || interestsMutation.isPending}
                  onClick={() => interestsMutation.mutate(selectedInterests)}
                  data-testid="button-save-interests"
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {INTEREST_OPTIONS.map((interest) => {
                const isSelected = selectedInterests.includes(interest.name);
                const Icon = interest.icon;
                return (
                  <button
                    key={interest.name}
                    onClick={() => toggleInterest(interest.name)}
                    data-testid={`button-interest-edit-${interest.name}`}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-sm transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 dark:bg-primary/10 font-medium"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <Icon className={`h-4 w-4 flex-shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="truncate">{interest.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <Separator className="mb-6" />

        <div className="space-y-0">
          {articlesLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
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
            <div className="text-center py-12" data-testid="text-no-articles">
              <p className="text-muted-foreground">No articles published yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
