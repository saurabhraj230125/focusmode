  const renderCommunity = () => {
    const getProfileData = (username) => {
      if (usersDb[username]) return usersDb[username].profile;
      const post = feed.find(f => f.user === username);
      return { prepType: post?.prep || "JEE", xp: post?.xp || 0 };
    };

    const onlineThreshold = 5 * 60 * 1000;
    const now = Date.now();
    
    // Build unique users from feed and mark them online if active recently
    const recentUsersMap = new Map();
    feed.forEach(f => {
       if (f.user !== sessionUser) {
          if (!recentUsersMap.has(f.user)) recentUsersMap.set(f.user, f.createdAt);
          else if (f.createdAt > recentUsersMap.get(f.user)) recentUsersMap.set(f.user, f.createdAt);
       }
    });
    
    const allPeers = Array.from(recentUsersMap.keys()).map(user => ({
       name: user,
       isOnline: (now - recentUsersMap.get(user)) < onlineThreshold
    })).sort((a,b) => b.isOnline - a.isOnline); // Online first

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

    const handleCreateMission = () => {
       const title = prompt("Enter Mission Title (e.g. Complete Mechanics):");
       if (!title) return;
       const desc = prompt("Enter short description:");
       const newMission = {
          id: Date.now().toString(),
          admin: sessionUser,
          title,
          desc: desc || "",
          target: 100,
          members: [{ user: sessionUser, progress: 0 }]
       };
       const updated = [...squadMissions, newMission];
       setSquadMissions(updated);
       localStorage.setItem("pm_squads", JSON.stringify(updated));
    };

    const handleJoinMission = (missionId) => {
       setSquadMissions(prev => {
          const updated = prev.map(m => {
             if (m.id === missionId && !m.members.find(x => x.user === sessionUser)) {
                return { ...m, members: [...m.members, { user: sessionUser, progress: 0 }] };
             }
             return m;
          });
          localStorage.setItem("pm_squads", JSON.stringify(updated));
          return updated;
       });
       alert("Joined the mission! Update your progress daily.");
    };

    const handleUpdateMissionProgress = (missionId) => {
       const prg = parseInt(prompt("Enter your progress percentage (0-100):"));
       if (isNaN(prg) || prg < 0 || prg > 100) return;
       setSquadMissions(prev => {
          const updated = prev.map(m => {
             if (m.id === missionId) {
                return {
                   ...m,
                   members: m.members.map(mbr => mbr.user === sessionUser ? { ...mbr, progress: prg } : mbr)
                };
             }
             return m;
          });
          localStorage.setItem("pm_squads", JSON.stringify(updated));
          return updated;
       });
    };

    return (
      <div className="community-wrapper animate-fade-in" style={{maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", gap: "1rem"}}>
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
                <p style={{color:"var(--accent-success)", fontSize:"0.88rem", fontWeight:600, marginBottom:"12px"}}>⚡ Lvl {pL} · {pT}</p>
                <button className="btn-primary" style={{width: "100%", padding: "8px"}} onClick={() => { setActiveChat(`user:${viewingProfile}`); setActiveCommunityTab("chat"); setViewingProfile(null); }}>💬 Direct Message</button>
              </div>
            </div>
          );
        })()}

        {/* Top Navigation Tabs */}
        <div style={{display: "flex", gap: "1rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px"}}>
           <button onClick={() => setActiveCommunityTab("chat")} style={{padding: "8px 24px", borderRadius: "100px", background: activeCommunityTab === "chat" ? "var(--accent-physics)" : "rgba(255,255,255,0.05)", border: "none", color: "white", fontWeight: "bold", cursor: "pointer"}}>💬 Live Chat</button>
           <button onClick={() => setActiveCommunityTab("squads")} style={{padding: "8px 24px", borderRadius: "100px", background: activeCommunityTab === "squads" ? "var(--accent-math)" : "rgba(255,255,255,0.05)", border: "none", color: "white", fontWeight: "bold", cursor: "pointer"}}>🎯 Squad Missions</button>
        </div>

        {/* Tab Content */}
        {activeCommunityTab === "chat" ? (
          <div className="community-chat-layout" style={{display: "grid", gap: "1rem", flex: 1, minHeight: 0}}>
            {/* Left Peers List */}
            <div className="glass peers-sidebar" style={{borderRadius: "20px", overflowY: "auto", padding: "1rem"}}>
              <h3 style={{fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "6px"}}><Users size={16}/> Direct Messages</h3>
              <div className={`subreddit-item ${activeChat === "global" ? "active" : ""}`} onClick={() => setActiveChat("global")}>
                <div className="subreddit-icon">🌍</div>
                <span>Global Lounge</span>
              </div>
              <h3 style={{fontSize: "0.85rem", color: "var(--text-muted)", margin: "1.5rem 0 1rem 0", paddingLeft: "8px"}}>Online Peers</h3>
              <div style={{display: "flex", flexDirection: "column", gap: "4px"}}>
                {allPeers.map(peer => (
                  <div key={peer.name} className={`subreddit-item ${activeChat === `user:${peer.name}` ? "active" : ""}`} onClick={() => setActiveChat(`user:${peer.name}`)} style={{display: "flex", alignItems: "center", gap: "8px", position: "relative"}}>
                    <div style={{width: "24px", height: "24px", borderRadius: "50%", background: getAvatarColor(peer.name), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: "bold", flexShrink: 0}}>{peer.name.charAt(0).toUpperCase()}</div>
                    <span style={{overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, color: peer.isOnline ? "white" : "var(--text-muted)"}}>{peer.name}</span>
                    <div style={{width: "8px", height: "8px", borderRadius: "50%", background: peer.isOnline ? "#10b981" : "rgba(255,255,255,0.2)", boxShadow: peer.isOnline ? "0 0 5px #10b981" : "none"}}></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="glass chat-main-area" style={{borderRadius: "20px", display: "flex", flexDirection: "column", overflow: "hidden"}}>
              <div style={{padding: "1rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: "12px"}}>
                <div style={{width: "40px", height: "40px", borderRadius: "50%", background: activeChat === "global" ? "linear-gradient(135deg, #3b82f6, #8b5cf6)" : getAvatarColor(activeChat.split(":")[1]), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem"}}>{activeChat === "global" ? "🌍" : activeChat.split(":")[1].charAt(0).toUpperCase()}</div>
                <div>
                  <h2 style={{fontSize: "1.1rem", fontWeight: "bold", margin: 0}}>{activeChat === "global" ? "Global Lounge" : activeChat.split(":")[1]}</h2>
                  <span style={{fontSize: "0.75rem", color: "#10b981"}}>Active Chat</span>
                </div>
              </div>
              
              <div style={{flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column-reverse", gap: "1rem"}}>
                {chatMessages.length === 0 ? (
                  <div style={{textAlign: "center", color: "var(--text-muted)", margin: "auto"}}>No messages yet. Say hi! 👋</div>
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
          </div>
        ) : (
          <div style={{display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto", paddingBottom: "2rem"}}>
             <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem"}}>
                <div>
                   <h2 style={{fontSize: "1.5rem", fontWeight: "bold"}}>Collaborative Squad Missions</h2>
                   <p style={{color: "var(--text-muted)", fontSize: "0.9rem"}}>Create study groups, track syllabus progress, and compete together.</p>
                </div>
                <button className="btn-primary" onClick={handleCreateMission}><Plus size={16}/> Create Mission</button>
             </div>
             
             {squadMissions.length === 0 ? (
               <div className="glass" style={{textAlign: "center", padding: "3rem", color: "var(--text-muted)"}}>No active missions. Be the first to create one!</div>
             ) : (
               <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem"}}>
                 {squadMissions.map(mission => {
                    const isMember = mission.members.some(m => m.user === sessionUser);
                    return (
                      <div key={mission.id} className="glass" style={{padding: "1.5rem", borderRadius: "20px", display: "flex", flexDirection: "column", gap: "1rem"}}>
                         <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}>
                            <div>
                               <h3 style={{fontSize: "1.1rem", fontWeight: "bold", color: "var(--accent-math)"}}>{mission.title}</h3>
                               <span style={{fontSize: "0.75rem", color: "var(--text-muted)"}}>Admin: {mission.admin}</span>
                            </div>
                            <span style={{background: "rgba(16,185,129,0.15)", color: "var(--accent-success)", padding: "4px 8px", borderRadius: "8px", fontSize: "0.7rem", fontWeight: "bold"}}>{mission.members.length} Peers</span>
                         </div>
                         <p style={{fontSize: "0.85rem", color: "var(--text-muted)", minHeight: "40px"}}>{mission.desc}</p>
                         
                         <div style={{background: "rgba(0,0,0,0.2)", padding: "1rem", borderRadius: "12px"}}>
                            <h4 style={{fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "8px"}}>Squad Progress:</h4>
                            {mission.members.map(member => (
                               <div key={member.user} style={{marginBottom: "10px"}}>
                                  <div style={{display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "4px"}}>
                                     <span style={{fontWeight: member.user === sessionUser ? "bold" : "normal", color: member.user === sessionUser ? "white" : "var(--text-muted)"}}>{member.user}</span>
                                     <span>{member.progress}%</span>
                                  </div>
                                  <div style={{width: "100%", height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "100px", overflow: "hidden"}}>
                                     <div style={{width: `${member.progress}%`, height: "100%", background: member.user === sessionUser ? "var(--accent-physics)" : "var(--accent-chem)", borderRadius: "100px", transition: "width 0.3s"}}></div>
                                  </div>
                               </div>
                            ))}
                         </div>
                         
                         <div style={{marginTop: "auto"}}>
                            {!isMember ? (
                               <button className="btn-primary" style={{width: "100%", padding: "10px", background: "rgba(255,255,255,0.1)", color: "white"}} onClick={() => handleJoinMission(mission.id)}>Join Mission</button>
                            ) : (
                               <button className="btn-primary" style={{width: "100%", padding: "10px"}} onClick={() => handleUpdateMissionProgress(mission.id)}>Update My Progress</button>
                            )}
                         </div>
                      </div>
                    );
                 })}
               </div>
             )}
          </div>
        )}
      </div>
    );
  };
