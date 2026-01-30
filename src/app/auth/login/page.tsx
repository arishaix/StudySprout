"use client";

import styles from "../Auth.module.css";
import Button from "../../components/ui/Button";
import Link from "next/link";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <motion.div 
        className={styles.authCard}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className={styles.header}>
          <div className={styles.illustration}>🌱</div>
          <h1 className={styles.title}>Welcome back!</h1>
          <p className={styles.subtitle}>Your Sprout missed you.</p>
        </div>

        <form className={styles.form} onClick={(e) => e.preventDefault()}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email</label>
            <input type="email" placeholder="example@gmail.com" className={styles.input} />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <input type="password" placeholder="••••••••" className={styles.input} />
          </div>
          
          <Link href="/dashboard" style={{ width: "100%" }}>
            <Button style={{ width: "100%" }}>
              Sign In <LogIn size={18} />
            </Button>
          </Link>
        </form>

        <div className={styles.divider}>or</div>

        <div className={styles.socialAuth}>
          <Button variant="secondary" style={{ width: "100%" }}>
            Continue with Google
          </Button>
        </div>

        <p className={styles.footer}>
          Don't have an account?{" "}
          <Link href="/auth/signup" className={styles.link}>
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
