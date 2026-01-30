"use client";

import styles from "./page.module.css";
import Button from "./components/ui/Button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import MascotContainer from "./components/MascotContainer";

export default function Home() {
  return (
    <main className={styles.main}>
      <motion.div 
        className={styles.hero}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.illustration}>
          <MascotContainer stage="sprout" minimal={true} />
        </div>
        
        <h1 className={styles.title}>
          Grow your <span className={styles.highlight}>consistency</span>
        </h1>
        
        <p className={styles.subtitle}>
          StudySprout helps you build habits with friends. 
          Plant seeds, track streaks, and watch them bloom!
        </p>

        <div className={styles.ctaGroup}>
          <Link href="/auth/signup">
            <Button>
              Start Growing <ArrowRight size={20} />
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
