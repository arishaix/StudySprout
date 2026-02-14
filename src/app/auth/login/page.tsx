"use client";

import styles from "../Auth.module.css";
import Button from "../../components/ui/Button";
import Link from "next/link";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });
    if (googleError) setError(googleError.message);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;

      if (data?.user) {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <motion.div 
        className={styles.authCard}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className={styles.header}>
          <div className={styles.illustration}>🍄</div>
          <h1 className={styles.title}>Welcome back!</h1>
        </div>

        <form className={styles.form} onSubmit={handleLogin}>
          {error && <div className={styles.errorMessage}>{error}</div>}
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email</label>
            <input 
              type="email" 
              placeholder="example@gmail.com" 
              className={styles.input} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className={styles.input} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <Button type="submit" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Signing In..." : "Sign In"} <LogIn size={18} />
          </Button>
        </form>

        <div className={styles.divider}>or</div>

        <div className={styles.socialAuth}>
          <Button variant="secondary" style={{ width: "100%" }} onClick={handleGoogleLogin}>
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
