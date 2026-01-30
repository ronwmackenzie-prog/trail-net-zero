'use client'

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
  Trash2,
  FilePlus,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function AIChat() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [enableWebSearch, setEnableWebSearch] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll within container when new messages arrive (not the page)
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  // Send message to API
  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim() || isLoading) return;

      // Add user message
      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: userMessage.trim(),
      };

      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput("");
      setIsLoading(true);

      // Create assistant message placeholder
      const assistantId = `assistant-${Date.now()}`;
      const assistantMsg: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
      };
      setMessages([...newMessages, assistantMsg]);

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/admin/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: newMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            enableWebSearch,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);

                // Handle text delta events from OpenAI Responses API
                if (parsed.type === "response.output_text.delta") {
                  fullContent += parsed.delta;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId ? { ...m, content: fullContent } : m,
                    ),
                  );
                }
              } catch {
                // Try to parse as plain text chunk (fallback)
                if (line.startsWith("0:")) {
                  try {
                    const text = JSON.parse(line.slice(2));
                    fullContent += text;
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === assistantId
                          ? { ...m, content: fullContent }
                          : m,
                      ),
                    );
                  } catch {
                    // Skip unparseable lines
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          // Request was aborted, that's okay
        } else {
          console.error("Chat error:", error);
          // Update the assistant message with error
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content: "Sorry, an error occurred. Please try again.",
                  }
                : m,
            ),
          );
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [messages, isLoading, enableWebSearch],
  );

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Copy message content to clipboard
  const copyToClipboard = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Clear conversation
  const clearConversation = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([]);
  };

  // Convert markdown to HTML for the resource editor
  const markdownToHtml = (md: string): string => {
    if (!md) return "";
    return md
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, "<code>$1</code>")
      .replace(/^\> (.*$)/gim, "<blockquote>$1</blockquote>")
      .replace(/^\- (.*$)/gim, "<li>$1</li>")
      .replace(/^\d+\. (.*$)/gim, "<li>$1</li>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br />")
      .replace(/^(?!<[hblop])(.*)/gm, (match) => {
        if (match.trim() && !match.startsWith("<")) {
          return `<p>${match}</p>`;
        }
        return match;
      });
  };

  // Get all assistant message content combined
  const getAssistantContent = (): string => {
    return messages
      .filter((m) => m.role === "assistant" && m.content)
      .map((m) => m.content)
      .join("\n\n");
  };

  // Create new resource with AI content
  const createNewResource = () => {
    const content = getAssistantContent();
    if (!content) return;

    // Convert markdown to HTML
    const htmlContent = markdownToHtml(content);

    // Store in sessionStorage for the new resource page to pick up
    sessionStorage.setItem("ai_resource_content", htmlContent);
    sessionStorage.setItem("ai_resource_markdown", content);

    // Navigate to new resource page
    router.push("/forum/admin/resources/new?from=ai");
  };

  // Check if we have any assistant content
  const hasAssistantContent = messages.some(
    (m) => m.role === "assistant" && m.content,
  );

  return (
    <div className="flex h-full flex-col">
      {/* Chat Header with Controls */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              AI Content Assistant
            </h3>
            <p className="text-xs text-foreground/60">GPT-4.1</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Create Resource Button */}
          {hasAssistantContent && (
            <Button
              variant="default"
              size="sm"
              onClick={createNewResource}
              className="h-8 gap-1.5"
            >
              <FilePlus className="h-3.5 w-3.5" />
              Create Resource
            </Button>
          )}

          {/* Web Search Toggle */}
          <button
            onClick={() => setEnableWebSearch(!enableWebSearch)}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              enableWebSearch
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                : "bg-muted text-foreground/60 hover:text-foreground"
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            Web Search {enableWebSearch ? "On" : "Off"}
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
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              What would you like to create?
            </h3>
            <p className="max-w-md text-sm text-foreground/60">
              I can help you write articles, blog posts, newsletters, social
              media content, and more. Just describe what you need!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                )}

                <div
                  className={`group relative max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-headings:mt-4 prose-headings:mb-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-code:bg-foreground/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-foreground/5 prose-pre:border prose-pre:border-border">
                      {message.content ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        <span className="text-foreground/40">...</span>
                      )}
                    </div>
                  ) : (
                    <p className="m-0">{message.content}</p>
                  )}

                  {/* Copy Button for Assistant Messages */}
                  {message.role === "assistant" && message.content && (
                    <button
                      onClick={() =>
                        copyToClipboard(message.content, message.id)
                      }
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

                {message.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground/10">
                    <User className="h-4 w-4 text-foreground/60" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && messages[messages.length - 1]?.content === "" && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-foreground/60" />
                  <span className="text-sm text-foreground/60">
                    {enableWebSearch
                      ? "Searching & generating..."
                      : "Generating..."}
                  </span>
                </div>
              </div>
            )}
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
              onChange={(e) => setInput(e.target.value)}
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
              disabled={!input.trim() || isLoading}
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
            Web search is enabled. The AI will search for up-to-date
            information.
          </p>
        )}
      </div>
    </div>
  );
}
