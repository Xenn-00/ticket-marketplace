"use server";

import { ConvexHttpClient } from "convex/browser";
import { Id } from "../../convex/_generated/dataModel";
import { api } from "../../convex/_generated/api";
import { stripe } from "@/lib/stripe";

export async function RefundEventTickets(eventId: Id<"events">) {
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

  const event = await convex.query(api.events.getById, { eventId });
  if (!event) throw new Error("Event not found");

  const stripeConnectId = await convex.query(
    api.users.getUsersStripeConnectId,
    {
      userId: event.userId,
    }
  );
  if (!stripeConnectId) throw new Error("Stripe Connect ID not found");

  const tickets = await convex.query(api.tickets.getValidTicketsForEvent, {
    eventId,
  });

  const results = await Promise.allSettled(
    tickets.map(async (ticket) => {
      try {
        if (!ticket.paymentIntentId)
          throw new Error("Payment information not found");
        await stripe.refunds.create(
          {
            payment_intent: ticket.paymentIntentId,
            reason: "requested_by_customer",
          },
          { stripeAccount: stripeConnectId }
        );
        await convex.mutation(api.tickets.updateTicketStatus, {
          ticketId: ticket._id,
          status: "refunded",
        });
        return { success: true, ticketId: ticket._id };
      } catch (error) {
        console.error(`Failed to refund ticket ${ticket._id}:`, error);
        return { success: false, ticketId: ticket._id, error };
      }
    })
  );
  const allSuccessful = results.every(
    (result) => result.status === "fulfilled" && result.value.success
  );

  if (!allSuccessful) {
    throw new Error(
      "Some refunds failed. Please check the logs and try again."
    );
  }

  // Cancel the event instead of deleting it
  await convex.mutation(api.events.cancelEvent, { eventId });

  return { success: true };
}
