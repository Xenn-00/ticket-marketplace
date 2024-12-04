import { StripeCheckoutMetadata } from "@/actions/CreateStripeCheckoutSession";
import { stripe } from "@/lib/stripe";
import { ConvexClient } from "convex/browser";
import { headers } from "next/headers";
import Stripe from "stripe";
import { api } from "../../../../../convex/_generated/api";

export async function POST(req: Request) {
  const convex = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  const body = await req.text();
  const headerList = await headers();
  const signature = headerList.get("stripe-signature") as string;

  console.log("Webhook signature: ", signature ? "Present" : "Missing");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log("Webhook secret constructed successfully:", event.type);
  } catch (error) {
    return new Response(`Webhook Error: ${(error as Error).message}`, {
      status: 400,
    });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const metadata = session.metadata as StripeCheckoutMetadata;

    try {
      const result = await convex.mutation(api.events.purchaseTicket, {
        eventId: metadata.eventId,
        userId: metadata.userId,
        waitingListId: metadata.waitingListId,
        paymentInfo: {
          paymentIntentId: session.payment_intent as string,
          amount: session.amount_total ?? 0,
        },
      });
      console.log("Purchase ticket mutation completed:", result);
    } catch (error) {
      return new Response("Error processing webhook", { status: 500 });
    }
  }

  return new Response(null, { status: 200 });
}
