"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Clock, TrendingUp, Plus, History, Pencil, Trash2, Sparkles, Twitter, Feather } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import MascotContainer from "../components/MascotContainer";
import QuickLogModal from "../components/ui/QuickLogModal";
import GhostwriterModal from "../components/ui/GhostwriterModal";
import AddActivityModal from "../components/ui/AddActivityModal";
import { useStudy } from "../lib/StudyContext";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function Dashboard() {
  const router = useRouter();
  const { 
    user, streak, totalMinutes, plantStage, activities, logs, lastTweetDraft, isTodayLogged,
    addActivity, deleteActivity, updateActivity, updateTweetDraft, harvestFlower,
    manualStreak, setManualStreak, isHarvesting, isAdmin
  } = useStudy();
  
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isGhostwriterModalOpen, setIsGhostwriterModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<{id: string, title: string} | null>(null);

  if (!user) {
    return null;
  }
  
  // Get yesterday's date string
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  // Filter logs for "yesterday" (or last 24h for mock simplicity)
  const yesterdayLogs = logs.filter(log => new Date(log.date).toDateString() === yesterdayStr);
  const yesterdayMinutes = yesterdayLogs.reduce((acc, curr) => acc + curr.minutes, 0);

  const handleAddSubmit = (title: string) => {
    if (editingActivity) {
      updateActivity(editingActivity.id, title);
      setEditingActivity(null);
    } else {
      addActivity(title);
    }
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", gap: "20px", flexWrap: "wrap" }}>
          <div>
            <h1 className={styles.greeting}>
              Welcome, {user.user_metadata?.username || user.user_metadata?.full_name || 'Scholar'}! 🍄
            </h1>
          </div>
          
          {/* Mascot Tester (Admin Only) */}
          {isAdmin && (
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "10px", 
              background: "var(--glass-bg)", 
              padding: "8px 16px", 
              borderRadius: "12px", 
              border: "1px solid var(--primary-purple)",
              backdropFilter: "blur(4px)"
            }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-light)", textTransform: "uppercase" }}>Admin Tools:</span>
              <input 
                type="range" 
                min="0" 
                max="30" 
                value={manualStreak ?? streak} 
                onChange={(e) => setManualStreak(parseInt(e.target.value))}
                style={{ accentColor: "var(--primary-purple)", width: "100px", cursor: "pointer" }}
              />
              <span style={{ fontWeight: 800, color: "var(--primary-purple)", fontSize: "0.9rem" }}>{manualStreak ?? streak}</span>
              {manualStreak !== null && (
                <button 
                  onClick={() => setManualStreak(null)}
                  style={{ 
                    background: "none", 
                    border: "none", 
                    color: "#ff6b6b", 
                    cursor: "pointer", 
                    fontSize: "0.6rem", 
                    fontWeight: 800,
                    padding: "4px 8px",
                    borderRadius: "6px"
                  }}
                >
                  RESET
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      <div className={styles.statsRow}>
        <Card className={styles.statCard}>
          <div className={styles.statIconWrapper}><Flame color="#FF8B8B" /></div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Streak</span>
            <span className={styles.statValue}>{streak} Days</span>
          </div>
        </Card>
        
        <Card className={styles.statCard}>
          <div className={styles.statIconWrapper}><Clock color="#A78BFA" /></div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Focus</span>
            <span className={styles.statValue}>{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</span>
          </div>
        </Card>
      </div>

      <section className={styles.heroGrid}>
        <Card className={styles.mascotHeroCard}>
          <MascotContainer stage={plantStage} hideStatus={plantStage === 'seed' || plantStage === 'sprout'} />
          
          {plantStage !== 'seed' && plantStage !== 'sprout' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ width: "100%", display: "flex", justifyContent: "center" }}
            >
              <Button 
                variant="primary" 
                onClick={() => harvestFlower()}
                disabled={isHarvesting}
                style={{ 
                  padding: "12px 24px",
                  fontSize: "1rem",
                  width: "220px",
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                  opacity: isHarvesting ? 0.7 : 1
                }}
              >
                {isHarvesting ? "Harvesting..." : `Harvest ${plantStage.charAt(0).toUpperCase() + plantStage.slice(1)}`}
              </Button>
            </motion.div>
          )}
        </Card>

        <div className={styles.heroActions}>
          <Card className={styles.actionCard} onClick={() => setIsLogModalOpen(true)}>
            <div className={`${styles.actionIcon} ${styles.logIcon}`}><Sparkles size={24} /></div>
            <div className={styles.actionText}>
              <h3>{isTodayLogged ? "Daily Log Complete" : "Daily Log"}</h3>
              <p>{isTodayLogged ? "View/Edit in Library" : "Update your progress"}</p>
            </div>
          </Card>

          <Card className={styles.actionCard} onClick={() => router.push('/library')}>
            <div className={`${styles.actionIcon} ${styles.libraryIcon}`}><History size={24} /></div>
            <div className={styles.actionText}>
              <h3>My Library</h3>
              <p>View your progress</p>
            </div>
          </Card>

          <Card className={styles.actionCard} onClick={() => setIsGhostwriterModalOpen(true)}>
            <div className={`${styles.actionIcon} ${styles.twitterIcon}`}><Feather size={24} /></div>
            <div className={styles.actionText}>
              <h3>Ghostwriter</h3>
              <p>Request an X draft</p>
            </div>
          </Card>
        </div>
      </section>

      <section className={styles.activitySection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>My Activity Pots</h2>
          <Button variant="secondary" className={styles.addBtnSmall} onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} /> New Pot
          </Button>
        </div>
        
        <div className={styles.activityGrid}>
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={styles.potWrapper}
            >
              <Card className={styles.activityPot}>
                <div className={styles.potControls}>
                  <button 
                    className={styles.controlBtn} 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingActivity({ id: activity.id, title: activity.title });
                      setIsAddModalOpen(true);
                    }}
                  >
                    <Pencil size={12} />
                  </button>
                  <button 
                    className={`${styles.controlBtn} ${styles.delete}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteActivity(activity.id);
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className={styles.potMascot}>
                  <Sparkles size={24} className={styles.aiIcon} />
                </div>
                <h3 className={styles.potTitle}>{activity.title}</h3>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <QuickLogModal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} />
      <GhostwriterModal isOpen={isGhostwriterModalOpen} onClose={() => setIsGhostwriterModalOpen(false)} />
      <AddActivityModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingActivity(null);
        }}
        onAdd={handleAddSubmit}
        initialTitle={editingActivity?.title}
        mode={editingActivity ? "edit" : "add"}
      />
    </main>
  );
}
