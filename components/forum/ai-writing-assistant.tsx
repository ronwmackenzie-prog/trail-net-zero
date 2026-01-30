'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  Sparkles,
  Send,
  Loader2,
  Wand2,
  X,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Smile,
  Briefcase,
  Zap,
  Coffee,
  BookOpen,
  Heart,
  AlertCircle,
} from 'lucide-react'

interface AIWritingAssistantProps {
  resourceType: string
  title: string
  excerpt: string
  onContentGenerated: (content: string) => void
}

const TONES = [
  { id: 'friendly', label: 'Friendly', icon: Smile, description: 'Warm and conversational' },
  { id: 'professional', label: 'Professional', icon: Briefcase, description: 'Polished and authoritative' },
  { id: 'confident', label: 'Confident', icon: Zap, description: 'Bold and inspiring' },
  { id: 'casual', label: 'Casual', icon: Coffee, description: 'Relaxed and informal' },
  { id: 'educational', label: 'Educational', icon: BookOpen, description: 'Clear and instructional' },
  { id: 'inspiring', label: 'Inspiring', icon: Heart, description: 'Motivational and uplifting' },
  { id: 'urgent', label: 'Urgent', icon: AlertCircle, description: 'Time-sensitive and compelling' },
]

const QUICK_PROMPTS = [
  'Write a complete article based on the title and summary',
  'Write an introduction paragraph that hooks the reader',
  'Create a bulleted list of key points',
  'Write a compelling conclusion with a call to action',
  'Expand on this topic with more detail and examples',
  'Rewrite this in a more engaging way',
]

export function AIWritingAssistant({
  resourceType,
  title,
  excerpt,
  onContentGenerated,
}: AIWritingAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [selectedTone, setSelectedTone] = useState('professional')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const generateContent = useCallback(async () => {
    if (!prompt.trim() || isGenerating) return

    setError(null)
    setIsGenerating(true)
    setGeneratedContent('')

    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch('/api/admin/write', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          resourceType,
          tone: selectedTone,
          title,
          excerpt,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`Failed to generate content: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)

              // Handle text delta events from OpenAI Responses API
              if (parsed.type === 'response.output_text.delta') {
                fullContent += parsed.delta
                setGeneratedContent(fullContent)
              }
            } catch {
              // Try to parse as plain text chunk (fallback)
              if (line.startsWith('0:')) {
                try {
                  const text = JSON.parse(line.slice(2))
                  fullContent += text
                  setGeneratedContent(fullContent)
                } catch {
                  // Skip unparseable lines
                }
              }
            }
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        // Request was cancelled
      } else {
        console.error('Generation error:', err)
        setError('Failed to generate content. Please try again.')
      }
    } finally {
      setIsGenerating(false)
      abortControllerRef.current = null
    }
  }, [prompt, resourceType, selectedTone, title, excerpt, isGenerating])

  const handleInsert = () => {
    if (generatedContent) {
      onContentGenerated(generatedContent)
      setGeneratedContent('')
      setPrompt('')
      setIsExpanded(false)
    }
  }

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setIsGenerating(false)
  }

  const handleQuickPrompt = (quickPrompt: string) => {
    setPrompt(quickPrompt)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      generateContent()
    }
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 overflow-hidden">
      {/* Header - Always visible */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-primary/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-medium text-foreground">AI Writing Assistant</p>
            <p className="text-xs text-foreground/60">
              Let AI help you write your {resourceType}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-foreground/60" />
        ) : (
          <ChevronDown className="h-5 w-5 text-foreground/60" />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-primary/20">
          {/* Tone Selection */}
          <div className="pt-4">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Select Tone
            </label>
            <div className="flex flex-wrap gap-2">
              {TONES.map((tone) => {
                const Icon = tone.icon
                const isSelected = selectedTone === tone.id
                return (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() => setSelectedTone(tone.id)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all',
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border border-border hover:border-primary/50'
                    )}
                    title={tone.description}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tone.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quick Prompts */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Quick Prompts
            </label>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((qp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickPrompt(qp)}
                  className="text-xs px-3 py-1.5 rounded-full bg-background border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  {qp}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Input */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              What would you like AI to write?
            </label>
            <div className="relative">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., Write an article about the benefits of reusable cup systems at trail running events..."
                className="min-h-[100px] resize-none pr-4 pb-8"
                disabled={isGenerating}
              />
              <div className="absolute bottom-2 right-2 text-xs text-foreground/40">
                {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+↵ to generate
              </div>
            </div>
            {title && (
              <p className="text-xs text-foreground/60 mt-2">
                <span className="font-medium">Using title:</span> {title}
              </p>
            )}
            {excerpt && (
              <p className="text-xs text-foreground/60 mt-1">
                <span className="font-medium">Using excerpt:</span> {excerpt.substring(0, 100)}...
              </p>
            )}
          </div>

          {/* Generate Button */}
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={generateContent}
              disabled={!prompt.trim() || isGenerating}
              className="flex-1 gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  Generate Content
                </>
              )}
            </Button>
            {isGenerating && (
              <Button type="button" variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Generated Content Preview */}
          {generatedContent && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground block">
                Generated Content
              </label>
              <div className="rounded-lg border border-border bg-background p-4 max-h-[300px] overflow-y-auto">
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: generatedContent }}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleInsert}
                  className="flex-1 gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Insert into Editor
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setGeneratedContent('')}
                >
                  Discard
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
