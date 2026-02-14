"use client";

import { useState, useEffect } from "react";
import styles from "../dashboard/page.module.css"; 
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { ArrowLeft, Zap, Search, UserPlus, Flame, Mail, Check, X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useStudy } from "../lib/StudyContext";

export default function FriendsPage() {
  const { user, showNotification } = useStudy();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  // Requests State
  const [requests, setRequests] = useState<any[]>([]);
  const [showRequests, setShowRequests] = useState(false);
  
  // Friend Badge state for modal
  const [friendBadges, setFriendBadges] = useState<any[]>([]);

  // Fetch Friends
  const fetchFriends = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('friendships')
      .select(`
        id,
        friend:profiles!friend_id (
          id, username, avatar_url, plant_type, current_streak, last_study_minutes
        )
      `)
      .eq('user_id', user.id);
    
    if (data) {
      setFriends(data.map((f: any) => ({
        id: f.friend.id,
        name: f.friend.username,
        // status: f.friend.last_study_minutes ? `${f.friend.last_study_minutes}m today` : "sleeping",
        emoji: f.friend.plant_type === "flower" ? "🌺" : (f.friend.plant_type === "sprout" ? "🌿" : "🍄"),
        streak: f.friend.current_streak || 0,
        badges: [] 
      })));
    }
  };

  // Fetch Requests
  const fetchRequests = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('friend_requests')
      .select(`
        id,
        sender:profiles!sender_id (
          id, username, avatar_url
        )
      `)
      .eq('receiver_id', user.id)
      .eq('status', 'pending');
      
    if (data) {
      setRequests(data);
    }
  };

  useEffect(() => {
    fetchFriends();
    fetchRequests();
  }, [user]);

  // Fetch friend badges when modal opens
  useEffect(() => {
    const fetchFriendBadges = async () => {
      if (!selectedFriend) {
        setFriendBadges([]);
        return;
      }
      
      const { data } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', selectedFriend.id);
      
      if (data) setFriendBadges(data);
    };
    
    fetchFriendBadges();
  }, [selectedFriend]);

  // Search Users
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery || searchQuery.length < 3) {
        setSearchResults([]);
        return;
      }
      
      const { data } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${searchQuery}%`)
        .neq('id', user?.id) // Don't show self
        .limit(5);

      // Filter out existing friends
      const friendIds = new Set(friends.map(f => f.id));
      const filtered = (data || []).filter((p: any) => !friendIds.has(p.id));
      
      setSearchResults(filtered);
    };
    
    const timeoutId = setTimeout(searchUsers, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, user, friends]);

  // Send Request
  const handleSendRequest = async (friendId: string) => {
    if (!user) return;
    
    // Check if already requested? (Optimistic check)
    // For now just try insert
    const { error } = await supabase
        .from('friend_requests')
        .insert([{ sender_id: user.id, receiver_id: friendId }]);
    
    if (error) {
        if (error.code === "23505") showNotification("Request already sent!");
        else showNotification("Could not send request.");
    } else {
        showNotification("Request sent! 📩");
        setSearchQuery("");
        setIsSearching(false);
    }
  };

  // Accept Request
  const handleAcceptRequest = async (requestId: string) => { // Removed senderId param as it's not needed for RPC
    if (!user) return;

    try {
      const { error } = await supabase
        .rpc('accept_friend_request', { request_id: requestId });

      if (error) throw error;

      // Refresh UI locally
      const request = requests.find(r => r.id === requestId);
      if (request) {
        // Optimistic UI update or just refetch
        setRequests(prev => prev.filter(r => r.id !== requestId));
        await fetchFriends(); 
        showNotification(`Friend added! 🌱`);
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      showNotification("Could not accept request.");
    }
  };

  // Ignore Request
  const handleIgnoreRequest = async (requestId: string) => {
    await supabase
      .from('friend_requests')
      .delete()
      .eq('id', requestId);
      
    setRequests(prev => prev.filter(r => r.id !== requestId));
  };

  // Remove Friend
  const [friendToRemove, setFriendToRemove] = useState<any>(null);

  // Helper to get emoji for flower type
  const getFlowerEmoji = (type: string) => {
    switch (type) {
      case 'Sunflower': return '🌻';
      case 'Tulip': return '🌷';
      case 'Daffodil': return '🌼';
      case 'Mushroom': return '🍄';
      case 'Sakura': return '🌸';
      case 'Rose': return '🌹';
      default: return '🍄'; // Default to Mushroom
    }
  };

  const handleRemoveFriend = async () => {
    if (!user || !friendToRemove) return;

    // Delete both sides of the friendship
    const { error } = await supabase
      .from('friendships')
      .delete()
      .or(`and(user_id.eq.${user.id},friend_id.eq.${friendToRemove.id}),and(user_id.eq.${friendToRemove.id},friend_id.eq.${user.id})`);

    if (error) {
      console.error("Error removing friend:", error);
      showNotification("Failed to remove friend.");
    } else {
      setFriends(prev => prev.filter(f => f.id !== friendToRemove.id));
      setFriendToRemove(null);
      showNotification("Friend removed. 🍂");
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
         {/* ... (Header content remains the same) ... */}
         <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
           <Link href="/dashboard">
               <Button variant="ghost"><ArrowLeft size={20} /></Button>
           </Link>
           <h2 style={{ margin: 0 }}>Friends</h2>
         </div>
         
         <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
           {/* Requests Inbox */}
           <div style={{ position: "relative" }}>
             <Button 
               variant="secondary"
               onClick={() => setShowRequests(!showRequests)}
               style={{ borderRadius: "50%", width: "48px", height: "48px", padding: 0, position: "relative" }}
             >
               <Mail size={20} />
               {requests.length > 0 && (
                 <span style={{ position: "absolute", top: -2, right: -2, background: "var(--primary-purple)", color: "white", fontSize: "0.7rem", width: "18px", height: "18px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                   {requests.length}
                 </span>
               )}
             </Button>

             {/* Requests Dropdown */}
             <AnimatePresence>
               {showRequests && (
                 <motion.div
                   initial={{ opacity: 0, y: 10, scale: 0.95 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   exit={{ opacity: 0, y: 10, scale: 0.95 }}
                   style={{
                     position: "absolute",
                     top: "120%",
                     right: 0,
                     width: "300px",
                     background: "var(--bg-cream)",
                     borderRadius: "16px",
                     boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                     border: "2px solid var(--primary-purple)",
                     zIndex: 100,
                     padding: "16px"
                   }}
                 >
                   <h3 style={{ fontSize: "1rem", marginBottom: "12px" }}>Incoming Requests</h3>
                   {requests.length === 0 ? (
                     <p style={{ color: "var(--text-light)", fontSize: "0.9rem" }}>No new requests.</p>
                   ) : (
                     <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                       {requests.map(req => (
                         <div key={req.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                           <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                             <div style={{ fontSize: "1.2rem" }}>🌱</div>
                             <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{req.sender.username}</span>
                           </div>
                           <div style={{ display: "flex", gap: "8px" }}>
                             <button 
                               onClick={() => handleAcceptRequest(req.id)}
                               style={{ background: "var(--soft-teal)", border: "none", borderRadius: "8px", padding: "6px", cursor: "pointer", color: "white" }}
                             >
                               <Check size={16} />
                             </button>
                             <button 
                               onClick={() => handleIgnoreRequest(req.id)}
                               style={{ background: "#eee", border: "none", borderRadius: "8px", padding: "6px", cursor: "pointer", color: "#666" }}
                             >
                               <X size={16} />
                             </button>
                           </div>
                         </div>
                       ))}
                     </div>
                   )}
                 </motion.div>
               )}
             </AnimatePresence>
           </div>

           {/* Search Button */}
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
                   position: "relative",
                   background: "var(--bg-cream)", 
                   borderRadius: "25px", 
                   border: "2px solid var(--primary-purple)",
                   zIndex: 50
                 }}
               >
                 <div style={{ display: "flex", alignItems: "center", padding: "4px 16px", gap: "8px" }}>
                  <Search size={18} color="var(--text-light)" />
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="Search username..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ 
                      border: "none", 
                      outline: "none", 
                      flex: 1, 
                      fontSize: "0.9rem",
                      background: "transparent",
                      width: "100%",
                      color: "var(--text-main)" 
                    }} 
                  />
                  <button 
                    onClick={() => { setIsSearching(false); setSearchQuery(""); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-light)", padding: "4px" }}
                  >
                    ✕
                  </button>
                 </div>
                 
                 {/* Search Results Dropdown */}
                 {searchResults.length > 0 && (
                     <div style={{ 
                         position: "absolute", 
                         top: "100%", 
                         left: 0, 
                         right: 0, 
                         background: "var(--bg-cream)", 
                         marginTop: "8px", 
                         borderRadius: "12px", 
                         boxShadow: "0 4px 20px rgba(0,0,0,0.1)", 
                         padding: "8px",
                         display: "flex",
                         flexDirection: "column",
                         gap: "4px"
                     }}>
                         {searchResults.map(result => (
                             <div 
                              key={result.id} 
                              onClick={() => handleSendRequest(result.id)}
                              style={{ padding: "8px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "background 0.2s" }}
                              className={styles.searchResultItem}
                             >
                                 <div style={{ fontSize: "1.2rem" }}>🍄</div>
                                 <span style={{ color: "var(--text-main)", fontWeight: 500 }}>{result.username}</span>
                                 <UserPlus size={14} style={{ marginLeft: "auto", color: "var(--primary-purple)" }} />
                             </div>
                         ))}
                     </div>
                 )}
               </motion.div>
             )}
           </AnimatePresence>
         </div>
      </header>

      {/* Notification Toast is now global in layout.tsx */}

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <AnimatePresence mode="popLayout">
          {friends.map((friend) => (
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
                        </h3>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text-light)", fontSize: "0.85rem", fontWeight: 600, marginTop: "4px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <Flame size={14} fill="#FF922B" color="#FF922B" />
                              {friend.streak} day streak
                          </span>
                        </div>
                    </div>
                    {/* Remove Friend Button */}
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setFriendToRemove(friend); 
                      }}
                      style={{ 
                        background: "none", 
                        border: "none", 
                        cursor: "pointer", 
                        color: "var(--text-light)", 
                        padding: "8px",
                        opacity: 0.6,
                        transition: "opacity 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = "0.6"}
                    >
                      <X size={20} />
                    </button>
                 </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {friends.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-light)" }}>
            No mushrooms found... 🍄<br/>Add friends to see their progress!
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
            
            <p style={{ marginBottom: "16px", fontSize: "0.8rem", color: "var(--text-light)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
              Harvested Flowers 🎋
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
              {friendBadges.length === 0 ? (
                <p style={{ fontSize: "0.85rem", color: "var(--text-light)" }}>No flowers harvested yet.</p>
              ) : (
                friendBadges.map((badge, i) => (
                  <motion.div 
                    key={badge.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    style={{ 
                      width: "48px", 
                      height: "48px", 
                      background: "var(--bg-cream)", 
                      borderRadius: "12px", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      fontSize: "1.5rem", 
                      border: "2px solid white", 
                      boxShadow: "var(--shadow-sm)",
                      position: "relative"
                    }}
                  >
                    {getFlowerEmoji(badge.flower_type)}
                    {badge.count > 1 && (
                      <div style={{
                        position: "absolute",
                        top: "-4px",
                        right: "-4px",
                        background: "var(--primary-purple)",
                        color: "white",
                        borderRadius: "10px",
                        padding: "1px 6px",
                        fontSize: "0.6rem",
                        fontWeight: 800
                      }}>
                        {badge.count}x
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
            
            <Button variant="primary" style={{ marginTop: "32px", width: "100%" }} onClick={() => setSelectedFriend(null)}>
              Close
            </Button>
          </div>
        )}
      </Modal>

      {/* Confirmation Modal for Removing Friend */}
      <Modal isOpen={!!friendToRemove} onClose={() => setFriendToRemove(null)}>
        {friendToRemove && (
          <div style={{ textAlign: "center", padding: "8px" }}>
             <h3 style={{ marginBottom: "16px", color: "var(--text-main)" }}>Remove Friend?</h3>
             <p style={{ color: "var(--text-light)", marginBottom: "24px" }}>
               Are you sure you want to remove <strong>{friendToRemove.name}</strong> from your friend list ? 🍂
             </p>
             <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
               <Button variant="secondary" onClick={() => setFriendToRemove(null)}>Cancel</Button>
               <Button 
                 variant="primary" 
                 style={{ background: "#ff6b6b", borderColor: "#ff6b6b", color: "white" }}
                 onClick={handleRemoveFriend}
               >
                 Remove
               </Button>
             </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
