'use client'

import { useMemo, useState, useEffect } from "react";
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from "./rich-text-editor";
import { CoverImageUpload } from "./cover-image-upload";
import { AIWritingAssistant } from "./ai-writing-assistant";
import {
  FileText,
  Link as LinkIcon,
  Bell,
  Newspaper,
  BookOpen,
  Save,
  Trash2,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Archive,
  ArchiveRestore,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Resource = {
  id?: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  body?: string | null;
  external_url?: string | null;
  cover_image?: string | null;
  kind: string;
  is_published: boolean;
};

const RESOURCE_KINDS = [
  {
    value: "article",
    label: "Article",
    icon: FileText,
    description: "Long-form content with rich formatting",
  },
  {
    value: "link",
    label: "External Link",
    icon: LinkIcon,
    description: "Link to external resource or website",
  },
  {
    value: "update",
    label: "Update / Announcement",
    icon: Bell,
    description: "News and community updates",
  },
  {
    value: "newsletter",
    label: "Newsletter",
    icon: Newspaper,
    description: "Email newsletter content",
  },
  {
    value: "guide",
    label: "Guide / Tutorial",
    icon: BookOpen,
    description: "Step-by-step instructions",
  },
];

export function ResourceEditor({ initial }: { initial: Resource }) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [form, setForm] = useState<Resource>(initial)
  const [saving, setSaving] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(
    !!initial.slug || !!initial.external_url,
  );
  const [aiContentLoaded, setAiContentLoaded] = useState(false);

  const update = (patch: Partial<Resource>) =>
    setForm((p) => ({ ...p, ...patch }));

  // Check for AI-generated content in sessionStorage (coming from AI Content Helper)
  useEffect(() => {
    if (aiContentLoaded || initial.id) return; // Don't load for existing resources

    const aiContent = sessionStorage.getItem("ai_resource_content");
    if (aiContent) {
      setForm((prev) => ({ ...prev, body: aiContent }));
      // Clear the storage after loading
      sessionStorage.removeItem("ai_resource_content");
      sessionStorage.removeItem("ai_resource_markdown");
      setAiContentLoaded(true);
    }
  }, [aiContentLoaded, initial.id]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!initial.id && form.title && !form.slug) {
      const autoSlug = form.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .substring(0, 60);
      update({ slug: autoSlug });
    }
  }, [form.title, form.slug, initial.id]);

  const save = async () => {
    if (saving) return
    if (!form.slug.trim() || !form.title.trim()) return
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        slug: form.slug.trim(),
        title: form.title.trim(),
        excerpt: form.excerpt?.trim() || null,
        body: form.body?.trim() || null,
        external_url: form.external_url?.trim() || null,
        cover_image: form.cover_image || null,
        kind: form.kind,
        is_published: !!form.is_published && !form.is_archived, // Can't be published if archived
        published_at:
          form.is_published && !form.is_archived
            ? new Date().toISOString()
            : null,
        is_archived: !!form.is_archived,
        archived_at: form.is_archived ? new Date().toISOString() : null,
      };

      if (form.id) {
        const { error } = await supabase.from('member_resources').update(payload).eq('id', form.id)
        if (error) throw error
      } else {
        const { data: auth } = await supabase.auth.getUser()
        payload.created_by = auth.user?.id ?? null
        const { error } = await supabase.from('member_resources').insert(payload)
        if (error) throw error
      }

      router.push('/forum/admin/resources')
      router.refresh()
    } catch (e) {
      console.error('Failed to save resource', e)
      alert('Could not save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!form.id) return
    const ok = confirm('Delete this resource? This cannot be undone.')
    if (!ok) return
    setSaving(true)
    try {
      const { error } = await supabase.from('member_resources').delete().eq('id', form.id)
      if (error) throw error
      router.push('/forum/admin/resources')
      router.refresh()
    } catch (e) {
      console.error('Failed to delete resource', e)
      alert('Could not delete. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const selectedKind =
    RESOURCE_KINDS.find((k) => k.value === form.kind) ?? RESOURCE_KINDS[0];

  return (
    <div className="space-y-6">
      {/* Kind Selection - At the very top */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <Label className="text-base font-semibold mb-4 block">
          What type of resource are you creating?
        </Label>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {RESOURCE_KINDS.map((kind) => {
            const Icon = kind.icon;
            const isSelected = form.kind === kind.value;
            return (
              <button
                key={kind.value}
                type="button"
                onClick={() => update({ kind: kind.value })}
                disabled={saving}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all hover:border-primary/50",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 mt-0.5 flex-shrink-0",
                    isSelected ? "text-primary" : "text-foreground/60",
                  )}
                />
                <div>
                  <p
                    className={cn(
                      "font-medium",
                      isSelected ? "text-primary" : "text-foreground",
                    )}
                  >
                    {kind.label}
                  </p>
                  <p className="text-xs text-foreground/60 mt-0.5">
                    {kind.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-semibold">
              Title
            </Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="Enter a compelling title..."
              disabled={saving}
              className="text-lg h-12"
            />
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <Label htmlFor="excerpt" className="text-base font-semibold">
              Excerpt / Summary
            </Label>
            <Textarea
              id="excerpt"
              value={form.excerpt ?? ""}
              onChange={(e) => update({ excerpt: e.target.value })}
              placeholder="A brief summary that will appear in the resource list..."
              disabled={saving}
              className="min-h-20 resize-none"
            />
            <p className="text-xs text-foreground/60">
              This appears in the resources list to help members decide what to
              read.
            </p>
          </div>

          {/* Cover Image */}
          <CoverImageUpload
            value={form.cover_image ?? null}
            onChange={(url) => update({ cover_image: url })}
            disabled={saving}
          />

          {/* AI Writing Assistant */}
          <AIWritingAssistant
            resourceType={form.kind}
            title={form.title}
            excerpt={form.excerpt ?? ""}
            onContentGenerated={(content) => {
              // Append AI content to existing body, or set it if empty
              const currentBody = form.body ?? "";
              const newBody = currentBody
                ? `${currentBody}\n${content}`
                : content;
              update({ body: newBody });
            }}
          />

          {/* Body - Rich Text Editor */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Content</Label>
            <RichTextEditor
              content={form.body ?? ""}
              onChange={(content) => update({ body: content })}
              placeholder="Start writing your content here..."
              disabled={saving}
            />
          </div>
        </div>
      </div>

      {/* Advanced Settings (Slug, External URL) */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
        >
          <span className="font-medium text-foreground">Advanced Settings</span>
          {showAdvanced ? (
            <ChevronUp className="h-5 w-5 text-foreground/60" />
          ) : (
            <ChevronDown className="h-5 w-5 text-foreground/60" />
          )}
        </button>

        {showAdvanced && (
          <div className="px-6 pb-6 space-y-5 border-t border-border pt-5">
            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => update({ slug: e.target.value })}
                placeholder="url-friendly-slug"
                disabled={saving}
                className="font-mono text-sm"
              />
              <p className="text-xs text-foreground/60">
                URL:{" "}
                <span className="font-mono">
                  /forum/resources/{form.slug || "your-slug-here"}
                </span>
              </p>
            </div>

            {/* External URL */}
            <div className="space-y-2">
              <Label htmlFor="external_url">External URL (optional)</Label>
              <Input
                id="external_url"
                value={form.external_url ?? ""}
                onChange={(e) => update({ external_url: e.target.value })}
                placeholder="https://example.com/resource"
                disabled={saving}
              />
              <p className="text-xs text-foreground/60">
                If set, clicking this resource will open the external URL
                instead.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Publishing & Actions */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-5">
          {/* Status Indicators */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Published Toggle */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => update({ is_published: e.target.checked })}
                disabled={saving || form.is_archived}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-disabled:opacity-50"></div>
              <span className="ms-3 text-sm font-medium text-foreground">
                {form.is_published ? "Published" : "Draft"}
              </span>
            </label>
            {form.is_published && !form.is_archived && (
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                Visible to members
              </span>
            )}
            {form.is_archived && (
              <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                <Archive className="h-3 w-3" />
                Archived - not visible to members
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/forum/admin/resources")}
              disabled={saving}
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back
            </Button>

            {form.id && (
              <Button
                type="button"
                variant="outline"
                onClick={() => update({ is_archived: !form.is_archived })}
                disabled={saving}
              >
                {form.is_archived ? (
                  <>
                    <ArchiveRestore className="h-4 w-4 mr-1.5" />
                    Unarchive
                  </>
                ) : (
                  <>
                    <Archive className="h-4 w-4 mr-1.5" />
                    Archive
                  </>
                )}
              </Button>
            )}

            {form.id && (
              <Button
                type="button"
                variant="outline"
                onClick={remove}
                disabled={saving}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Delete
              </Button>
            )}

            <div className="flex-1" />

            <Button
              type="button"
              onClick={save}
              disabled={saving || !form.slug.trim() || !form.title.trim()}
              className="min-w-[100px]"
            >
              <Save className="h-4 w-4 mr-1.5" />
              {saving ? "Saving…" : form.id ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

