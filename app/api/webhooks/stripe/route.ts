import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('Stripe-Signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    
    // Retrieve possible subscription details
    if (session.subscription) {
       // const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
       console.log('Subscription created:', session.subscription)
    }

    // Provision access
    console.log(`Payment successful for session: ${session.id}`)
  }

  return new NextResponse(null, { status: 200 })
}
