'use client'

import { useSearchParams } from 'next/navigation'
import { SuccessMessage } from './success-message'

export function SuccessWrapper() {
  const searchParams = useSearchParams()
  const showSuccess = searchParams?.get('success') === 'true'

  if (!showSuccess) return null

  return <SuccessMessage />
}
