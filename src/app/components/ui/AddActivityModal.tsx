import { useState, useEffect } from "react";
import Modal from "./Modal";
import Button from "./Button";
import styles from "./AddActivityModal.module.css";
import { BookOpen, Plus } from "lucide-react";

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string) => void;
  initialTitle?: string;
  mode?: "add" | "edit";
}

export default function AddActivityModal({ 
  isOpen, 
  onClose, 
  onAdd, 
  initialTitle = "",
  mode = "add"
}: AddActivityModalProps) {
  const [title, setTitle] = useState(initialTitle);

  // Sync title when initialTitle changes (for edit mode)
  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim());
      setTitle("");
      onClose();
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={mode === "add" ? "New Activity Pot" : "Rename Activity"}
    >
      <form onSubmit={handleSubmit} className={styles.container}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            <BookOpen size={16} /> Activity Name
          </label>
          <input
            type="text"
            className={styles.input}
            placeholder="e.g., Coding React, LeetCode, Math"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" className={styles.submitBtn}>
            {mode === "add" ? "Create Pot" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
