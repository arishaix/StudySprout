"use client";

import styles from "../Auth.module.css";
import Button from "../../components/ui/Button";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const checkUsername = async (val: string) => {
    if (val.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    setCheckingUsername(true);
    const { data, error: checkError } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', val)
      .single();

    if (checkError && checkError.code === 'PGRST116') {
      // Username not found, so it's available
      setUsernameAvailable(true);
    } else {
      setUsernameAvailable(false);
    }
    setCheckingUsername(false);
  };

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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameAvailable === false) {
      setError("Username is already taken");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          }
        }
      });

      if (signupError) throw signupError;

      if (data?.user) {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during signup");
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
          <div className={styles.illustration}>🌰</div>
          <h1 className={styles.title}>Join StudySprout</h1>
          <p className={styles.subtitle}>Start growing your consistency today.</p>
        </div>

        <form className={styles.form} onSubmit={handleSignup}>
          {error && <div className={styles.errorMessage}>{error}</div>}
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Username</label>
            <div className={styles.inputWrapper}>
              <input 
                type="text" 
                placeholder="SproutMaster123" 
                className={`${styles.input} ${usernameAvailable === false ? styles.inputError : ""} ${usernameAvailable === true ? styles.inputSuccess : ""}`}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameAvailable(null);
                }}
                onBlur={(e) => checkUsername(e.target.value)}
                required
              />
              {checkingUsername && <div className={styles.inlineLoader}>Checking...</div>}
            </div>
            {usernameAvailable === false && <p className={styles.inputHintError}>This username is already taken.</p>}
            {usernameAvailable === true && <p className={styles.inputHintSuccess}>Username available!</p>}
          </div>

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
          
          <Button type="submit" style={{ width: "100%" }} disabled={loading || checkingUsername || usernameAvailable === false}>
            {loading ? "Creating..." : "Create Account"} <UserPlus size={18} />
          </Button>
        </form>

        <div className={styles.divider}>or</div>

        <div className={styles.socialAuth}>
          <Button variant="secondary" style={{ width: "100%" }} onClick={handleGoogleLogin}>
            Sign up with Google
          </Button>
        </div>

        <p className={styles.footer}>
          Already have an account?{" "}
          <Link href="/auth/login" className={styles.link}>
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
