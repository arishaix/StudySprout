"use client";

import { useState } from "react";
import styles from "../dashboard/page.module.css"; 
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { ArrowLeft, Zap, Search, UserPlus, Flame } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const friends = [
    { id: 1, name: "Sarah", status: "studying", emoji: "📚", streak: 45, badges: ["🌷", "🌸", "🌻"] },
    { id: 2, name: "Mike", status: "sleeping", emoji: "😴", streak: 12, badges: ["🌷", "🍂"] },
    { id: 3, name: "Jessica", status: "gaming", emoji: "🎮", streak: 7, badges: ["🌷"] },
  ];

  const filteredFriends = friends.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <header className={styles.header} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
         <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
           <Link href="/dashboard">
               <Button variant="ghost"><ArrowLeft size={20} /></Button>
           </Link>
           <h2 style={{ margin: 0 }}>Friends</h2>
         </div>
         
         <AnimatePresence mode="wait">
           {!isSearching ? (
             <motion.div
               key="add-button"
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.8 }}
               transition={{ duration: 0.2 }}
             >
               <Button 
                variant="primary" 
                onClick={() => setIsSearching(true)}
                style={{ borderRadius: "50%", width: "48px", height: "48px", padding: 0 }}
               >
                 <UserPlus size={20} />
               </Button>
             </motion.div>
           ) : (
             <motion.div
               key="search-bar"
               layoutId="search-box"
               initial={{ width: 48, opacity: 0 }}
               animate={{ width: "250px", opacity: 1 }}
               exit={{ width: 48, opacity: 0 }}
               style={{ 
                 display: "flex", 
                 alignItems: "center", 
                 background: "white", 
                 borderRadius: "25px", 
                 padding: "4px 16px",
                 border: "2px solid var(--peachy-pink)",
                 gap: "8px",
                 overflow: "hidden"
               }}
             >
               <Search size={18} color="var(--text-light)" />
               <input 
                 autoFocus
                 type="text" 
                 placeholder="Search username..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 onBlur={() => { if (!searchQuery) setIsSearching(false); }}
                 style={{ 
                   border: "none", 
                   outline: "none", 
                   flex: 1, 
                   fontSize: "0.9rem",
                   background: "transparent",
                   width: "100%"
                 }} 
               />
               <button 
                onClick={() => { setIsSearching(false); setSearchQuery(""); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-light)", padding: "4px" }}
               >
                 <motion.span whileHover={{ scale: 1.1 }}>✕</motion.span>
               </button>
             </motion.div>
           )}
         </AnimatePresence>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <AnimatePresence mode="popLayout">
          {filteredFriends.map((friend) => (
            <motion.div
              key={friend.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              layout
            >
              <Card 
                hoverable 
                className={styles.streakCard}
                onClick={() => setSelectedFriend(friend)}
              >
                 <div style={{ display: "flex", gap: "16px", alignItems: "center", flex: 1 }}>
                    <div style={{ fontSize: "2.5rem" }}>{friend.emoji}</div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {friend.name}
                          <span style={{ fontSize: "0.8rem", color: "var(--primary-purple)", background: "rgba(224, 187, 228, 0.1)", padding: "2px 8px", borderRadius: "8px" }}>
                            {friend.status}
                          </span>
                        </h3>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-light)", fontSize: "0.9rem", fontWeight: 700 }}>
                          <Flame size={14} fill="#FF922B" color="#FF922B" />
                          {friend.streak} day streak
                        </div>
                    </div>
                 </div>
                 <Button 
                   variant="secondary" 
                   onClick={(e) => { e.stopPropagation(); }}
                   style={{ borderRadius: "50%", width: "40px", height: "40px", padding: 0 }}
                 >
                    <Zap size={18} fill="#fec8d8" color="#fec8d8" />
                 </Button>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredFriends.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-light)" }}>
            No sprouts found with that name... 🌱
          </div>
        )}
      </div>

      <Modal isOpen={!!selectedFriend} onClose={() => setSelectedFriend(null)}>
        {selectedFriend && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "4rem", marginBottom: "16px" }}>{selectedFriend.emoji}</div>
            <h2 style={{ marginBottom: "8px", color: "var(--text-main)" }}>{selectedFriend.name}'s Garden</h2>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", color: "var(--text-light)", marginBottom: "24px", fontWeight: 700 }}>
              <Flame size={20} fill="#FF922B" color="#FF922B" />
              {selectedFriend.streak} Days Consistency
            </div>
            
            <p style={{ marginBottom: "16px", fontSize: "0.9rem", color: "var(--text-light)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
              Harvested Badges
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              {(selectedFriend.badges || []).map((badge: string, i: number) => (
                <motion.div 
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  style={{ width: "60px", height: "60px", background: "var(--bg-cream)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", border: "2px solid white", boxShadow: "var(--shadow-sm)" }}
                >
                  {badge}
                </motion.div>
              ))}
            </div>
            
            <Button variant="primary" style={{ marginTop: "32px", width: "100%" }} onClick={() => setSelectedFriend(null)}>
              Close
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
