"use client";

import { motion } from "framer-motion";
import styles from "./LoadingOverlay.module.css";

export default function LoadingOverlay() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={styles.overlay}
    >
      <div className={styles.loaderContainer}>
        <div className={styles.spinner} />
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={styles.loadingText}
        >
          <span>Loading...</span>
        </motion.div>
      </div>
    </motion.div>
  );
}
