'use client'

import { useCallback, useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Minus,
  Eye,
  Code2,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ViewMode = 'editor' | 'markdown' | 'raw' | 'preview'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  disabled?: boolean
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  disabled = false,
}: RichTextEditorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('editor')
  const [markdownContent, setMarkdownContent] = useState('')
  const [rawContent, setRawContent] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full mx-auto',
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: false,
      }),
    ],
    content,
    editable: !disabled && viewMode === 'editor',
    immediatelyRender: false, // Prevent SSR hydration mismatch
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
    },
    editorProps: {
      attributes: {
        class: 'tiptap focus:outline-none',
      },
    },
  })

  // Sync content changes from parent
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '')
    }
  }, [content, editor])

  // Update editable state when viewMode changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled && viewMode === 'editor')
    }
  }, [editor, disabled, viewMode])

  // Convert HTML to pseudo-markdown for display
  const htmlToMarkdown = useCallback((html: string): string => {
    if (!html) return ''
    return html
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
      .replace(/<u[^>]*>(.*?)<\/u>/gi, '__$1__')
      .replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~')
      .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
      .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n')
      .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
      .replace(/<ul[^>]*>|<\/ul>/gi, '\n')
      .replace(/<ol[^>]*>|<\/ol>/gi, '\n')
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
      .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)')
      .replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)')
      .replace(/<hr[^>]*\/?>/gi, '\n---\n')
      .replace(/<br[^>]*\/?>/gi, '\n')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }, [])

  // Convert markdown to HTML for import
  const markdownToHtml = useCallback((md: string): string => {
    if (!md) return ''
    return md
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/~~(.*?)~~/g, '<s>$1</s>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/\!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" />')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
      .replace(/^---$/gim, '<hr />')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br />')
      .replace(/^(.+)$/gm, (match) => {
        if (match.startsWith('<')) return match
        return `<p>${match}</p>`
      })
  }, [])

  // Update markdown/raw when switching modes
  useEffect(() => {
    if (viewMode === 'markdown') {
      setMarkdownContent(htmlToMarkdown(content))
    } else if (viewMode === 'raw') {
      setRawContent(content || '')
    }
  }, [viewMode, content, htmlToMarkdown])

  const handleMarkdownChange = (value: string) => {
    setMarkdownContent(value)
  }

  const handleRawChange = (value: string) => {
    setRawContent(value)
  }

  const applyChanges = () => {
    if (viewMode === 'markdown') {
      const html = markdownToHtml(markdownContent)
      onChange(html)
      if (editor) {
        editor.commands.setContent(html)
      }
    } else if (viewMode === 'raw') {
      onChange(rawContent)
      if (editor) {
        editor.commands.setContent(rawContent)
      }
    }
  }

  const setLink = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const addImage = useCallback(() => {
    if (!editor) return
    const url = window.prompt('Image URL')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  if (!editor) return null

  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled: btnDisabled = false,
    children,
    title,
  }: {
    onClick: () => void
    isActive?: boolean
    disabled?: boolean
    children: React.ReactNode
    title: string
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={btnDisabled || disabled}
      title={title}
      className={cn(
        'p-2 rounded-md transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed',
        isActive && 'bg-accent text-accent-foreground'
      )}
    >
      {children}
    </button>
  )

  const ToolbarDivider = () => <div className="w-px h-6 bg-border mx-1" />

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* View Mode Tabs */}
      <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/30">
        <Button
          type="button"
          variant={viewMode === 'editor' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('editor')}
          className="gap-1.5"
        >
          <FileText className="h-4 w-4" />
          Editor
        </Button>
        <Button
          type="button"
          variant={viewMode === 'markdown' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('markdown')}
          className="gap-1.5"
        >
          <Code2 className="h-4 w-4" />
          Markdown
        </Button>
        <Button
          type="button"
          variant={viewMode === 'raw' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('raw')}
          className="gap-1.5"
        >
          <Code className="h-4 w-4" />
          HTML
        </Button>
        <Button
          type="button"
          variant={viewMode === 'preview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('preview')}
          className="gap-1.5"
        >
          <Eye className="h-4 w-4" />
          Preview
        </Button>
        {(viewMode === 'markdown' || viewMode === 'raw') && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={applyChanges}
            className="ml-auto"
          >
            Apply Changes
          </Button>
        )}
      </div>

      {/* Toolbar - only in editor mode */}
      {viewMode === 'editor' && (
        <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-border bg-muted/50">
          {/* Headings */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Text formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            isActive={editor.isActive('highlight')}
            title="Highlight"
          >
            <Highlighter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            title="Inline Code"
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Alignment */}
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Lists */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Rule"
          >
            <Minus className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Links & Images */}
          <ToolbarButton
            onClick={setLink}
            isActive={editor.isActive('link')}
            title="Add Link"
          >
            <LinkIcon className="h-4 w-4" />
          </ToolbarButton>
          {editor.isActive('link') && (
            <ToolbarButton
              onClick={() => editor.chain().focus().unsetLink().run()}
              title="Remove Link"
            >
              <Unlink className="h-4 w-4" />
            </ToolbarButton>
          )}
          <ToolbarButton onClick={addImage} title="Add Image">
            <ImageIcon className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Undo/Redo */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </ToolbarButton>
        </div>
      )}

      {/* Content Area */}
      <div className="relative">
        {viewMode === 'editor' && (
          <div
            className={cn(
              'tiptap-editor min-h-[400px]',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <EditorContent editor={editor} />
            <style jsx global>{`
              .tiptap-editor .tiptap {
                padding: 1rem;
                min-height: 400px;
                outline: none;
              }
              .tiptap-editor .tiptap:focus {
                outline: none;
              }
              .tiptap-editor .tiptap > * + * {
                margin-top: 0.75em;
              }
              .tiptap-editor .tiptap h1 {
                font-size: 2em;
                font-weight: 700;
                line-height: 1.2;
                margin-top: 1em;
                margin-bottom: 0.5em;
              }
              .tiptap-editor .tiptap h2 {
                font-size: 1.5em;
                font-weight: 700;
                line-height: 1.3;
                margin-top: 1em;
                margin-bottom: 0.5em;
              }
              .tiptap-editor .tiptap h3 {
                font-size: 1.25em;
                font-weight: 600;
                line-height: 1.4;
                margin-top: 1em;
                margin-bottom: 0.5em;
              }
              .tiptap-editor .tiptap p {
                line-height: 1.7;
              }
              .tiptap-editor .tiptap strong {
                font-weight: 700;
              }
              .tiptap-editor .tiptap em {
                font-style: italic;
              }
              .tiptap-editor .tiptap u {
                text-decoration: underline;
              }
              .tiptap-editor .tiptap s {
                text-decoration: line-through;
              }
              .tiptap-editor .tiptap mark {
                background-color: #fef08a;
                padding: 0.125em 0.25em;
                border-radius: 0.25em;
              }
              .dark .tiptap-editor .tiptap mark {
                background-color: #854d0e;
              }
              .tiptap-editor .tiptap code {
                background-color: hsl(var(--muted));
                padding: 0.125em 0.375em;
                border-radius: 0.25em;
                font-family: ui-monospace, monospace;
                font-size: 0.875em;
              }
              .tiptap-editor .tiptap pre {
                background-color: hsl(var(--muted));
                padding: 1rem;
                border-radius: 0.5rem;
                overflow-x: auto;
              }
              .tiptap-editor .tiptap pre code {
                background: none;
                padding: 0;
              }
              .tiptap-editor .tiptap blockquote {
                border-left: 3px solid hsl(var(--border));
                padding-left: 1rem;
                margin-left: 0;
                font-style: italic;
                color: hsl(var(--foreground) / 0.8);
              }
              .tiptap-editor .tiptap ul {
                list-style-type: disc;
                padding-left: 1.5rem;
              }
              .tiptap-editor .tiptap ol {
                list-style-type: decimal;
                padding-left: 1.5rem;
              }
              .tiptap-editor .tiptap li {
                margin-top: 0.25em;
                margin-bottom: 0.25em;
              }
              .tiptap-editor .tiptap hr {
                border: none;
                border-top: 1px solid hsl(var(--border));
                margin: 1.5rem 0;
              }
              .tiptap-editor .tiptap a {
                color: hsl(var(--primary));
                text-decoration: underline;
                cursor: pointer;
              }
              .tiptap-editor .tiptap img {
                max-width: 100%;
                height: auto;
                border-radius: 0.5rem;
                margin: 1rem auto;
                display: block;
              }
              .tiptap-editor .tiptap p.is-editor-empty:first-child::before {
                content: attr(data-placeholder);
                float: left;
                color: hsl(var(--foreground) / 0.4);
                pointer-events: none;
                height: 0;
              }
              .tiptap-editor .tiptap [style*="text-align: center"] {
                text-align: center;
              }
              .tiptap-editor .tiptap [style*="text-align: right"] {
                text-align: right;
              }
            `}</style>
          </div>
        )}

        {viewMode === 'markdown' && (
          <textarea
            value={markdownContent}
            onChange={(e) => handleMarkdownChange(e.target.value)}
            disabled={disabled}
            placeholder="Write in Markdown format...

# Heading 1
## Heading 2
### Heading 3

**bold text**
*italic text*
__underlined__
~~strikethrough~~

- bullet point
1. numbered item

> blockquote

[link text](https://example.com)
![image alt](image-url.jpg)"
            className="w-full min-h-[400px] p-4 bg-transparent font-mono text-sm resize-none focus:outline-none disabled:opacity-50"
          />
        )}

        {viewMode === 'raw' && (
          <textarea
            value={rawContent}
            onChange={(e) => handleRawChange(e.target.value)}
            disabled={disabled}
            placeholder="Write raw HTML...

<h1>Heading 1</h1>
<p><strong>Bold</strong> and <em>italic</em> text.</p>"
            className="w-full min-h-[400px] p-4 bg-transparent font-mono text-sm resize-none focus:outline-none disabled:opacity-50"
          />
        )}

        {viewMode === 'preview' && (
          <div
            className="prose prose-sm sm:prose-base dark:prose-invert max-w-none min-h-[400px] p-4"
            dangerouslySetInnerHTML={{ __html: content || '<p class="text-foreground/50">Nothing to preview yet.</p>' }}
          />
        )}
      </div>
    </div>
  )
}
