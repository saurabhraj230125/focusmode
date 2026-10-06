
  const renderCommunity = () => {
    const getProfileData = (username) => {
      if (usersDb[username]) return usersDb[username].profile;
      const post = feed.find(f => f.user === username);
      return { prepType: post?.prep || "JEE", xp: post?.xp || 0 };
    };

    const onlineUsers = Array.from(new Set(feed.map(f => f.user))).filter(u => u !== sessionUser).slice(0, 15);
    const activeMissions = [
      { id: 1, title: "Complete Calculus Chapter", progress: 65, members: 4, color: "var(--accent-math)" },
      { id: 2, title: "Solve 50 Physics PYQs", progress: 30, members: 8, color: "var(--accent-physics)" },
      { id: 3, title: "Master Organic Chemistry", progress: 85, members: 12, color: "var(--accent-chem)" }
    ];

    const chatMessages = feed.filter(f => {
       if (activeChat === "global") return !f.action.startsWith("@DM_");
       const targetUser = activeChat.split(":")[1];
       return f.action.startsWith(`@DM_${sessionUser}_${targetUser}`) || f.action.startsWith(`@DM_${targetUser}_${sessionUser}`);
    });

    const handleSendMessage = (e) => {
      e.preventDefault();
      if (!chatInput.trim()) return;
      
      let finalMsg = chatInput;
      if (activeChat !== "global") {
        const targetUser = activeChat.split(":")[1];
        finalMsg = `@DM_${sessionUser}_${targetUser} ${finalMsg}`;
      }
      
      const fakeEvent = { preventDefault: () => {} };
      setNewPostText(finalMsg);
      setTimeout(() => {
        handlePostFeed(fakeEvent);
      }, 0);
      setChatInput("");
    };

    return (
      <div className="community-reddit-layout animate-fade-in" style={{gridTemplateColumns: "250px 1fr 300px"}}>
        {/* Profile Modal */}
        {viewingProfile && (() => {
          const prof = getProfileData(viewingProfile);
          const { level: pL, title: pT } = getLevelData(prof?.xp || 0);
          return (
            <div style={{position:"fixed", inset:0, zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.8)", backdropFilter:"blur(10px)", padding:"1rem"}} onClick={() => setViewingProfile(null)}>
              <div className="glass" style={{maxWidth:"400px", width:"100%", padding:"2rem", borderRadius:"24px", position:"relative"}} onClick={e => e.stopPropagation()}>
                <button onClick={() => setViewingProfile(null)} style={{position:"absolute", top:"16px", right:"16px", background:"transparent", border:"none", color:"var(--text-muted)", cursor:"pointer", zIndex: 10}}><X size={20}/></button>
                <div style={{height:"80px", borderRadius:"14px 14px 0 0", marginBottom:"-30px", background:`linear-gradient(135deg, ${getAvatarColor(viewingProfile)}, #1a1c29)`, marginLeft:"-2rem", marginRight:"-2rem", marginTop:"-2rem"}}></div>
                <div style={{width:"68px", height:"68px", borderRadius:"50%", background:getAvatarColor(viewingProfile), display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.8rem", fontWeight:"bold", border:"3px solid #0f1015", position:"relative", zIndex:1}}>{viewingProfile.charAt(0).toUpperCase()}</div>
                <h2 style={{fontSize:"1.25rem", fontWeight:800, marginTop:"8px"}}>{viewingProfile}</h2>
                <p style={{color:"var(--accent-success)", fontSize:"0.88rem", fontWeight:600, marginBottom:"12px"}}>? Lvl {pL} · {pT}</p>
                <button className="btn-primary" style={{width: "100%", padding: "8px"}} onClick={() => { setActiveChat(`user:${viewingProfile}`); setViewingProfile(null); }}>?? Message {viewingProfile}</button>
              </div>
            </div>
          );
        })()}

        {/* Left Sidebar - Online Peers */}
        <div className="community-left-sidebar" style={{display: "flex", flexDirection: "column", gap: "1rem"}}>
          <div className="glass" style={{padding: "1rem 0.5rem", borderRadius: "20px"}}>
            <h3 style={{fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.75rem", paddingLeft: "14px", display: "flex", alignItems: "center", gap: "6px"}}><Users size={14}/> Peers</h3>
            <div className={`subreddit-item ${activeChat === "global" ? "active" : ""}`} onClick={() => setActiveChat("global")}>
              <div className="subreddit-icon">??</div>
              <span>Global Lounge</span>
            </div>
            <h3 style={{fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", margin: "1.5rem 0 0.75rem 0", paddingLeft: "14px"}}>Online Now</h3>
            <div style={{maxHeight: "40vh", overflowY: "auto"}}>
              {onlineUsers.map(u => (
                <div key={u} className={`subreddit-item ${activeChat === `user:${u}` ? "active" : ""}`} onClick={() => setActiveChat(`user:${u}`)} style={{display: "flex", alignItems: "center", gap: "8px", position: "relative"}}>
                  <div style={{width: "24px", height: "24px", borderRadius: "50%", background: getAvatarColor(u), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: "bold", flexShrink: 0}}>{u.charAt(0).toUpperCase()}</div>
                  <span style={{overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1}}>{u}</span>
                  <div style={{width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 5px #10b981"}}></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Feed Column */}
        <div className="community-feed-col glass" style={{borderRadius: "20px", display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", padding: 0, overflow: "hidden"}}>
          <div style={{padding: "1rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: "12px"}}>
            <div style={{width: "40px", height: "40px", borderRadius: "50%", background: activeChat === "global" ? "linear-gradient(135deg, #3b82f6, #8b5cf6)" : getAvatarColor(activeChat.split(":")[1]), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem"}}>{activeChat === "global" ? "??" : activeChat.split(":")[1].charAt(0).toUpperCase()}</div>
            <div>
              <h2 style={{fontSize: "1.1rem", fontWeight: "bold", margin: 0}}>{activeChat === "global" ? "Global Lounge" : activeChat.split(":")[1]}</h2>
              <span style={{fontSize: "0.75rem", color: "#10b981"}}>Online</span>
            </div>
          </div>
          
          <div style={{flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column-reverse", gap: "1rem"}}>
            {chatMessages.length === 0 ? (
              <div style={{textAlign: "center", color: "var(--text-muted)", margin: "auto"}}>No messages yet. Say hi! ??</div>
            ) : (
              chatMessages.map(msg => {
                const isMe = msg.user === sessionUser;
                const text = activeChat === "global" ? msg.action : msg.action.replace(/^@DM_[^\s]+\s/, "");
                return (
                  <div key={msg.id} style={{display: "flex", gap: "12px", alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "80%"}}>
                    {!isMe && <div style={{width: "32px", height: "32px", borderRadius: "50%", background: getAvatarColor(msg.user), flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", cursor: "pointer"}} onClick={() => setViewingProfile(msg.user)}>{msg.user.charAt(0).toUpperCase()}</div>}
                    <div style={{background: isMe ? "var(--accent-physics)" : "rgba(255,255,255,0.05)", padding: "10px 14px", borderRadius: isMe ? "16px 16px 0 16px" : "16px 16px 16px 0", border: isMe ? "none" : "1px solid rgba(255,255,255,0.1)"}}>
                      {!isMe && activeChat === "global" && <div style={{fontSize: "0.75rem", color: "var(--accent-success)", fontWeight: "bold", marginBottom: "4px", cursor: "pointer"}} onClick={() => setViewingProfile(msg.user)}>{msg.user}</div>}
                      <div style={{fontSize: "0.95rem", lineHeight: 1.4, wordBreak: "break-word"}}>{text}</div>
                      <div style={{fontSize: "0.65rem", color: isMe ? "rgba(255,255,255,0.7)" : "var(--text-muted)", marginTop: "6px", textAlign: "right"}}><TimeAgo date={msg.createdAt} fallback={msg.time}/></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          <div style={{padding: "1rem", borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)"}}>
            <form onSubmit={handleSendMessage} style={{display: "flex", gap: "10px"}}>
              <input type="text" className="input-field" placeholder={`Message ${activeChat === "global" ? "Global Lounge" : activeChat.split(":")[1]}...`} value={chatInput} onChange={e => setChatInput(e.target.value)} style={{flex: 1, padding: "12px 16px", borderRadius: "100px", fontSize: "0.95rem"}} />
              <button type="submit" className="btn-primary" style={{borderRadius: "50%", width: "45px", height: "45px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center"}} disabled={!chatInput.trim()}><Send size={18}/></button>
            </form>
          </div>
        </div>

        {/* Right Sidebar - Missions & Leaderboard */}
        <div className="community-sidebar-col" style={{display: "flex", flexDirection: "column", gap: "1rem"}}>
          <div className="glass" style={{padding: "1.5rem", borderRadius: "20px"}}>
            <h3 style={{fontSize: "1rem", fontWeight: 800, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px"}}><Target size={16} color="var(--accent-math)"/> Squad Missions</h3>
            <div style={{display: "flex", flexDirection: "column", gap: "12px"}}>
              {activeMissions.map(mission => (
                <div key={mission.id} style={{background: "rgba(255,255,255,0.03)", padding: "10px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)"}}>
                  <div style={{fontSize: "0.85rem", fontWeight: "bold", marginBottom: "6px"}}>{mission.title}</div>
                  <div style={{display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "4px"}}>
                    <span>{mission.members} Peers</span>
                    <span>{mission.progress}%</span>
                  </div>
                  <div style={{width: "100%", height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px"}}>
                    <div style={{width: `${mission.progress}%`, height: "100%", background: mission.color, borderRadius: "2px"}}></div>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-primary" style={{width: "100%", marginTop: "1rem", padding: "8px", fontSize: "0.85rem"}} onClick={() => alert("Mission joined! Collaborate with your peers to complete it.")}>+ Join a Mission</button>
          </div>

          <div className="glass leaderboard-card" style={{borderRadius: "20px"}}>
            <h3 style={{fontSize: "1rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem"}}><Trophy size={16} color="#fbbf24"/> Top Scorers</h3>
            {combinedLeaderboard.slice(0,5).map((lb, idx) => {
              const isMe = lb.name.includes("(You)");
              const medal = idx === 0 ? "??" : idx === 1 ? "??" : idx === 2 ? "??" : null;
              const { level: lbLevel } = getLevelData(lb.score);
              const mockStreak = isMe ? studyStreak : Math.max(1, Math.floor(lb.score / 200));
              return (
                <div key={lb.name} className="leaderboard-item" style={{cursor: "pointer", padding: "10px 0", borderBottom: idx < 4 ? "1px solid rgba(255,255,255,0.05)" : "none", background: isMe ? "rgba(139,92,246,0.06)" : "transparent", borderRadius: isMe ? "10px" : 0}} onClick={() => setViewingProfile(lb.name.replace(" (You)",""))}>
                  <div style={{display: "flex", alignItems: "center", gap: "8px", width: "100%"}}>
                    <span style={{fontSize: "1.1rem", width: "24px", flexShrink: 0}}>{medal || `#${lb.rank}`}</span>
                    <div style={{flex: 1, minWidth: 0}}>
                      <div style={{fontWeight: 700, fontSize: "0.88rem", color: isMe ? "var(--accent-physics)" : "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{lb.name}</div>
                      <div style={{display: "flex", gap: "6px", marginTop: "3px", alignItems: "center"}}>
                        <span style={{fontSize: "0.68rem", color: "var(--accent-success)", fontWeight: 700}}>Lvl {lbLevel}</span>
                        <span style={{fontSize: "0.68rem", color: "#fb923c", fontWeight: 700}}>?? {mockStreak}d</span>
                      </div>
                    </div>
                    <span style={{fontWeight: 800, fontSize: "0.85rem", color: "#fbbf24", flexShrink: 0}}>{lb.score.toLocaleString()} XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

