"use client";

import { X, Twitter, Send, Trash2 } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";
import styles from "./SocialDraftModal.module.css";
import { useStudy } from "../../lib/StudyContext";

interface SocialDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SocialDraftModal({ isOpen, onClose }: SocialDraftModalProps) {
  const { lastTweetDraft, updateTweetDraft } = useStudy();

  const handleShare = () => {
    const encodedTweet = encodeURIComponent(lastTweetDraft);
    window.open(`https://twitter.com/intent/tweet?text=${encodedTweet}`, "_blank");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Refine Your Update">
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <Twitter size={20} color="#1DA1F2" />
          </div>
          <div className={styles.headerText}>
            <h3>AI Generated Draft</h3>
            <p>Edit your session update before posting</p>
          </div>
        </div>

        <textarea
          className={styles.textarea}
          value={lastTweetDraft}
          onChange={(e) => updateTweetDraft(e.target.value)}
          placeholder="Log a session first to generate a draft..."
        />

        <div className={styles.footer}>
          <Button 
            variant="secondary" 
            onClick={() => updateTweetDraft("")}
            className={styles.clearBtn}
          >
            <Trash2 size={16} /> Clear Draft
          </Button>
          <Button 
            variant="primary" 
            onClick={handleShare}
            className={styles.shareBtn}
            disabled={!lastTweetDraft.trim()}
          >
            <Send size={16} /> Post to X
          </Button>
        </div>
      </div>
    </Modal>
  );
}
