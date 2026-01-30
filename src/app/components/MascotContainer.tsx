"use client";

import styles from "./MascotContainer.module.css";
import { motion } from "framer-motion";

interface MascotProps {
  stage: "seed" | "sprout" | "flower";
  minimal?: boolean;
  animated?: boolean;
}

const STAGES = {
  seed: { 
    src: "/assets/mascots/seed_v1.png", 
    text: "Just a seed...", 
    sub: "Log output to grow!" 
  },
  sprout: { 
    src: "/assets/mascots/sprout_v1.png", 
    text: "Look! A sprout!", 
    sub: "Keep it up!" 
  },
  flower: { 
    src: "/assets/mascots/flower_v1.png", 
    text: "In full bloom!", 
    sub: "You're amazing!" 
  },
};

export default function MascotContainer({ 
  stage = "seed", 
  minimal = false,
  animated = true 
}: MascotProps) {
  const current = STAGES[stage];

  return (
    <motion.div 
      className={styles.container}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      <div className={styles.mascotWrapper}>
        <motion.div
           animate={animated ? { 
             y: [0, -10, 0],
             rotate: [0, 2, -2, 0]
           } : { y: 0, rotate: 0 }}
           transition={animated ? { 
             repeat: Infinity, 
             duration: 3,
             ease: "easeInOut" 
           } : {}}
           className={`${styles.imageWrapper} ${minimal ? styles.minimal : ""}`}
        >
          <img 
            src={current.src} 
            alt={current.text}
            style={{
              width: minimal ? '100%' : '180px',
              height: 'auto',
              maxHeight: minimal ? '100%' : '180px',
              objectFit: 'contain'
            }}
            className={styles.mascotImage}
          />
        </motion.div>
        {stage === "flower" && animated && (
           <motion.div 
             className={styles.sparkle}
             animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
             transition={{ repeat: Infinity, duration: 2 }}
           >
             ✨
           </motion.div>
        )}
      </div>
      
      {!minimal && (
        <div className={styles.status}>
          <h3>{current.text}</h3>
          <p>{current.sub}</p>
        </div>
      )}
    </motion.div>
  );
}
