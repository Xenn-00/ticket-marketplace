"use client";
import React, { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import { Ban } from "lucide-react";
import { RefundEventTickets } from "@/actions/RefundEventTicket";
import { Modal } from "./ui/modal";
import { useMediaQuery } from "@/hooks/use-media-query";

function CancelEventButton({ eventId }: Readonly<{ eventId: Id<"events"> }>) {
  const [cancel, setCancel] = useState(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();
  const cancelEvent = useMutation(api.events.cancelEvent);

  const { isMobile } = useMediaQuery();

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await RefundEventTickets(eventId);
      await cancelEvent({ eventId });
      toast({
        title: "Event cancelled",
        description: "All tickets have been refunded successfully.",
      });
      router.push("/seller/events");
    } catch (error) {
      console.error("Failed to cancel event:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel event. Please try again.",
      });
    } finally {
      setIsCancelling(false);
    }
  };
  return (
    <>
      <Button
        onClick={() => setCancel(true)}
        disabled={isCancelling}
        variant={"destructive"}
        className="rounded-xl"
      >
        <Ban className="w-4 h-4" />
        <span>{isCancelling ? "Processing..." : "Cancel Event"}</span>
      </Button>
      <Modal
        showModal={cancel}
        setShowModal={() => setCancel(false)}
        className="max-w-md p-8"
      >
        <div className="space-y-6">
          <div>
            {!isMobile && (
              <h2 className="text-lg/7 font-medium tracking-tight text-gray-950">
                Cancel Event
              </h2>
            )}
            <p className="text-sm/6 text-gray-600">
              Are you sure you want to{" "}
              <span className="font-semibold text-red-600">cancel</span> the
              event? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end space-x-3 border-t pt-4">
            <Button variant={"outline"} onClick={() => setCancel(false)}>
              Cancel
            </Button>
            <Button
              variant={"destructive"}
              onClick={handleCancel}
              disabled={isCancelling}
            >
              <Ban className="w-4 h-4" />
              {isCancelling ? "Releasing..." : "Release Ticker Offer"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default CancelEventButton;
