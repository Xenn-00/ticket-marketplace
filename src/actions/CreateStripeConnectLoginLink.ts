"use server";

import { stripe } from "@/lib/stripe";

export async function CreateStripeConnectLoginLink(stripeAccountId: string) {
  if (!stripeAccountId) {
    throw new Error("No stripe account Id provided");
  }

  try {
    const loginLink = await stripe.accounts.createLoginLink(stripeAccountId);
    return loginLink.url;
  } catch (error) {
    console.error("Error creating Stripe Connect Login Link: ", error);
    throw new Error("Failed to create Stripe Connect login link");
  }
}
