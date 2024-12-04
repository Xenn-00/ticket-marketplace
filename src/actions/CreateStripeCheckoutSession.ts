"use server";

import { stripe } from "@/lib/stripe";
import { Id } from "../../convex/_generated/dataModel";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { DURATIONS } from "../../convex/constants";
import baseUrl from "@/lib/baseUrl";

export type StripeCheckoutMetadata = {
  eventId: Id<"events">;
  userId: string;
  waitingListId: Id<"waitingList">;
};

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function CreateStripeCheckoutSession({
  eventId,
}: {
  eventId: Id<"events">;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const event = await convex.query(api.events.getById, { eventId });
  if (!event) throw new Error("Event not found");

  const queuePosition = await convex.query(api.waitingList.getQueuePosition, {
    eventId,
    userId,
  });
  if (!queuePosition || queuePosition.status !== "offered") {
    throw new Error("No valid ticket offer found");
  }

  const stripeConnectId = await convex.query(
    api.users.getUsersStripeConnectId,
    { userId: event.userId }
  );

  if (!stripeConnectId) {
    throw new Error("Stripe Connect Id not found for owner of the event!");
  }

  if (!queuePosition.offerExpiresAt) {
    throw new Error("Ticket offer has no expiration date");
  }

  const metadata: StripeCheckoutMetadata = {
    eventId,
    userId,
    waitingListId: queuePosition._id,
  };

  const session = await stripe.checkout.sessions.create(
    {
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: event.name,
              description: event.description,
            },
            unit_amount: Math.round(event.price * 100),
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: Math.round(event.price * 100 * 0.01),
      },
      expires_at: Math.floor(Date.now() / 1000) + DURATIONS.TICKET_OFFER / 1000,
      mode: "payment",
      success_url: `${baseUrl}/tickets/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/event/${eventId}`,
      metadata,
    },
    {
      stripeAccount: stripeConnectId,
    }
  );
  return { sessionId: session.id, sessionUrl: session.url };
}
