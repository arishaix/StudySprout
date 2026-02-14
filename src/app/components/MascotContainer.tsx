"use client";

import styles from "./MascotContainer.module.css";
import { motion } from "framer-motion";

interface MascotProps {
  stage: "seed" | "sprout" | "flower" | "tulip" | "daffodil" | "mushroom";
  minimal?: boolean;
  animated?: boolean;
  hideStatus?: boolean;
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
    text: "Sunflower in bloom!", 
    sub: "Week 1 Reward! 🌻",
    style: {} 
  },
  tulip: { 
    src: "/assets/mascots/tulip.jpg", 
    text: "Tulip in bloom!", 
    sub: "Week 2 Reward! 🌷",
    style: { borderRadius: "20px" } // Add radius since it's a JPG card style likely
  },
  daffodil: { 
    src: "/assets/mascots/daffodil.jpg", 
    text: "Daffodil in bloom!", 
    sub: "Week 3 Reward! 🌼",
    style: { borderRadius: "20px" }
  },
  mushroom: { 
    src: "/assets/mascots/mushroom.jpg", 
    text: "Mushroom sprout!", 
    sub: "Week 4 Reward! 🍄",
    style: { borderRadius: "20px" }
  },
};

export default function MascotContainer({ 
  stage = "seed", 
  minimal = false,
  animated = true,
  hideStatus = false
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
                objectFit: 'contain',
                ...(current as any).style // Apply the filter
              }}
              className={styles.mascotImage}
            />
        </motion.div>
        {["flower", "tulip", "daffodil", "mushroom"].includes(stage) && animated && (
           <motion.div 
             className={styles.sparkle}
             animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
             transition={{ repeat: Infinity, duration: 2 }}
           >
             ✨
           </motion.div>
        )}
      </div>
      
      {!minimal && !hideStatus && (
        <div className={styles.status}>
          <h3>{current.text}</h3>
          <p>{current.sub}</p>
        </div>
      )}
    </motion.div>
  );
}
