"use client";

import { useState } from "react";
import styles from "./page.module.css";
import Button from "../components/ui/Button";
import { ArrowLeft, ArrowRight, Map } from "lucide-react";
import { motion } from "framer-motion";
import { useStudy } from "../lib/StudyContext";

export default function StreakPage() {
  // Use Logs from Context (REAL DATA)
  const { logs, manualStreak } = useStudy();
  
  const [monthIndex, setMonthIndex] = useState(new Date().getMonth()); // Default to current month
  const [year, setYear] = useState(new Date().getFullYear()); // Default to current year
  
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  // Real Data Generation
  const generateMonthData = (month: number, year: number) => {
    const lastDay = new Date(year, month + 1, 0).getDate();
    const firstDayObj = new Date(year, month, 1);
    const today = new Date();
    const todayFormatted = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Padding (Sunday Start)
    const paddingCount = firstDayObj.getDay(); 

    const days: any[] = [];

    // Add Padding
    for (let i = 0; i < paddingCount; i++) {
      days.push({ day: null, status: "empty", dayOfWeek: -1 });
    }

    // Add Real Days
    for (let i = 1; i <= lastDay; i++) {
      const date = new Date(year, month, i);
      const dayOfWeek = date.getDay(); // 0 is Sunday
      const isToday = date.getTime() === todayFormatted.getTime();
      const isPast = date < todayFormatted;
      
      // Determine Status from Real Logs
      // 1. Format date to YYYY-MM-DD to match logs
      // Note: logs.date is usually ISO string or YYYY-MM-DD. 
      // Let's assume the logs from Supabase are YYYY-MM-DD or we can match day/month/year.
      // Easiest is to check if any log matches this specific day.
      
      const hasLog = logs.some(log => {
        const logDate = new Date(log.date); // Handle valid date strings
        return logDate.getDate() === i && 
               logDate.getMonth() === month && 
               logDate.getFullYear() === year;
      });

      let status: "locked" | "completed" | "missed" = "locked";
      
      if (manualStreak !== null && isPast) {
         // Tester Mode Override: If manual streak > 0, we can simulate patterns if needed,
         // but user asked for REAL DB connection. Let's prioritize real logs.
         // If they have a manual streak set, maybe show 'completed' for the last X days?
         // Let's stick to PURE DB logs as requested.
         status = hasLog ? "completed" : "missed";
      } else {
         if (isToday) {
            status = hasLog ? "completed" : "locked"; // Today is locked until done (or pending)
         } else if (isPast) {
            status = hasLog ? "completed" : "missed";
         } else {
            status = "locked"; // Future
         }
      }
      
      // Override for "Missed" -> If user hated random missed, "locked" might be cleaner?
      // But for a past date, "locked" implies it's not accessible. "Missed" implies you failed.
      // Let's stick to "missed" (autumn leaf) for accuracy.
      
      days.push({ day: i, status, dayOfWeek, isToday });
    }

    return days;
  };

  const currentMonthData = generateMonthData(monthIndex, year);

  const getEmoji = (dayOfWeek: number, dayOfMonth: number) => {
    // dayOfWeek: 0 (Sun) - 6 (Sat)
    
    // Mon (1) - Wed (3) -> Seed
    if (dayOfWeek >= 1 && dayOfWeek <= 3) return "🌱";
    
    // Thu (4) - Sat (6) -> Sprout
    if (dayOfWeek >= 4 && dayOfWeek <= 6) return "🌿";
    
    // Sun (0) -> Flower Cycle
    if (dayOfWeek === 0) {
      const flowers = ["🌻", "🌷", "🌼", "🍄"];
      const weekIndex = Math.floor((dayOfMonth - 1) / 7);
      return flowers[weekIndex % 4];
    }
    
    return "🌱";
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTitleRow}>
          <div className={styles.iconWrapper}>
              <Map size={24} color="var(--soft-teal)" />
          </div>
          <h1 className={styles.monthTitle}>{months[monthIndex]} {year}</h1>
        </div>
        <p className={styles.subtitle}>Your Study Journey</p>
      </header>

      <div className={styles.pathGrid}>
        {Array.from({ length: Math.ceil(currentMonthData.length / 7) }, (_, rowIndex) => (
          <div key={rowIndex} className={styles.row}>
            {currentMonthData.slice(rowIndex * 7, rowIndex * 7 + 7).map((data, index) => {
              const globalIndex = rowIndex * 7 + index;
              
              if (data.status === "empty") {
                return <div key={`empty-${globalIndex}`} className={styles.nodeWrapper} style={{ pointerEvents: "none" }} />;
              }

              const emoji = data.status === "missed" ? "🍂" : getEmoji(data.dayOfWeek, data.day);
              
              return (
                <motion.div 
                  key={data.day} 
                  className={styles.nodeWrapper}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: globalIndex * 0.01 }}
                  title={`Day ${data.day}: ${emoji}`} 
                >
                  <motion.div 
                    className={`${styles.node} ${styles[data.status]} ${data.isToday ? styles.today : ""}`}
                    animate={data.isToday ? {
                      y: [0, -10, 0],
                      scale: [1, 1.1, 1]
                    } : {}}
                    transition={data.isToday ? {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    } : {}}
                  >
                    <span className="emoji-content">{emoji}</span>
                  </motion.div>
                  <span className={styles.dayLabel}>{data.day}</span>
                  {data.isToday && <span className={styles.todayIndicator}>Today</span>}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      <div className={styles.controls}>
        <Button 
          onClick={() => {
            if (monthIndex === 0) {
              setMonthIndex(11);
              setYear(prev => prev - 1);
            } else {
              setMonthIndex(prev => prev - 1);
            }
          }} 
          variant="secondary"
        >
            <ArrowLeft size={20} /> Prev
        </Button>
        <div style={{ width: "24px" }} /> 
        <Button 
          onClick={() => {
            if (monthIndex === 11) {
              setMonthIndex(0);
              setYear(prev => prev + 1);
            } else {
              setMonthIndex(prev => prev + 1);
            }
          }}
        >
            Next <ArrowRight size={20} />
        </Button>
      </div>
    </div>
  );
}
