"use server";

import { auth } from "@clerk/nextjs/server";
import { ConvexClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
}

const convex = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function GetStripeConnectAccount() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const stripeConnectId = await convex.query(
    api.users.getUsersStripeConnectId,
    { userId }
  );

  return {
    stripeConnectId: stripeConnectId && null,
  };
}
