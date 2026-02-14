import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Twitter, Clock, BookOpen, MessageSquare, Plus } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";
import styles from "./QuickLogModal.module.css";
import { useStudy } from "../../lib/StudyContext";

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickLogModal({ isOpen, onClose }: QuickLogModalProps) {
  const { activities, bulkAddLogs, isTodayLogged } = useStudy();
  const [bundle, setBundle] = useState<{ [key: string]: { h: number, m: number } }>({});
  const [bundleNotes, setBundleNotes] = useState<{ [key: string]: string }>({});
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState("");
  
  // AI Agent States
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [step, setStep] = useState<"input" | "review" | "processing" | "final">("input");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleActivity = (id: string) => {
    setBundle(prev => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = { h: 1, m: 0 }; // Default to 1h
        // Show notification
        const activity = activities.find(a => a.id === id);
        setNotificationMsg(`Added ${activity?.title}!`);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 2000);
      }
      return next;
    });
  };

  const adjustTotalMinutes = (id: string, deltaMins: number) => {
    setBundle(prev => {
      if (!prev[id]) return prev;
      const currentTotal = (prev[id].h * 60) + prev[id].m;
      const nextTotal = Math.max(0, currentTotal + deltaMins);
      return { 
        ...prev, 
        [id]: { 
          h: Math.floor(nextTotal / 60), 
          m: nextTotal % 60 
        } 
      };
    });
  };

  const updateEntry = (id: string, field: "h" | "m", val: string) => {
    // Remove non-digits
    const clean = val.replace(/[^0-9]/g, '');
    let num = clean === "" ? 0 : parseInt(clean);
    
    // Cap minutes at 59 if user types manually
    if (field === "m" && num > 59) num = 59;
    
    setBundle(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: num }
    }));
  };

  const updateNotes = (id: string, note: string) => {
    setBundleNotes(prev => ({ ...prev, [id]: note }));
  };

  const handleStartProcessing = () => {
    const entryCount = Object.keys(bundle).length;
    if (entryCount === 0) return;
    
    setIsProcessing(true);
    setStep("processing");
    
    // Simulate AI thinking
    setTimeout(() => {
      const totalMins = Object.values(bundle).reduce((acc, curr) => acc + (curr.h * 60) + curr.m, 0);
      const timeStr = totalMins >= 60 ? `${(totalMins / 60).toFixed(1)}h` : `${totalMins}m`;
      const summary = `I've analyzed your multi-activity session! Total time: ${timeStr}. 
      
You've made progress across ${entryCount} different areas today. This variety is great for consistent growth! 🚀`;
        
      setAiSummary(summary);
      setIsProcessing(false);
      setStep("final");
    }, 2000);
  };

  const handleFinalLog = async () => {
    const finalEntries = Object.entries(bundle)
      .map(([id, time]) => ({
        activityId: id,
        minutes: (time.h * 60) + time.m,
        notes: bundleNotes[id] || ""
      }))
      .filter(entry => entry.minutes > 0);

    if (finalEntries.length === 0) return;
    
    setIsSubmitting(true);
    try {
      await bulkAddLogs(finalEntries);
      onClose();
      // Reset state
      setBundle({});
      setBundleNotes({});
      setStep("input");
    } finally {
      setIsSubmitting(false);
    }
  };


  if (isTodayLogged) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Daily Log Complete">
        <div className={styles.container}>
          <div className={styles.alreadyLogged}>
            <div className={styles.aiIcon} style={{ fontSize: "4rem" }}>
              🌼
            </div>
            <h3>You've already logged today!</h3>
            <p>To keep your history clean, we only allow one log bundle per day. You can view or edit today's logs in your Library.</p>
            <div className={styles.footer}>
              <Button variant="primary" onClick={onClose} style={{ width: "100%" }}>Got it!</Button>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Daily Progress Bundle">
      <div className={styles.container}>
        {/* Themed Notification */}
        <AnimatePresence>
          {showNotification && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={styles.notification}
            >
              <Sparkles size={14} /> {notificationMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {step === "input" && (
          <>
            <div className={styles.bundleStatus}>
              <span>{Object.keys(bundle).length} activities selected for today</span>
            </div>

            <div className={styles.incrementalGrid}>
              {activities.map((activity) => {
                const isActive = activity.id in bundle;
                const time = bundle[activity.id] || { h: 0, m: 0 };

                return (
                  <div 
                    key={activity.id} 
                    className={`${styles.activityCard} ${isActive ? styles.active : ""}`}
                  >
                    <div 
                      className={styles.cardMain}
                      onClick={() => toggleActivity(activity.id)}
                    >
                      <div className={styles.cardHeader}>
                        <span className={styles.cardTitle}>{activity.title}</span>
                        {isActive && <Sparkles size={14} className={styles.activeIcon} />}
                      </div>
                    </div>

                    {isActive && (
                      <div className={styles.cardControls}>
                        <div className={styles.counter}>
                          <button onClick={() => adjustTotalMinutes(activity.id, -15)} className={styles.countBtn}>-</button>
                          
                          <div className={styles.dualInput}>
                            <div className={styles.fieldGroup}>
                              <input 
                                type="text" 
                                inputMode="numeric"
                                className={styles.countInput} 
                                value={time.h === 0 ? "" : time.h.toString()} 
                                onChange={(e) => updateEntry(activity.id, "h", e.target.value)}
                                placeholder="0"
                              />
                              <span className={styles.unitLabel}>h</span>
                            </div>
                            
                            <div className={styles.fieldGroup}>
                              <input 
                                type="text" 
                                inputMode="numeric"
                                className={styles.countInput} 
                                value={time.m === 0 && time.h !== 0 ? "00" : time.m === 0 ? "" : time.m.toString()} 
                                onChange={(e) => updateEntry(activity.id, "m", e.target.value)}
                                placeholder="00"
                              />
                              <span className={styles.unitLabel}>m</span>
                            </div>
                          </div>

                          <button onClick={() => adjustTotalMinutes(activity.id, 15)} className={styles.countBtn}>+</button>
                        </div>
                        <input 
                          type="text" 
                          placeholder="Short note..." 
                          className={styles.quickNote}
                          value={bundleNotes[activity.id] || ""}
                          onChange={(e) => updateNotes(activity.id, e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className={styles.footer}>
              <Button variant="secondary" onClick={onClose} className={styles.cancelBtn}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleStartProcessing} 
                className={styles.logBtn}
                disabled={Object.keys(bundle).length === 0}
              >
                <Sparkles size={18} /> Review Bundle
              </Button>
            </div>
          </>
        )}

        {step === "processing" && (
          <div className={styles.processingState}>
            <motion.div 
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                rotate: { repeat: Infinity, duration: 2, ease: "linear" },
                scale: { repeat: Infinity, duration: 1.5 }
              }}
              className={styles.aiIcon}
            >
              <Sparkles size={48} color="var(--primary-purple)" />
            </motion.div>
            <h3>Agent is thinking...</h3>
            <p>Analyzing your daily bundle and crafting your update.</p>
          </div>
        )}

        {step === "final" && (
          <div className={styles.reviewState}>
            <div className={styles.aiResponse}>
              <div className={styles.aiBadge}>
                <Sparkles size={14} /> AI AGENT
              </div>
              <p className={styles.aiText}>{aiSummary}</p>
            </div>


            <div className={styles.footer}>
              <Button variant="secondary" onClick={() => setStep("input")} className={styles.cancelBtn}>
                Edit Details
              </Button>
              <Button 
                variant="primary" 
                onClick={handleFinalLog} 
                className={styles.logBtn}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging..." : "Log & Finalize"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
