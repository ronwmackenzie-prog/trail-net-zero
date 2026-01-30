'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Archive, ArchiveRestore, Trash2, MoreVertical, Loader2 } from 'lucide-react'

interface ResourceActionsProps {
  resourceId: string
  resourceTitle: string
  isArchived: boolean
}

export function ResourceActions({ resourceId, resourceTitle, isArchived }: ResourceActionsProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const handleArchive = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('member_resources')
        .update({
          is_archived: !isArchived,
          archived_at: !isArchived ? new Date().toISOString() : null,
        })
        .eq('id', resourceId)

      if (error) throw error
      router.refresh()
    } catch (err) {
      console.error('Failed to archive resource:', err)
      alert('Failed to update resource. Please try again.')
    } finally {
      setIsLoading(false)
      setShowMenu(false)
    }
  }

  const handlePermanentDelete = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('member_resources')
        .delete()
        .eq('id', resourceId)

      if (error) throw error
      router.refresh()
    } catch (err) {
      console.error('Failed to delete resource:', err)
      alert('Failed to delete resource. Please try again.')
    } finally {
      setIsLoading(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMenu(!showMenu)}
          className="h-8 w-8 p-0"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-lg border border-border bg-card shadow-lg py-1">
              <button
                onClick={handleArchive}
                disabled={isLoading}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isArchived ? (
                  <ArchiveRestore className="h-4 w-4" />
                ) : (
                  <Archive className="h-4 w-4" />
                )}
                {isArchived ? 'Unarchive' : 'Archive'}
              </button>
              <button
                onClick={() => {
                  setShowMenu(false)
                  setShowDeleteDialog(true)
                }}
                disabled={isLoading}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete Permanently
              </button>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Resource Permanently?</DialogTitle>
            <DialogDescription>
              This will permanently delete &quot;{resourceTitle}&quot; and cannot be undone.
              All content will be lost forever.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handlePermanentDelete}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Permanently
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
