"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Clock, TrendingUp, Plus, History, Pencil, Trash2, Sparkles, Twitter } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import MascotContainer from "../components/MascotContainer";
import QuickLogModal from "../components/ui/QuickLogModal";
import SocialDraftModal from "../components/ui/SocialDraftModal";
import AddActivityModal from "../components/ui/AddActivityModal";
import { useStudy } from "../lib/StudyContext";
import styles from "./page.module.css";

export default function Dashboard() {
  const { 
    streak, totalMinutes, plantStage, activities, logs, lastTweetDraft,
    addActivity, deleteActivity, updateActivity, updateTweetDraft,
    setManualStreak
  } = useStudy();
  
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<{id: string, title: string} | null>(null);

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
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.greeting}>Welcome Back!</h1>
            <p className={styles.subtitle}>Your journey continues.</p>
          </div>
          
          <div className={styles.devControl}>
            <span className={styles.devLabel}>Mascot Tester: </span>
            <input 
              type="range" 
              min="0" 
              max="10" 
              value={streak} 
              onChange={(e) => setManualStreak(parseInt(e.target.value))}
              className={styles.devSlider}
            />
            <span className={styles.devValue}>{streak}d</span>
            <button className={styles.devReset} onClick={() => setManualStreak(null)}>Reset</button>
          </div>
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
          <MascotContainer stage={plantStage} />
        </Card>

        <div className={styles.heroActions}>
          <Card className={styles.actionCard} onClick={() => setIsLogModalOpen(true)}>
            <div className={styles.actionIcon}><Plus size={24} /></div>
            <div className={styles.actionText}>
              <h3>Quick Log</h3>
              <p>Grow your tech stacks</p>
            </div>
          </Card>

          <Card className={styles.actionCard} onClick={() => {}}>
            <div className={`${styles.actionIcon} ${styles.libraryIcon}`}><History size={24} /></div>
            <div className={styles.actionText}>
              <h3>My Library</h3>
              <p>View your progress</p>
            </div>
          </Card>

          <Card className={styles.actionCard} onClick={() => setIsSocialModalOpen(true)}>
            <div className={`${styles.actionIcon} ${styles.twitterIcon}`}><Twitter size={24} /></div>
            <div className={styles.actionText}>
              <h3>Social Drafts</h3>
              <p>{lastTweetDraft ? "You have a new draft!" : "No recent logs to share"}</p>
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
                <div className={styles.potStats}>
                  {(activity.totalMinutes / 60).toFixed(1)}h total
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <QuickLogModal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} />
      <SocialDraftModal isOpen={isSocialModalOpen} onClose={() => setIsSocialModalOpen(false)} />
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
