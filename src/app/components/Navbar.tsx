"use client";

import styles from "./Navbar.module.css";
import { Home, LayoutDashboard, Users, Sprout, Map as MapIcon, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { motion } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Streak", href: "/streak", icon: MapIcon },
    { name: "Friends", href: "/friends", icon: Users },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className={styles.navbarWrapper}>
      <motion.nav 
        className={styles.navbar}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <Link href="/" className={styles.navItem}>
           <Sprout color="var(--primary-purple)" size={24} />
        </Link>
        
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.name} 
              href={item.href} 
              className={clsx(styles.navItem, isActive && styles.active)}
            >
              <div className={styles.iconWrapper}>
                <Icon size={20} />
              </div>
              {/* Optional: Show label only on hover or active? Keeping it simple for now */}
            </Link>
          );
        })}
      </motion.nav>
    </div>
  );
}
