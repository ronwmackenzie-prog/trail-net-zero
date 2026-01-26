'use server'

import { redirect } from 'next/navigation'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'

export async function createCheckoutSession() {
  const headersList = await headers()
  const origin = headersList.get('origin') || 'http://localhost:3000'
  
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${origin}/?success=true`,
    cancel_url: `${origin}/?canceled=true`,
    automatic_tax: { enabled: true },
  })

  if (session.url) {
    redirect(session.url)
  }
}
