"use client";

import { motion, AnimatePresence } from "framer-motion";
import { History, ChevronLeft, Calendar, Clock, Pencil, Trash2, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useStudy } from "../lib/StudyContext";
import styles from "./page.module.css";
import { clsx } from "clsx";

export default function LibraryPage() {
  const { logs, deleteLog, updateLog } = useStudy();
  const [editingLog, setEditingLog] = useState<{ id: string, minutes: number, notes: string } | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  const handleUpdate = async () => {
    if (editingLog) {
      await updateLog(editingLog.id, editingLog.minutes, editingLog.notes);
      setEditingLog(null);
    }
  };

  // Group logs by date
  const groupedLogs = logs.reduce((acc: { [key: string]: typeof logs }, log) => {
    const date = log.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {});

  // Sort dates descending
  const sortedDates = Object.keys(groupedLogs).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  // Expand the first day by default
  useEffect(() => {
    if (sortedDates.length > 0) {
      setExpandedDays(new Set([sortedDates[0]]));
    }
  }, [logs.length]); 

  const toggleDay = (date: string) => {
    const newExample = new Set(expandedDays);
    if (newExample.has(date)) {
      newExample.delete(date);
    } else {
      newExample.add(date);
    }
    setExpandedDays(newExample);
  };


  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <Link href="/dashboard" className={styles.backBtn}>
            <ChevronLeft size={20} /> Back to Garden
          </Link>
          <h1 className={styles.title}>
            <History size={24} /> My Growth Library
          </h1>
        </div>
      </header>

      <section className={styles.historyList}>
        {sortedDates.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIllustration}>📚</div>
            <h3>Your library is empty.</h3>
            <p>Start logging your activities to see your progress here!</p>
          </div>
        ) : (
          sortedDates.map((date, dayIndex) => {
            const dayLogs = groupedLogs[date];
            const totalMins = dayLogs.reduce((sum, l) => sum + l.minutes, 0);
            
            const isExpanded = expandedDays.has(date);
            
            return (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dayIndex * 0.05 }}
              >
                <Card className={styles.dayCard}>
                  <div 
                    className={clsx(styles.dayHeader, isExpanded && styles.expanded)} 
                    onClick={() => toggleDay(date)}
                  >
                    <div className={styles.dayTitle}>
                      <Calendar size={18} className={styles.calendarIcon} />
                      <h2>{new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
                    </div>
                    <div className={styles.headerRight}>
                      <div className={styles.dayTotal}>
                        <Clock size={14} /> {totalMins >= 60 ? `${(totalMins/60).toFixed(1)}h total` : `${totalMins}m total`}
                      </div>
                      <ChevronDown 
                        size={20} 
                        className={clsx(styles.chevron, isExpanded && styles.rotated)} 
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className={styles.logListWrapper}
                      >
                        <div className={styles.logList}>
                          {dayLogs.map((log) => (
                            <div key={log.id} className={styles.logItem}>
                              <div className={styles.logMain}>
                                <span className={styles.activityLabel}>{log.activity_title}</span>
                                <span className={styles.logDuration}>{log.minutes}m</span>
                                {log.notes && <p className={styles.logNotesSnippet}>{log.notes}</p>}
                              </div>
                              <div className={styles.logActions}>
                                <button 
                                  className={styles.actionBtn} 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingLog({ id: log.id, minutes: log.minutes, notes: log.notes || "" });
                                  }}
                                >
                                  <Pencil size={14} />
                                </button>
                                <button 
                                  className={`${styles.actionBtn} ${styles.delete}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteLog(log.id);
                                  }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })
        )}
      </section>

      {/* Simple Edit Modal/Overlay */}
      {editingLog && (
        <div className={styles.modalOverlay}>
          <Card className={styles.editCard}>
            <h3>Edit Log</h3>
            <div className={styles.inputGroup}>
              <label>Duration (minutes)</label>
              <input 
                type="number" 
                value={editingLog.minutes}
                onChange={(e) => setEditingLog({ ...editingLog, minutes: parseInt(e.target.value) })}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Notes</label>
              <textarea 
                value={editingLog.notes}
                onChange={(e) => setEditingLog({ ...editingLog, notes: e.target.value })}
              />
            </div>
            <div className={styles.modalFooter}>
              <Button variant="secondary" onClick={() => setEditingLog(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleUpdate}>Save Changes</Button>
            </div>
          </Card>
        </div>
      )}
    </main>
  );
}
