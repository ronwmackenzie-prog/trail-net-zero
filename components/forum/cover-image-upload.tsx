'use client'

import { useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ImagePlus, Trash2, Upload, Loader2 } from 'lucide-react'

interface CoverImageUploadProps {
  value: string | null
  onChange: (url: string | null) => void
  disabled?: boolean
}

export function CoverImageUpload({ value, onChange, disabled = false }: CoverImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = useCallback(
    async (file: File) => {
      if (disabled) return

      setError(null)

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a JPEG, PNG, GIF, or WebP image.')
        return
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be smaller than 5MB.')
        return
      }

      setUploading(true)

      try {
        const supabase = createClient()

        // Generate unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
        const filePath = `covers/${fileName}`

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('resource-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          throw uploadError
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('resource-images')
          .getPublicUrl(filePath)

        onChange(urlData.publicUrl)
      } catch (err) {
        console.error('Upload error:', err)
        setError('Failed to upload image. Please try again.')
      } finally {
        setUploading(false)
      }
    },
    [disabled, onChange]
  )

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleRemove = async () => {
    if (!value || disabled) return

    // Extract file path from URL to delete from storage
    try {
      const url = new URL(value)
      const pathParts = url.pathname.split('/resource-images/')
      if (pathParts[1]) {
        const supabase = createClient()
        await supabase.storage.from('resource-images').remove([pathParts[1]])
      }
    } catch {
      // If URL parsing fails, just clear the value
    }

    onChange(null)
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-foreground">
        Cover Image
      </label>

      {value ? (
        <div className="relative group">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted">
            <img
              src={value}
              alt="Cover preview"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || disabled}
            >
              <Upload className="h-4 w-4 mr-1.5" />
              Replace
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              disabled={uploading || disabled}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'relative flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors',
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-muted/50',
            disabled && 'opacity-50 cursor-not-allowed',
            uploading && 'pointer-events-none'
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <p className="text-sm text-foreground/70">Uploading...</p>
            </>
          ) : (
            <>
              <ImagePlus className="h-10 w-10 text-foreground/40" />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-foreground/60 mt-1">
                  JPEG, PNG, GIF, or WebP (max 5MB)
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <p className="text-xs text-foreground/60">
        A cover image will be shown in the resources list and at the top of the article.
      </p>
    </div>
  )
}
