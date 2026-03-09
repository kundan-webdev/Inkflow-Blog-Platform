import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Cpu, Palette, Rocket, Brain, BarChart3, BookOpen, Lightbulb,
  Compass, Code, Globe, Heart, Music, Camera, Leaf, Dumbbell,
  Briefcase, GraduationCap, Utensils, Plane, Film
} from "lucide-react";

const INTEREST_OPTIONS = [
  { name: "technology", label: "Technology", icon: Cpu, color: "from-blue-500 to-cyan-500" },
  { name: "programming", label: "Programming", icon: Code, color: "from-slate-600 to-slate-800" },
  { name: "design", label: "Design", icon: Palette, color: "from-pink-500 to-rose-500" },
  { name: "startup", label: "Startups", icon: Rocket, color: "from-orange-500 to-amber-500" },
  { name: "ai", label: "AI & ML", icon: Brain, color: "from-rose-400 to-pink-500" },
  { name: "data-science", label: "Data Science", icon: BarChart3, color: "from-teal-500 to-cyan-500" },
  { name: "writing", label: "Writing", icon: BookOpen, color: "from-indigo-500 to-blue-500" },
  { name: "productivity", label: "Productivity", icon: Lightbulb, color: "from-yellow-500 to-orange-500" },
  { name: "career", label: "Career", icon: Briefcase, color: "from-slate-500 to-gray-500" },
  { name: "leadership", label: "Leadership", icon: Compass, color: "from-red-500 to-rose-500" },
  { name: "javascript", label: "JavaScript", icon: Globe, color: "from-yellow-400 to-amber-500" },
  { name: "health", label: "Health", icon: Heart, color: "from-red-400 to-pink-500" },
  { name: "music", label: "Music", icon: Music, color: "from-rose-500 to-red-400" },
  { name: "photography", label: "Photography", icon: Camera, color: "from-sky-500 to-blue-500" },
  { name: "sustainability", label: "Sustainability", icon: Leaf, color: "from-amber-600 to-yellow-700" },
  { name: "fitness", label: "Fitness", icon: Dumbbell, color: "from-orange-400 to-red-500" },
  { name: "education", label: "Education", icon: GraduationCap, color: "from-blue-500 to-indigo-500" },
  { name: "food", label: "Food & Cooking", icon: Utensils, color: "from-amber-500 to-yellow-500" },
  { name: "travel", label: "Travel", icon: Plane, color: "from-cyan-500 to-teal-500" },
  { name: "entertainment", label: "Entertainment", icon: Film, color: "from-stone-500 to-stone-700" },
];

export default function Onboarding() {
  const [selected, setSelected] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/auth");
    }
  }, [isLoading, user, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const toggleInterest = (name: string) => {
    setSelected((prev) =>
      prev.includes(name)
        ? prev.filter((i) => i !== name)
        : prev.length < 10
        ? [...prev, name]
        : prev
    );
  };

  const handleContinue = async () => {
    if (selected.length < 3) {
      toast({
        title: "Select at least 3 topics",
        description: "This helps us personalize your feed.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await apiRequest("PATCH", "/api/auth/interests", { interests: selected });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Welcome to Inkflow!", description: "Your feed is now personalized." });
      setLocation("/");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center px-4 py-8 md:py-12">
      <div className="w-full max-w-3xl animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-serif mb-3" data-testid="text-onboarding-title">
            What are you interested in?
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Pick at least 3 topics to personalize your feed. You can change these later.
          </p>
        </div>

        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50">
            <span className="text-sm font-medium text-muted-foreground">
              {selected.length} of 10 selected
            </span>
            <div className="flex gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i < selected.length ? "bg-primary scale-110" : "bg-muted-foreground/20"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
          {INTEREST_OPTIONS.map((interest, index) => {
            const isSelected = selected.includes(interest.name);
            const Icon = interest.icon;
            return (
              <button
                key={interest.name}
                onClick={() => toggleInterest(interest.name)}
                data-testid={`button-interest-${interest.name}`}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer group animate-fade-in-up ${
                  isSelected
                    ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-md scale-[1.02]"
                    : "border-border hover:border-primary/40 hover:shadow-sm hover:-translate-y-0.5"
                }`}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 bg-gradient-to-br ${interest.color} ${
                    isSelected ? "shadow-lg scale-110" : "opacity-70 group-hover:opacity-100 group-hover:scale-105"
                  }`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span className={`text-sm font-medium transition-colors ${isSelected ? "text-primary" : ""}`}>
                  {interest.label}
                </span>
                {isSelected && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center animate-fade-in-scale">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex justify-center gap-4">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            data-testid="button-skip-onboarding"
          >
            Skip for now
          </Button>
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={isSubmitting || selected.length < 3}
            className="min-w-[140px]"
            data-testid="button-continue-onboarding"
          >
            {isSubmitting ? "Saving..." : `Continue (${selected.length})`}
          </Button>
        </div>
      </div>
    </div>
  );
}
