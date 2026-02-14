"use client";

import { useStudy } from "../lib/StudyContext";
import LoadingOverlay from "./ui/LoadingOverlay";
import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function LoaderWrapper({ children }: { children: React.ReactNode }) {
  const { isLoading, setIsLoading } = useStudy();
  const pathname = usePathname();

  useEffect(() => {
    // Show loader on route change
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800); // Smooth 800ms transition

    return () => clearTimeout(timer);
  }, [pathname, setIsLoading]);

  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingOverlay />}
      </AnimatePresence>
      {children}
    </>
  );
}
