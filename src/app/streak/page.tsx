"use client";

import { useState } from "react";
import styles from "./page.module.css";
import Button from "../components/ui/Button";
import { ArrowLeft, ArrowRight, Map } from "lucide-react";
import { motion } from "framer-motion";

// Mock Data Generation
const generateMonthData = (month: number, year: number) => {
  const lastDay = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayFormatted = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  return Array.from({ length: lastDay }, (_, i) => {
    const date = new Date(year, month, i + 1);
    const dayOfWeek = date.getDay(); // 0 is Sunday
    const isToday = date.getTime() === todayFormatted.getTime();
    const isPast = date < todayFormatted;
    
    let status: "locked" | "completed" | "missed" = "locked";
    if (isPast) {
       status = Math.random() > 0.2 ? "completed" : "missed";
    } else if (isToday) {
       status = "completed"; // Demonstration
    }
    
    return { day: i + 1, status, dayOfWeek, isToday };
  });
};

export default function StreakPage() {
  const [monthIndex, setMonthIndex] = useState(0); // 0 = Jan, 1 = Feb...
  const year = 2026;
  const currentMonthData = generateMonthData(monthIndex, year);
  
  const months = ["January", "February", "March", "April", "May", "June"];
  const currentMonthName = months[monthIndex];

  const getEmoji = (data: any, globalIndex: number) => {
    if (data.status === "missed") return "🍂";
    if (data.status === "locked") return "🕳️";
    
    // Mon (1) to Wed (3)
    if (data.dayOfWeek >= 1 && data.dayOfWeek <= 3) return "🌰";
    // Thu (4) to Sat (6)
    if (data.dayOfWeek >= 4 && data.dayOfWeek <= 6) return "🌱";
    // Sun (0)
    if (data.dayOfWeek === 0) {
      const flowers = ["🌷", "🌸", "🌻", "🌹", "🌺", "🌼"];
      const sundayIndex = Math.floor(globalIndex / 7);
      return flowers[sundayIndex % flowers.length];
    }
    return "🌰";
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <div style={{ padding: "12px", background: "white", borderRadius: "50%", boxShadow: "var(--shadow-sm)" }}>
                <Map size={32} color="var(--soft-teal)" />
            </div>
        </div>
        <h1 className={styles.monthTitle}>{months[monthIndex]} {year}</h1>
        <p style={{ color: "var(--text-light)" }}>Your Study Journey</p>
      </header>

      <div className={styles.pathGrid}>
        {Array.from({ length: Math.ceil(currentMonthData.length / 7) }, (_, rowIndex) => (
          <div key={rowIndex} className={styles.row}>
            {currentMonthData.slice(rowIndex * 7, rowIndex * 7 + 7).map((data, index) => {
              const globalIndex = rowIndex * 7 + index;
              const emoji = getEmoji(data, globalIndex);
              
              return (
                <motion.div 
                  key={data.day} 
                  className={styles.nodeWrapper}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: globalIndex * 0.01 }}
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
                    {emoji}
                  </motion.div>
                  <span className={styles.dayLabel}>Day {data.day}</span>
                  {data.isToday && <span className={styles.todayIndicator}>Today</span>}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      <div className={styles.controls}>
        <Button 
          onClick={() => setMonthIndex(prev => Math.max(0, prev - 1))} 
          variant="secondary"
          disabled={monthIndex === 0}
        >
            <ArrowLeft size={20} /> Prev
        </Button>
        <span style={{ fontWeight: 700, minWidth: "100px", textAlign: "center" }}>
          {months[monthIndex]}
        </span>
        <Button 
          onClick={() => setMonthIndex(prev => Math.min(5, prev + 1))}
          disabled={monthIndex === 5}
        >
            Next <ArrowRight size={20} />
        </Button>
      </div>
    </div>
  );
}
