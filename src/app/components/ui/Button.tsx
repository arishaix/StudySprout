"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import styles from "./Button.module.css";
import { clsx } from "clsx";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "ghost" | "peach";
  size?: "small" | "medium";
  children: React.ReactNode;
}

export default function Button({ 
  variant = "primary", 
  size = "medium",
  className, 
  children, 
  ...props 
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={clsx(styles.button, styles[variant], styles[size], className)}
      {...props}
    >
      {children}
    </motion.button>
  );
}
