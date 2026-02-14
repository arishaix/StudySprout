"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useStudy } from "../lib/StudyContext";

export default function NotificationToast() {
  const { notification } = useStudy();

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 20, x: "-50%" }}
          style={{
            position: "fixed",
            bottom: "40px",
            left: "50%",
            background: "var(--primary-purple)",
            color: "white",
            padding: "12px 24px",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(167, 139, 250, 0.4)",
            zIndex: 9999,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            pointerEvents: "none"
          }}
        >
          <Sparkles size={18} />
          {notification}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
