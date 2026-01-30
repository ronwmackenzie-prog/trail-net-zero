'use client'

import { useEffect, useState } from 'react'
import { ResourceEditor } from './resource-editor'
import { Sparkles, X } from 'lucide-react'

interface NewResourceWrapperProps {
  fromAI: boolean
}

export function NewResourceWrapper({ fromAI }: NewResourceWrapperProps) {
  const [showAIBanner, setShowAIBanner] = useState(false)
  const [hasAIContent, setHasAIContent] = useState(false)

  useEffect(() => {
    // Check if there's AI content in sessionStorage
    const aiContent = sessionStorage.getItem('ai_resource_content')
    if (aiContent && fromAI) {
      setShowAIBanner(true)
      setHasAIContent(true)
    }
  }, [fromAI])

  return (
    <>
      {/* AI Content Banner */}
      {showAIBanner && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">AI-Generated Content Loaded</p>
            <p className="text-sm text-foreground/70">
              Review and edit the content below, then add a title and publish when ready.
            </p>
          </div>
          <button
            onClick={() => setShowAIBanner(false)}
            className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
          >
            <X className="h-4 w-4 text-foreground/60" />
          </button>
        </div>
      )}

      <ResourceEditor
        initial={{
          slug: "",
          title: "",
          excerpt: "",
          body: "",
          external_url: "",
          cover_image: "",
          kind: "article",
          is_published: false,
          is_archived: false,
        }}
      />
    </>
  )
}
