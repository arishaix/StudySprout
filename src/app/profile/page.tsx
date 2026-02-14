"use client";

import styles from "./page.module.css";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useStudy } from "../lib/StudyContext";
import { useTheme } from "../lib/ThemeContext";

export default function ProfilePage() {
  const { user, logout, badges } = useStudy();
  const { theme, toggleTheme } = useTheme();

  // Helper to get emoji for flower type
  const getFlowerEmoji = (type: string) => {
    switch (type) {
      case 'Sunflower': return '🌻';
      case 'Tulip': return '🌷';
      case 'Daffodil': return '🌼';
      case 'Mushroom': return '🍄';
      default: return '🍄'; // Default to Mushroom if unknown/legacy
    }
  };

  return (
    <div className={styles.container}>
      <motion.div 
        className={styles.profileHeader}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.avatarWrapper}>
          🍄
        </div>
        <h1 className={styles.username}>{user?.user_metadata?.username || user?.user_metadata?.full_name || 'Study Scholar'}</h1>
      </motion.div>

      <h2 className={styles.sectionTitle}>Harvested Flowers 🎋</h2>
      
      <div className={styles.badgeGrid}>
        {badges.length === 0 ? (
          <p style={{ gridColumn: "1/-1", textAlign: "center", color: "var(--text-light)", padding: "24px" }}>
            No flowers harvested yet. Grow a 7-day streak to harvest! 🍄
          </p>
        ) : (
          badges.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <div className={styles.badgeCard} style={{ position: "relative" }}>
                <div className={styles.badgeIcon}>{getFlowerEmoji(badge.flower_type)}</div>
                <div className={styles.badgeName}>
                  {badge.flower_type === 'Chrysanthemum' ? 'Mushroom' : badge.flower_type}
                </div>
                {badge.count > 1 && (
                  <div style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    background: "var(--primary-purple)",
                    color: "white",
                    borderRadius: "12px",
                    padding: "2px 8px",
                    fontSize: "0.75rem",
                    fontWeight: 700
                  }}>
                    {badge.count}x
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{ marginTop: "32px", marginBottom: "8px" }}
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

      <motion.div 
        className={styles.logoutWrapper}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Button variant="secondary" onClick={logout} style={{ width: "100%", marginTop: "32px", background: "rgba(255, 107, 107, 0.1)", color: "#ff6b6b", border: "1px solid rgba(255, 107, 107, 0.2)" }}>
          Log Out
        </Button>
      </motion.div>
    </div>
  );
}
