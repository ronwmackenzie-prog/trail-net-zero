import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  // If admin client is not configured, just acknowledge the event
  if (!supabaseAdmin) {
    console.warn(
      "Supabase admin client not configured; skipping membership sync.",
    );
    return new NextResponse(null, { status: 200 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const supabaseUserId =
          session.metadata?.supabase_user_id ||
          session.client_reference_id ||
          null;
        const customerId = (session.customer as string | null) ?? null;
        const subscriptionId = (session.subscription as string | null) ?? null;

        if (supabaseUserId && customerId) {
          await supabaseAdmin.from("stripe_customers").upsert(
            {
              user_id: supabaseUserId,
              stripe_customer_id: customerId,
            },
            { onConflict: "user_id" },
          );
        }

        if (supabaseUserId && subscriptionId) {
          // Cast to any to avoid Stripe type coupling here; we only read a few fields.
          const subscription = (await stripe.subscriptions.retrieve(
            subscriptionId,
          )) as any;
          const price = Array.isArray(subscription.items?.data)
            ? subscription.items.data[0]?.price
            : null;

          await supabaseAdmin.from("stripe_subscriptions").upsert(
            {
              stripe_subscription_id: subscription.id,
              user_id: supabaseUserId,
              status: subscription.status,
              price_id: price?.id ?? null,
              current_period_end: subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000).toISOString()
                : null,
              cancel_at_period_end: subscription.cancel_at_period_end ?? false,
            },
            { onConflict: "stripe_subscription_id" },
          );
        }

        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        const supabaseUserId =
          (subscription.metadata as any)?.supabase_user_id ?? null;

        // We rely primarily on checkout.session.completed to link user_id,
        // but if metadata is present on the subscription, upsert here as well.
        if (supabaseUserId) {
          const price = Array.isArray(subscription.items?.data)
            ? subscription.items.data[0]?.price
            : null;

          await supabaseAdmin.from("stripe_subscriptions").upsert(
            {
              stripe_subscription_id: subscription.id,
              user_id: supabaseUserId,
              status: subscription.status,
              price_id: price?.id ?? null,
              current_period_end: subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000).toISOString()
                : null,
              cancel_at_period_end: subscription.cancel_at_period_end ?? false,
            },
            { onConflict: "stripe_subscription_id" },
          );
        } else {
          // Fallback: update subscription status by id only (no user_id changes)
          await supabaseAdmin
            .from("stripe_subscriptions")
            .update({
              status: subscription.status,
              current_period_end: subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000).toISOString()
                : null,
              cancel_at_period_end: subscription.cancel_at_period_end ?? false,
            })
            .eq("stripe_subscription_id", subscription.id);
        }

        break;
      }
      default:
        // For other events we don't need to do anything yet.
        break;
    }
  } catch (error) {
    console.error("Error handling Stripe webhook event", event.type, error);
    return new NextResponse("Webhook handler error", { status: 500 });
  }

  return new NextResponse(null, { status: 200 });
}
