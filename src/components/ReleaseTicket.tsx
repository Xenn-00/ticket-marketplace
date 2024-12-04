"use client";
import React, { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import { Circle } from "lucide-react";
import { Modal } from "./ui/modal";
import { useMediaQuery } from "@/hooks/use-media-query";

function ReleaseTicket({
  eventId,
  waitingListId,
}: Readonly<{
  eventId: Id<"events">;
  waitingListId: Id<"waitingList">;
}>) {
  const [releaseTicketOffer, setReleaseTicketOffer] = useState<boolean>(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const releaseTicket = useMutation(api.waitingList.releaseTicket);
  const { isMobile } = useMediaQuery();

  const handleReleasing = async () => {
    try {
      setIsReleasing(true);
      await releaseTicket({
        eventId,
        waitingListId,
      });
    } catch (error) {
      console.error("Error when releasing ticket:", error);
    } finally {
      setIsReleasing(false);
    }
  };
  return (
    <>
      <Button
        onClick={() => setReleaseTicketOffer(true)}
        disabled={isReleasing}
        className="mt-2 w-full flex items-center justify-center gap-2 py-2 px-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Circle className="w-4 h-4" />
        Release Ticket Offer
      </Button>
      <Modal
        showModal={releaseTicketOffer}
        setShowModal={() => setReleaseTicketOffer(false)}
        className="max-w-md p-8"
        title="Release ticket offer"
      >
        <div className="space-y-6">
          <div>
            {!isMobile && (
              <h2 className="text-lg/7 font-medium tracking-tight text-gray-950">
                Release ticket offer
              </h2>
            )}
            <p className="text-sm/6 text-gray-600">
              Are you sure you want to{" "}
              <span className="font-semibold text-red-600">release</span> the
              ticket offer? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end space-x-3 border-t pt-4">
            <Button
              variant={"outline"}
              onClick={() => setReleaseTicketOffer(false)}
            >
              Cancel
            </Button>
            <Button
              variant={"destructive"}
              onClick={handleReleasing}
              disabled={isReleasing}
            >
              <Circle className="w-4 h-4" />
              {isReleasing ? "Releasing..." : "Release Ticker Offer"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default ReleaseTicket;
