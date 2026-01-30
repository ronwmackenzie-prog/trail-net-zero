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
import {
  Archive,
  ArchiveRestore,
  Trash2,
  MoreVertical,
  Loader2,
  Pin,
  PinOff,
  Lock,
  Unlock,
} from 'lucide-react'

interface ThreadActionsProps {
  threadId: string
  threadTitle: string
  isArchived: boolean
  isPinned: boolean
  isLocked: boolean
  isDeleted: boolean
}

export function ThreadActions({
  threadId,
  threadTitle,
  isArchived,
  isPinned,
  isLocked,
  isDeleted,
}: ThreadActionsProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const handleArchive = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('forum_threads')
        .update({
          is_archived: !isArchived,
          archived_at: !isArchived ? new Date().toISOString() : null,
        })
        .eq('id', threadId)

      if (error) throw error
      router.refresh()
    } catch (err) {
      console.error('Failed to archive thread:', err)
      alert('Failed to update thread. Please try again.')
    } finally {
      setIsLoading(false)
      setShowMenu(false)
    }
  }

  const handleTogglePin = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('forum_threads')
        .update({ is_pinned: !isPinned })
        .eq('id', threadId)

      if (error) throw error
      router.refresh()
    } catch (err) {
      console.error('Failed to toggle pin:', err)
      alert('Failed to update thread. Please try again.')
    } finally {
      setIsLoading(false)
      setShowMenu(false)
    }
  }

  const handleToggleLock = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('forum_threads')
        .update({ is_locked: !isLocked })
        .eq('id', threadId)

      if (error) throw error
      router.refresh()
    } catch (err) {
      console.error('Failed to toggle lock:', err)
      alert('Failed to update thread. Please try again.')
    } finally {
      setIsLoading(false)
      setShowMenu(false)
    }
  }

  const handleSoftDelete = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('forum_threads')
        .update({ is_deleted: !isDeleted })
        .eq('id', threadId)

      if (error) throw error
      router.refresh()
    } catch (err) {
      console.error('Failed to delete thread:', err)
      alert('Failed to update thread. Please try again.')
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
        .from('forum_threads')
        .delete()
        .eq('id', threadId)

      if (error) throw error
      router.refresh()
    } catch (err) {
      console.error('Failed to permanently delete thread:', err)
      alert('Failed to delete thread. Please try again.')
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
            <div className="absolute right-0 top-full mt-1 z-50 w-52 rounded-lg border border-border bg-card shadow-lg py-1">
              {/* Pin/Unpin */}
              <button
                onClick={handleTogglePin}
                disabled={isLoading}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors disabled:opacity-50"
              >
                {isPinned ? (
                  <>
                    <PinOff className="h-4 w-4" />
                    Unpin thread
                  </>
                ) : (
                  <>
                    <Pin className="h-4 w-4" />
                    Pin thread
                  </>
                )}
              </button>

              {/* Lock/Unlock */}
              <button
                onClick={handleToggleLock}
                disabled={isLoading}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors disabled:opacity-50"
              >
                {isLocked ? (
                  <>
                    <Unlock className="h-4 w-4" />
                    Unlock thread
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Lock thread
                  </>
                )}
              </button>

              <div className="border-t border-border my-1" />

              {/* Archive/Unarchive */}
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

              {/* Soft Delete / Restore */}
              <button
                onClick={handleSoftDelete}
                disabled={isLoading}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors disabled:opacity-50 ${
                  !isDeleted ? 'text-amber-600 dark:text-amber-400' : ''
                }`}
              >
                {isDeleted ? (
                  <>
                    <ArchiveRestore className="h-4 w-4" />
                    Restore thread
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Soft delete
                  </>
                )}
              </button>

              <div className="border-t border-border my-1" />

              {/* Permanent Delete */}
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
            <DialogTitle>Delete Thread Permanently?</DialogTitle>
            <DialogDescription>
              This will permanently delete &quot;{threadTitle}&quot; and all its posts.
              This action cannot be undone.
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
