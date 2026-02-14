"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabase";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

type Log = {
  id: string;
  activity_id: string;
  minutes: number;
  notes?: string;
  date: string;
  activity_title?: string;
};

type PlantStage = "seed" | "sprout" | "flower" | "tulip" | "daffodil" | "mushroom";

type Activity = {
  id: string;
  title: string;
  totalMinutes: number;
  stage: PlantStage;
};

type Badge = {
  id: string;
  flower_type: string;
  count: number;
};

interface StudyContextType {
  user: User | null;
  streak: number;
  totalMinutes: number;
  plantStage: PlantStage;
  logs: Log[];
  badges: Badge[];
  activities: Activity[];
  lastTweetDraft: string;
  updateTweetDraft: (draft: string) => void;
  addLog: (activityId: string, minutes: number, notes?: string, date?: string) => Promise<void>;
  bulkAddLogs: (entries: { activityId: string, minutes: number, notes?: string }[]) => Promise<void>;
  updateLog: (logId: string, minutes: number, notes?: string) => Promise<void>;
  deleteLog: (logId: string) => Promise<void>;
  isTodayLogged: boolean;
  addActivity: (title: string) => void;
  deleteActivity: (id: string) => void;
  updateActivity: (id: string, title: string) => void;
  harvestFlower: () => Promise<void>;
  
  manualStreak: number | null;
  setManualStreak: (s: number | null) => void;

  logout: () => Promise<void>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  notification: string | null;
  showNotification: (msg: string) => void;
  isHarvesting: boolean;
  isAdmin: boolean;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [streak, setStreak] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [plantStage, setPlantStage] = useState<PlantStage>("seed");
  const [logs, setLogs] = useState<Log[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [manualStreak, setManualStreak] = useState<number | null>(null);
  const router = useRouter();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [lastTweetDraft, setLastTweetDraft] = useState("");
  const [isTodayLogged, setIsTodayLogged] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [isHarvesting, setIsHarvesting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchData = async (userId: string) => {
    // 1. Fetch Activities
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId);
    
    if (activitiesError) console.error("Error fetching activities:", activitiesError);
    else {
      // @ts-ignore
      setActivities(activitiesData || []);
    }

    // 2. Fetch Logs with Activity Titles
    const { data: logsData, error: logsError } = await supabase
      .from('logs')
      .select(`
        *,
        activities (
          title
        )
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (logsError) console.error("Error fetching logs:", logsError);
    else {
      const formattedLogs = (logsData || []).map((log: any) => ({
        ...log,
        activity_title: log.activities?.title || 'Unknown'
      }));
      setLogs(formattedLogs);
      const total = formattedLogs.reduce((acc: number, curr: any) => acc + curr.minutes, 0);
      setTotalMinutes(total);

      // Check if today is logged
      const todayStr = new Date().toISOString().split('T')[0];
      setIsTodayLogged(formattedLogs.some(log => log.date === todayStr));

      // Calculate consecutive streak
      const uniqueDates = Array.from(new Set(formattedLogs.map((log: any) => log.date))).sort().reverse();
      
      let currentStreak = 0;
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      // Start from today or yesterday (allow 1-day grace)
      let checkDate = uniqueDates[0] === today ? today : (uniqueDates[0] === yesterday ? yesterday : null);
      
      if (checkDate) {
        for (const date of uniqueDates) {
          if (date === checkDate) {
            currentStreak++;
            // Move to previous day
            const prevDate: string = new Date(new Date(checkDate).getTime() - 86400000).toISOString().split('T')[0];
            checkDate = prevDate;
          } else {
            break; // Streak broken
          }
        }
      }
      
      setStreak(currentStreak);

      // 3. Fetch Badges
      const { data: badgesData } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId);
      
      setBadges(badgesData || []);

      // 4. Fetch Admin Status
      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();
      
      setIsAdmin(!!profileData?.is_admin);
    }
    setIsLoading(false);
  };

  // Calculate visual/effective streak for mascot growth
  // If manualStreak is set (Tester Mode), use it directly as the visual streak relative to the CURRENT cycle start.
  // Otherwise, calculate based on total streak minus harvested weeks.
  const totalHarvests = badges.reduce((acc, b) => acc + b.count, 0);
  const visualStreak = manualStreak !== null 
    ? manualStreak 
    : Math.max(0, streak - (totalHarvests * 7));

  // Update plant stage based on visual streak
  useEffect(() => {
    // Determine Stage with Cyclic Logic (Repeats every 7 days)
    // Days within cycle (1-based):
    // 1-3 -> Seed
    // 4-6 -> Sprout
    // 7 (0 mod 7) -> Flower
    
    // Safety check for 0
    if (visualStreak === 0) {
      setPlantStage("seed");
      return;
    }

    const mod7 = visualStreak % 7;
    
    // Check for Flower Day (multiples of 7)
    if (mod7 === 0) {
      const flowers = ["flower", "tulip", "daffodil", "mushroom"];
      // Progression: Week 1 (Streak 7) -> 1. Week 2 (Streak 14) -> 2.
      const flowerProgression = visualStreak / 7;
      
      // Calculate which flower to show
      // If manualStreak is active, we base it purely on the absolute streak.
      // Streak 7 (Progression 1) -> Index 0. 
      // Streak 14 (Progression 2) -> Index 1.
      // If real mode, we use totalHarvests + progression.
      let currentFlowerIndex = 0;
      
      if (manualStreak !== null) {
         currentFlowerIndex = (flowerProgression - 1) % 4;
      } else {
         currentFlowerIndex = (totalHarvests + (flowerProgression - 1)) % 4;
      }
      
      // Ensure positive index
      if (currentFlowerIndex < 0) currentFlowerIndex += 4;
      
      const newStage = flowers[currentFlowerIndex] as PlantStage;
      setPlantStage(newStage);
    } 
    // Sprout Days (4, 5, 6)
    else if (mod7 >= 4) {
      setPlantStage("sprout");
    } 
    // Seed Days (1, 2, 3)
    else {
      setPlantStage("seed");
    }
  }, [visualStreak, totalHarvests, manualStreak]);

  // 1. Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchData(session.user.id);
      else setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        setActivities([]);
        setLogs([]);
        setTotalMinutes(0);
      } else {
        fetchData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const addLog = async (activityId: string, minutes: number, notes?: string, date?: string) => {
    if (!user) return;
    
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;

    const logDate = date || new Date().toISOString().split('T')[0];

    const { error } = await supabase
      .from('logs')
      .insert([
        { 
          user_id: user.id, 
          activity_id: activityId, 
          minutes, 
          notes,
          date: logDate
        }
      ]);

    if (error) {
      console.error("Error adding log:", error);
      return;
    }

    // --- SYNC STATS TO PROFILE ---
    // 1. Calculate Streak (consecutive days ending today/logDate)
    const newLogs = [...logs, { id: 'temp', activity_id: activityId, minutes, date: logDate } as Log];
    
    // Get unique dates and sort descending
    const uniqueDates = Array.from(new Set(newLogs.map(log => log.date))).sort().reverse();
    
    // Calculate consecutive streak from most recent date
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // Start from today or yesterday (allow 1-day grace)
    let checkDate = uniqueDates[0] === today ? today : (uniqueDates[0] === yesterday ? yesterday : null);
    
    if (checkDate) {
      for (const date of uniqueDates) {
        if (date === checkDate) {
          currentStreak++;
          // Move to previous day
          const prevDate: string = new Date(new Date(checkDate).getTime() - 86400000).toISOString().split('T')[0];
          checkDate = prevDate;
        } else {
          break; // Streak broken
        }
      }
    }
    
    // 2. Last Study Minutes (Last active day's total)
    const dayLogs = newLogs.filter(l => l.date === logDate);
    const dayTotal = dayLogs.reduce((acc, curr) => acc + curr.minutes, 0);

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        current_streak: currentStreak,
        last_study_minutes: dayTotal,
        last_study_date: logDate
      })
      .eq('id', user.id);
      
    if (profileError) console.error("Error syncing profile stats:", profileError);
    // -----------------------------

    await fetchData(user.id);
  };

  const bulkAddLogs = async (entries: { activityId: string, minutes: number, notes?: string }[]) => {
    if (!user || entries.length === 0) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const logsToInsert = entries.map(entry => ({
      user_id: user.id,
      activity_id: entry.activityId,
      minutes: entry.minutes,
      notes: entry.notes,
      date: todayStr
    }));

    const { error } = await supabase
      .from('logs')
      .insert(logsToInsert);

    if (error) {
      console.error("Error bulk adding logs:", error);
      return;
    }

    await fetchData(user.id);
  };

  const updateLog = async (logId: string, minutes: number, notes?: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('logs')
      .update({ minutes, notes })
      .eq('id', logId);

    if (error) {
      console.error("Error updating log:", error);
      return;
    }

    await fetchData(user.id);
  };

  const deleteLog = async (logId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('logs')
      .delete()
      .eq('id', logId);

    if (error) {
      console.error("Error deleting log:", error);
      return;
    }

    await fetchData(user.id);
  };

  const addActivity = async (title: string) => {
    if (!user) return;

    const { data: newActivity, error } = await supabase
      .from('activities')
      .insert([
        { user_id: user.id, title, total_minutes: 0, stage: "seed" }
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding activity:", error);
      return;
    }

    // @ts-ignore
    setActivities(prev => [...prev, newActivity]);
  };

  const deleteActivity = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting activity:", error);
      return;
    }

    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  const updateActivity = async (id: string, title: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('activities')
      .update({ title })
      .eq('id', id);

    if (error) {
      console.error("Error updating activity:", error);
      return;
    }

    setActivities((prev) => 
      prev.map((a) => (a.id === id ? { ...a, title } : a))
    );
  };

  const updateTweetDraft = (draft: string) => {
    setLastTweetDraft(draft);
  };

  const harvestFlower = async () => {
    const s = manualStreak ?? streak;
    // Check total streak vs total harvests to ensure they have an available "slot"
    const currentHarvestCount = badges.reduce((acc, b) => acc + b.count, 0);
    const availableHarvests = Math.floor(s / 7);

    if (!user || isHarvesting || currentHarvestCount >= availableHarvests) {
      if (currentHarvestCount >= availableHarvests && s >= 7) {
        showNotification("You've already harvested all blooms for this streak! 🎋");
      }
      return;
    }

    setIsHarvesting(true);

    // Pick a flower based on plant stage (the cycle logic)
    const flowerTypes = ["Sunflower", "Tulip", "Daffodil", "Mushroom"];
    const flowerType = flowerTypes[currentHarvestCount % 4];
    const flowerEmoji = ["🌻", "🌷", "🌼", "🍄"][currentHarvestCount % 4];

    try {
      const { data: existing } = await supabase
          .from('user_badges')
          .select('*')
          .eq('user_id', user.id)
          .eq('flower_type', flowerType)
          .maybeSingle();

      if (existing) {
          await supabase
              .from('user_badges')
              .update({ count: existing.count + 1, last_harvested_at: new Date().toISOString() })
              .eq('id', existing.id);
      } else {
          await supabase
              .from('user_badges')
              .insert([{ user_id: user.id, flower_type: flowerType, count: 1 }]);
      }

      showNotification(`Magnificent! You've harvested a ${flowerType}! ${flowerEmoji}`);
      await fetchData(user.id);
    } catch (err) {
      console.error("Harvest error:", err);
      showNotification("Could not harvest flower.");
    } finally {
      setIsHarvesting(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <StudyContext.Provider value={{ 
      user, streak: manualStreak ?? streak, totalMinutes, plantStage, logs, badges, activities, lastTweetDraft,
      addLog, bulkAddLogs, updateLog, deleteLog, isTodayLogged, addActivity, deleteActivity, updateActivity, updateTweetDraft,
      harvestFlower, logout, isLoading, setIsLoading,
      manualStreak, setManualStreak,
      notification, showNotification,
      isHarvesting,
      isAdmin
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
