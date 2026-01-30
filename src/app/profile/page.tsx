"use client";

import styles from "./page.module.css";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { User, Award, Flame, Timer, Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useStudy } from "../lib/StudyContext";
import { useTheme } from "../lib/ThemeContext";

export default function ProfilePage() {
  const { streak, totalMinutes } = useStudy();
  const { theme, toggleTheme } = useTheme();

  const harvestedPlants = [
    { id: 1, name: "First Tulip", emoji: "🌷", date: "Jan 7, 2026" },
    { id: 2, name: "Sakura Bloom", emoji: "🌸", date: "Jan 14, 2026" },
    { id: 3, name: "Sunny Day", emoji: "🌻", date: "Jan 21, 2026" },
    { id: 4, name: "Royal Rose", emoji: "🌹", date: "Jan 28, 2026" },
  ];

  const totalHours = (totalMinutes / 60).toFixed(1);

  return (
    <div className={styles.container}>
      <motion.div 
        className={styles.profileHeader}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.avatarWrapper}>
          👤
        </div>
        <h1 className={styles.username}>Study Scholar</h1>
        <p className={styles.bio}>Cultivating a better mind, one sprout at a time. 🌱</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ marginBottom: "24px" }}
      >
        <Card className={styles.statCard} style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: "16px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ fontSize: "1.5rem" }}>{theme === "light" ? "☀️" : "🌙"}</div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 800 }}>{theme === "light" ? "Light Mode" : "Dark Mode"}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-light)" }}>Easy on the eyes</div>
            </div>
          </div>
          <Button variant="primary" onClick={toggleTheme} style={{ padding: "8px 16px" }}>
            Switch {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </Button>
        </Card>
      </motion.div>

      <div className={styles.statsGrid}>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={styles.statCard}>
            <div className={styles.statValue}>{streak}</div>
            <div className={styles.statLabel}>Days Streak</div>
          </Card>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className={styles.statCard}>
            <div className={styles.statValue}>{totalHours}h</div>
            <div className={styles.statLabel}>Total Focus</div>
          </Card>
        </motion.div>
      </div>

      <h2 className={styles.sectionTitle}>Harvested Garden 🎋</h2>
      
      <div className={styles.badgeGrid}>
        {harvestedPlants.map((plant, index) => (
          <motion.div
            key={plant.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <div className={styles.badgeCard}>
              <div className={styles.badgeIcon}>{plant.emoji}</div>
              <div className={styles.badgeName}>{plant.name}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
