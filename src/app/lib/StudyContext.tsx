"use client";

import { createContext, useContext, useState, useEffect } from "react";

type Log = {
  id: string;
  activity: string;
  minutes: number;
  notes?: string;
  date: string;
};

type PlantStage = "seed" | "sprout" | "flower";

type Activity = {
  id: string;
  title: string;
  totalMinutes: number;
  stage: PlantStage;
};

interface StudyContextType {
  streak: number;
  totalMinutes: number;
  plantStage: PlantStage;
  logs: Log[];
  activities: Activity[];
  lastTweetDraft: string;
  updateTweetDraft: (draft: string) => void;
  addLog: (activityTitle: string, minutes: number, notes?: string) => void;
  addActivity: (title: string) => void;
  deleteActivity: (id: string) => void;
  updateActivity: (id: string, title: string) => void;
  setManualStreak: (streak: number | null) => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [streak, setStreak] = useState(0);
  const [manualStreak, setManualStreak] = useState<number | null>(null);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [plantStage, setPlantStage] = useState<PlantStage>("seed");
  const [logs, setLogs] = useState<Log[]>([]);
  const [activities, setActivities] = useState<Activity[]>([
    { id: "1", title: "Frontend", totalMinutes: 120, stage: "sprout" },
    { id: "2", title: "Backend", totalMinutes: 45, stage: "seed" },
    { id: "3", title: "Data Structures", totalMinutes: 30, stage: "seed" },
    { id: "4", title: "System Design", totalMinutes: 10, stage: "seed" },
  ]);
  const [lastTweetDraft, setLastTweetDraft] = useState("");

  const getStage = (days: number): PlantStage => {
    if (days < 3) return "seed";
    if (days < 7) return "sprout";
    return "flower";
  };

  // Streak-Based Growth Logic
  useEffect(() => {
    if (manualStreak !== null) {
      setStreak(manualStreak);
      setPlantStage(getStage(manualStreak));
      return;
    }
    // Basic streak calculation: one point per unique day of logging
    const uniqueDays = new Set(logs.map(log => new Date(log.date).toDateString())).size;
    setStreak(uniqueDays);
    setPlantStage(getStage(uniqueDays));
  }, [logs, manualStreak]);

  const addLog = (title: string, minutes: number, notes?: string) => {
    const newLog: Log = {
      id: Math.random().toString(36).substr(2, 9),
      activity: title,
      minutes,
      notes,
      date: new Date().toISOString(),
    };
    setLogs((prev) => [newLog, ...prev]);
    setTotalMinutes((prev) => prev + minutes);

    setActivities((prev) => {
      const existing = prev.find((a) => a.title.toLowerCase() === title.toLowerCase());
      if (existing) {
        return prev.map((a) => 
          a.title.toLowerCase() === title.toLowerCase() 
            ? { ...a, totalMinutes: a.totalMinutes + minutes, stage: getStage(a.totalMinutes + minutes) } 
            : a
        );
      }
      return prev;
    });
  };

  const addActivity = (title: string) => {
    const newActivity: Activity = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      totalMinutes: 0,
      stage: "seed",
    };
    setActivities((prev) => [...prev, newActivity]);
  };

  const deleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  const updateActivity = (id: string, title: string) => {
    setActivities((prev) => 
      prev.map((a) => (a.id === id ? { ...a, title } : a))
    );
  };

  const updateTweetDraft = (draft: string) => {
    setLastTweetDraft(draft);
  };

  return (
    <StudyContext.Provider value={{ 
      streak, totalMinutes, plantStage, logs, activities, lastTweetDraft,
      addLog, addActivity, deleteActivity, updateActivity, updateTweetDraft,
      setManualStreak
    }}>
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy() {
  const context = useContext(StudyContext);
  if (context === undefined) {
    throw new Error("useStudy must be used within a StudyProvider");
  }
  return context;
}
