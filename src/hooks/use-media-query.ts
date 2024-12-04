import { useEffect, useState } from "react";

export const useMediaQuery = () => {
  const [device, setDevice] = useState<"mobile" | "desktop" | null>(null);

  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    const checkDevice = () => {
      if (window.matchMedia("(max-width: 768px)").matches) {
        setDevice("mobile");
      } else {
        setDevice("desktop");
      }
    };

    checkDevice();

    window.addEventListener("resize", checkDevice);

    return () => {
      window.removeEventListener("resize", checkDevice);
    };
  }, []);

  return {
    device,
    width: dimensions?.width,
    height: dimensions?.height,
    isMobile: device === "mobile",
    isDesktop: device === "desktop",
  };
};
