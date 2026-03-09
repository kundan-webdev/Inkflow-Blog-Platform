import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation, useParams } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { X, Image as ImageIcon } from "lucide-react";
import type { ArticleWithAuthor } from "@shared/schema";

export default function Write() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const editId = params?.id;
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const { data: existingArticle } = useQuery<ArticleWithAuthor>({
    queryKey: ["/api/articles", editId],
    enabled: !!editId,
  });

  useEffect(() => {
    if (existingArticle) {
      setTitle(existingArticle.title);
      setSubtitle(existingArticle.subtitle || "");
      setContent(existingArticle.content);
      setCoverImage(existingArticle.coverImage || "");
      setTags(existingArticle.tags || []);
    }
  }, [existingArticle]);

  const publishMutation = useMutation({
    mutationFn: async (published: boolean) => {
      const body = { title, subtitle, content, coverImage, published, tags };
      if (editId) {
        return apiRequest("PATCH", `/api/articles/${editId}`, body);
      }
      return apiRequest("POST", "/api/articles", body);
    },
    onSuccess: async (res) => {
      const data = await res.json();
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles/trending"] });
      toast({ title: "Article saved!" });
      setLocation(`/article/${data.id}`);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <p className="text-muted-foreground" data-testid="text-login-prompt">Please sign in to write articles.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      <div className="mx-auto max-w-[720px] px-4 py-8">
        <div className="flex items-center justify-between mb-8 gap-2">
          <h1 className="text-lg font-medium" data-testid="text-editor-title">
            {editId ? "Edit Article" : "Write your story"}
          </h1>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => publishMutation.mutate(false)}
              disabled={publishMutation.isPending || !title.trim() || !content.trim()}
              data-testid="button-save-draft"
            >
              Save draft
            </Button>
            <Button
              size="sm"
              onClick={() => publishMutation.mutate(true)}
              disabled={publishMutation.isPending || !title.trim() || !content.trim()}
              data-testid="button-publish"
            >
              {publishMutation.isPending ? "Saving..." : "Publish"}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {coverImage && (
            <div className="relative rounded-md overflow-hidden">
              <img src={coverImage} alt="Cover" className="w-full h-48 md:h-64 object-cover" data-testid="img-cover-preview" />
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-2 right-2"
                onClick={() => setCoverImage("")}
                data-testid="button-remove-cover"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Input
              placeholder="Cover image URL (optional)"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="flex-1"
              data-testid="input-cover-image"
            />
            <Button size="icon" variant="ghost" onClick={() => document.getElementById("cover-input")?.focus()}>
              <ImageIcon className="h-4 w-4" />
            </Button>
          </div>

          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-3xl md:text-4xl font-bold font-serif border-0 px-0 focus-visible:ring-0 placeholder:text-muted-foreground/40"
            data-testid="input-title"
          />

          <Input
            placeholder="Subtitle (optional)"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="text-xl text-muted-foreground border-0 px-0 focus-visible:ring-0 placeholder:text-muted-foreground/30"
            data-testid="input-subtitle"
          />

          <Textarea
            placeholder="Tell your story..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[400px] text-lg leading-relaxed border-0 focus-visible:ring-0 resize-none placeholder:text-muted-foreground/30 font-serif"
            data-testid="input-content"
          />

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-3">Add tags (up to 5)</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="ml-1" data-testid={`button-remove-tag-${tag}`}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className="max-w-xs"
                data-testid="input-tag"
              />
              <Button variant="ghost" size="sm" onClick={addTag} data-testid="button-add-tag">
                Add
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
