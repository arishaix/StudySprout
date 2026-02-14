"use client";

import { useState } from "react";
import { X, Sparkles, Send, RefreshCw, MessageSquare, Feather } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";
import styles from "./GhostwriterModal.module.css";
import { useStudy } from "../../lib/StudyContext";
import { motion, AnimatePresence } from "framer-motion";

interface GhostwriterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Vibe = "Focus" | "Growth" | "Casual";

export default function GhostwriterModal({ isOpen, onClose }: GhostwriterModalProps) {
  const { logs, user, isAdmin } = useStudy();
  const [vibe, setVibe] = useState<Vibe>("Growth");
  const [generatedPost, setGeneratedPost] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const latestLog = logs[0]; // Use the most recent log for the ghostwriter

  const generateGhostwriterPost = async () => {
    if (!latestLog) {
      setError("No recent study logs found for the ghostwriter!");
      return;
    }

    setIsGenerating(true);
    setError("");
    
    try {
      const response = await fetch("/api/ghostwriter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity: latestLog.activity_title || "Studying",
          minutes: latestLog.minutes,
          notes: latestLog.notes || "",
          vibe: vibe,
          userId: user?.id
        })
      });

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setGeneratedPost(data.suggestion);
      }
    } catch (err: any) {
      console.error("Ghostwriter Fetch Error:", err);
      setError("The Ghostwriter is disconnected. Check your internet or API keys.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = () => {
    const encodedTweet = encodeURIComponent(generatedPost);
    window.open(`https://twitter.com/intent/tweet?text=${encodedTweet}`, "_blank");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="The Bloom Ghostwriter 🌸">
      <div className={styles.container}>
        <div className={styles.agentIntro}>
          <div className={styles.agentIcon}>
            <Feather size={24} color={isAdmin ? "var(--peachy-pink)" : "var(--primary-purple)"} />
          </div>
          <div className={styles.introText}>
            <h3>Request a Draft {isAdmin && "👑"}</h3>
            <p>
              {isAdmin 
                ? "Admin Mode: Unlimited generations unlocked." 
                : "Your personal AI agent will transform your latest session into an X post."}
            </p>
          </div>
        </div>

        <div className={styles.vibeSelector}>
          {(["Focus", "Growth", "Casual"] as Vibe[]).map((v) => (
            <button
              key={v}
              className={`${styles.vibeBtn} ${vibe === v ? styles.active : ""}`}
              onClick={() => {
                setVibe(v);
                setError("");
              }}
            >
              {v === "Focus" && "🎯"}
              {v === "Growth" && "🌱"}
              {v === "Casual" && "🍄"}
              <span>{v}</span>
            </button>
          ))}
        </div>

        <div className={styles.previewArea}>
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={styles.loadingState}
              >
                <RefreshCw size={24} className={styles.spin} />
                <p>Ghostwriter is drafting...</p>
              </motion.div>
            ) : generatedPost ? (
              <motion.textarea
                key="content"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={styles.textarea}
                value={generatedPost}
                onChange={(e) => setGeneratedPost(e.target.value)}
              />
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={styles.emptyState}
              >
                <MessageSquare size={32} opacity={0.3} />
                <p>Select a vibe and request a draft</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.footer}>
          {!generatedPost ? (
            <Button 
              variant="primary" 
              onClick={generateGhostwriterPost}
              className={styles.summonBtn}
              disabled={isGenerating || !latestLog}
            >
              <Sparkles size={16} /> Request Draft
            </Button>
          ) : (
            <>
              <Button 
                variant="secondary" 
                onClick={generateGhostwriterPost}
                disabled={isGenerating}
              >
                <RefreshCw size={16} /> Reword
              </Button>
              <Button 
                variant="primary" 
                onClick={handleShare}
                className={styles.shareBtn}
              >
                <Send size={16} /> Send to X
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
