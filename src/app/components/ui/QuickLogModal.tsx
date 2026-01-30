import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Twitter, Clock, BookOpen, MessageSquare } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";
import styles from "./QuickLogModal.module.css";
import { useStudy } from "../../lib/StudyContext";

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickLogModal({ isOpen, onClose }: QuickLogModalProps) {
  const { activities, addLog, updateTweetDraft } = useStudy();
  const [selectedActivity, setSelectedActivity] = useState(activities[0]?.title || "");
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState("");
  
  // AI Agent States
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [showTweetPreview, setShowTweetPreview] = useState(false);
  const [step, setStep] = useState<"input" | "processing" | "review">("input");

  const durationPresets = [25, 45, 60, 120];

  const handleStartProcessing = () => {
    setIsProcessing(true);
    setStep("processing");
    
    // Simulate AI thinking
    setTimeout(() => {
      const timeStr = duration >= 60 ? `${(duration / 60).toFixed(1)}h` : `${duration}m`;
      const summary = `I've analyzed your session! You spent ${timeStr} on ${selectedActivity}. 
      
Based on your notes: "${notes || "Focused study"}", I'll log this as a major progress milestone. 

I've also prepared a tweet for you! 🚀`;
      
      setAiSummary(summary);
      setIsProcessing(false);
      setStep("review");
    }, 2000);
  };

  const handleFinalLog = () => {
    addLog(selectedActivity, duration, notes);
    if (showTweetPreview) {
      updateTweetDraft(generateTweet());
    }
    onClose();
    // Reset state
    setNotes("");
    setStep("input");
  };

  const generateTweet = () => {
    const timeStr = duration >= 60 ? `${(duration / 60).toFixed(1)}h` : `${duration}m`;
    return `Just finished a ${timeStr} session of #${selectedActivity.replace(/\s+/g, '')}! 🚀\n\n${notes || "Making progress every day."}\n\n#StudySprout #CodingAccountability #BuildInPublic @StudySproutApp`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quick Session Log">
      <div className={styles.container}>
        {step === "input" && (
          <>
            {/* Activity Selection */}
            <div className={styles.section}>
              <label className={styles.label}>
                <BookOpen size={16} /> What are you studying?
              </label>
              <div className={styles.activityGrid}>
                {activities.map((activity) => (
                  <button
                    key={activity.id}
                    className={`${styles.activityChip} ${
                      selectedActivity === activity.title ? styles.active : ""
                    }`}
                    onClick={() => setSelectedActivity(activity.title)}
                  >
                    {activity.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Selection */}
            <div className={styles.section}>
              <label className={styles.label}>
                <Clock size={16} /> Duration
              </label>
              <div className={styles.presetGrid}>
                {durationPresets.map((preset) => (
                  <button
                    key={preset}
                    className={`${styles.presetChip} ${
                      duration === preset ? styles.active : ""
                    }`}
                    onClick={() => setDuration(preset)}
                  >
                    {preset >= 60 ? `${preset / 60}h` : `${preset}m`}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className={styles.section}>
              <label className={styles.label}>
                <MessageSquare size={16} /> Session Notes
              </label>
              <textarea
                className={styles.textarea}
                placeholder="What did you achieve? (e.g., fixed a bug, learned binary search)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className={styles.footer}>
              <Button variant="secondary" onClick={onClose} className={styles.cancelBtn}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleStartProcessing} className={styles.logBtn}>
                <Sparkles size={18} /> Process with AI
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
            <p>Analyzing your session and crafting your update.</p>
          </div>
        )}

        {step === "review" && (
          <div className={styles.reviewState}>
            <div className={styles.aiResponse}>
              <div className={styles.aiBadge}>
                <Sparkles size={14} /> AI AGENT
              </div>
              <p className={styles.aiText}>{aiSummary}</p>
            </div>

            {/* Twitter Toggle */}
            <div className={styles.twitterToggle}>
              <div className={styles.toggleInfo}>
                <Twitter size={18} color="#1DA1F2" />
                <div>
                  <p className={styles.toggleTitle}>Twitter Integration</p>
                  <p className={styles.toggleDesc}>Prepare a tweet for this session</p>
                </div>
              </div>
              <button
                className={`${styles.toggleSwitch} ${showTweetPreview ? styles.on : ""}`}
                onClick={() => setShowTweetPreview(!showTweetPreview)}
              >
                <div className={styles.switchHandle} />
              </button>
            </div>

            {/* Tweet Preview Area */}
            <AnimatePresence>
              {showTweetPreview && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className={styles.tweetPreviewWrapper}
                >
                  <div className={styles.tweetPreview}>
                    <div className={styles.tweetHeader}>
                      <Twitter size={14} color="#1DA1F2" />
                      <span>X / Twitter Preview</span>
                    </div>
                    <p className={styles.tweetText}>{generateTweet()}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={styles.footer}>
              <Button variant="secondary" onClick={() => setStep("input")} className={styles.cancelBtn}>
                Edit Details
              </Button>
              <Button variant="primary" onClick={handleFinalLog} className={styles.logBtn}>
                Log & Share
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
