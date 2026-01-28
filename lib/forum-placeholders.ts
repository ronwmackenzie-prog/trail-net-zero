export type PlaceholderThread = {
  title: string
  meta: string
  pinned?: boolean
  locked?: boolean
}

export type PlaceholderThreadWithCategory = PlaceholderThread & {
  key: string
  categorySlug: string
  categoryName: string
  // synthetic numbers for UI demos
  replies: number
  lastActivityAt: string
}

const byCategorySlug: Record<string, PlaceholderThread[]> = {
  'race-operations': [
    {
      title: 'Reusable cup systems: vendor options, staffing, and wash logistics',
      meta: 'Example · Ops playbook',
      pinned: true,
    },
    {
      title: 'Aid station waste audit template (share your columns + cadence)',
      meta: 'Example · Template request',
    },
    {
      title: 'Course marking: compostable tape vs reusable signage (field results)',
      meta: 'Example · Field test',
    },
  ],
  'apparel-footwear': [
    {
      title: 'Recycled nylon claims: what documentation do you require from mills?',
      meta: 'Example · Sourcing due diligence',
      pinned: true,
    },
    {
      title: 'Repair programs: what incentives actually move return rates?',
      meta: 'Example · Circularity',
    },
    {
      title: 'Durability testing: lightweight trail uppers (protocols + failure modes)',
      meta: 'Example · Methods',
    },
  ],
  'sports-nutrition': [
    {
      title: 'Gel packet alternatives: reusable flasks, bulk dispensers, or paper?',
      meta: 'Example · Pilot',
      pinned: true,
    },
    {
      title: 'On-course food sourcing: local vendors without increasing waste',
      meta: 'Example · Ops + nutrition',
    },
    {
      title: 'Volunteer guidance: sorting rules that reduce contamination',
      meta: 'Example · Training',
    },
  ],
  'land-stewardship': [
    {
      title: 'Trail erosion monitoring: low-cost protocols and repeatability tips',
      meta: 'Example · Measurement',
      pinned: true,
    },
    {
      title: 'Permit conditions checklist: common environmental requirements',
      meta: 'Example · Compliance',
    },
    {
      title: 'Restoration partners: how do you structure post-race trail work days?',
      meta: 'Example · Collaboration',
    },
  ],
  'data-standards': [
    {
      title: 'Emissions boundaries: what do you include for race day calculations?',
      meta: 'Example · Standardization',
      pinned: true,
    },
    {
      title: 'Shared spreadsheet schema for vendor footprints (fields + units)',
      meta: 'Example · Data model',
    },
    {
      title: 'Evidence bar for claims: what counts as “verified” in community posts?',
      meta: 'Example · Policy',
    },
  ],
  'working-groups': [
    {
      title: 'Working Group kickoff: suggested agenda + success metrics',
      meta: 'Example · Facilitation',
      pinned: true,
      locked: true,
    },
    {
      title: 'Pilot proposal template (scope, budget, stakeholders, measurement)',
      meta: 'Example · Template',
    },
    {
      title: 'Monthly update format: what do you want to see from each group?',
      meta: 'Example · Reporting',
    },
  ],
}

export function getPlaceholderThreadsForCategory(slug: string): PlaceholderThread[] {
  return byCategorySlug[slug] ?? []
}

export function getPlaceholderThreadsForForum(categories: { slug: string; name: string }[]) {
  const now = Date.now()
  const catNameBySlug = new Map(categories.map((c) => [c.slug, c.name]))

  const all: PlaceholderThreadWithCategory[] = []
  Object.entries(byCategorySlug).forEach(([categorySlug, threads]) => {
    const categoryName = catNameBySlug.get(categorySlug) ?? categorySlug
    threads.forEach((t, idx) => {
      // deterministic-ish demo numbers
      const replies = t.pinned ? 18 - idx * 2 : 6 + idx * 3
      const hoursAgo = t.pinned ? 3 + idx * 6 : 8 + idx * 10
      all.push({
        ...t,
        key: `placeholder:${categorySlug}:${idx}`,
        categorySlug,
        categoryName,
        replies: Math.max(replies, 0),
        lastActivityAt: new Date(now - hoursAgo * 60 * 60 * 1000).toISOString(),
      })
    })
  })

  return all
}

