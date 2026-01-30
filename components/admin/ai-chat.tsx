'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { 
  Send, 
  Globe, 
  Copy, 
  Check, 
  Loader2,
  Sparkles,
  User,
  RotateCcw,
  Trash2
} from 'lucide-react'

export function AIChat() {
  const [enableWebSearch, setEnableWebSearch] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, reload } = useChat({
    api: '/api/admin/chat',
    body: {
      enableWebSearch,
    },
  })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (input?.trim() && !isLoading) {
        handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
      }
    }
  }

  // Copy message content to clipboard
  const copyToClipboard = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Clear conversation
  const clearConversation = () => {
    setMessages([])
  }

  return (
    <div className="flex h-full flex-col">
      {/* Chat Header with Controls */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">AI Content Assistant</h3>
            <p className="text-xs text-foreground/60">GPT-5.2</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Web Search Toggle */}
          <button
            onClick={() => setEnableWebSearch(!enableWebSearch)}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              enableWebSearch
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                : 'bg-muted text-foreground/60 hover:text-foreground'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            Web Search {enableWebSearch ? 'On' : 'Off'}
          </button>
          
          {/* Clear Conversation */}
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearConversation}
              className="h-8 px-2 text-foreground/60 hover:text-foreground"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              What would you like to create?
            </h3>
            <p className="mb-6 max-w-md text-sm text-foreground/60">
              I can help you write articles, blog posts, newsletters, social media content, and more.
              Just describe what you need!
            </p>
            
            {/* Quick Start Prompts */}
            <div className="grid max-w-lg gap-2">
              {[
                'Write a blog post about sustainable trail running gear',
                'Draft this month\'s newsletter intro',
                'Create an article about leave-no-trace principles',
                'Write a member spotlight template',
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    handleInputChange({ target: { value: prompt } } as React.ChangeEvent<HTMLTextAreaElement>)
                    textareaRef.current?.focus()
                  }}
                  className="rounded-lg border border-border bg-card px-4 py-2 text-left text-sm text-foreground/80 transition-colors hover:border-primary/30 hover:bg-accent"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                )}
                
                <div
                  className={`group relative max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {message.role === 'assistant' ? (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    ) : (
                      <p className="m-0">{message.content}</p>
                    )}
                  </div>
                  
                  {/* Copy Button for Assistant Messages */}
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => copyToClipboard(message.content, message.id)}
                      className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-card opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                    >
                      {copiedId === message.id ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-foreground/60" />
                      )}
                    </button>
                  )}
                </div>
                
                {message.role === 'user' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground/10">
                    <User className="h-4 w-4 text-foreground/60" />
                  </div>
                )}
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-foreground/60" />
                  <span className="text-sm text-foreground/60">Generating...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card p-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Describe the content you want to create..."
              className="min-h-[60px] resize-none pr-12"
              disabled={isLoading}
            />
            <div className="absolute bottom-2 right-2 text-xs text-foreground/40">
              ↵ to send
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              disabled={!input?.trim() || isLoading}
              className="h-[60px] w-[60px]"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </form>
        
        {enableWebSearch && (
          <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
            <Globe className="mr-1 inline h-3 w-3" />
            Web search is enabled. The AI will search for up-to-date information.
          </p>
        )}
      </div>
    </div>
  )
}
