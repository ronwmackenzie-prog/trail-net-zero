'use client'

import { useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

type Category = { id: string; slug: string; name: string }

export function ThreadFilters({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const sort = searchParams.get('sort') ?? 'latest'
  const category = searchParams.get('category') ?? 'all'

  const setParam = (next: Record<string, string>) => {
    const sp = new URLSearchParams(searchParams.toString())
    Object.entries(next).forEach(([k, v]) => {
      if (!v || v === 'all') sp.delete(k)
      else sp.set(k, v)
    })
    const qs = sp.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  const sorts = useMemo(
    () => [
      { key: 'latest', label: 'Latest' },
      { key: 'popular', label: 'Popular' },
      { key: 'featured', label: 'Featured' },
    ],
    [],
  )

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {sorts.map((s) => (
          <Button
            key={s.key}
            type="button"
            size="sm"
            variant={sort === s.key ? 'default' : 'outline'}
            onClick={() => setParam({ sort: s.key })}
          >
            {s.label}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-foreground/60">Category</span>
        <select
          className="h-9 rounded-md border border-border bg-background px-3 text-sm"
          value={category}
          onChange={(e) => setParam({ category: e.target.value })}
        >
          <option value="all">All</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

