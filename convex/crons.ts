import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "cleanup-expired-offers",
  { minutes: 1 },
  internal.waitingList.cleanupExpiredOffers
);

export default crons;
