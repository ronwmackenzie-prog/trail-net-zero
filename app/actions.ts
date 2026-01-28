'use server'

import { redirect } from 'next/navigation'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";

export async function createCheckoutSession() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Require authentication before starting checkout
  if (!user) {
    redirect("/auth/sign-in?redirect=/forum");
  }

  const headersList = await headers()
  const origin = headersList.get('origin') || 'http://localhost:3000'
  
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1,
      },
    ],
    mode: "subscription",
    client_reference_id: user.id,
    metadata: {
      supabase_user_id: user.id,
      email: user.email ?? "",
    },
    success_url: `${origin}/?success=true`,
    cancel_url: `${origin}/?canceled=true`,
    automatic_tax: { enabled: true },
  });

  if (session.url) {
    redirect(session.url)
  }
}

export async function createBillingPortalSession() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?redirect=/account");
  }

  const headersList = await headers();
  const origin = headersList.get("origin") || "http://localhost:3000";

  const { data: customer, error } = await supabase
    .from("stripe_customers")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !customer?.stripe_customer_id) {
    // If we can't find a customer, send them to join section.
    redirect("/#join");
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customer.stripe_customer_id,
    return_url: `${origin}/account`,
  });

  redirect(portalSession.url);
}
