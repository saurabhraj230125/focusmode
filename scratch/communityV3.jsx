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
          if (!recentUsersMap.has(f.user)) recentUsersMap.set(f.user, f);
          else if (f.createdAt > recentUsersMap.get(f.user).createdAt) recentUsersMap.set(f.user, f);
       }
    });
    
    const allPeers = Array.from(recentUsersMap.values()).map(f => {
       const isOnline = (now - f.createdAt) < onlineThreshold;
       const { level } = getLevelData(f.xp || 0);
       return { name: f.user, xp: f.xp, level, isOnline };
    }).sort((a,b) => b.isOnline - a.isOnline);

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
      <div className="community-wrapper animate-fade-in" style={{maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", height: "calc(100vh - 100px)", gap: "1rem"}}>
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
        <div style={{display: "flex", gap: "1rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px", flexShrink: 0}}>
           <button onClick={() => setActiveCommunityTab("chat")} style={{padding: "10px 28px", borderRadius: "100px", background: activeCommunityTab === "chat" ? "linear-gradient(135deg, var(--accent-physics), #c026d3)" : "rgba(255,255,255,0.05)", border: "none", color: "white", fontWeight: "bold", cursor: "pointer", transition: "all 0.3s", boxShadow: activeCommunityTab === "chat" ? "0 4px 15px rgba(139, 92, 246, 0.4)" : "none", display: "flex", alignItems: "center", gap: "8px"}}><MessageSquare size={18}/> Live Lounge</button>
           <button onClick={() => setActiveCommunityTab("squads")} style={{padding: "10px 28px", borderRadius: "100px", background: activeCommunityTab === "squads" ? "linear-gradient(135deg, var(--accent-math), #2563eb)" : "rgba(255,255,255,0.05)", border: "none", color: "white", fontWeight: "bold", cursor: "pointer", transition: "all 0.3s", boxShadow: activeCommunityTab === "squads" ? "0 4px 15px rgba(59, 130, 246, 0.4)" : "none", display: "flex", alignItems: "center", gap: "8px"}}><Target size={18}/> Squad Missions</button>
        </div>

        {/* Tab Content */}
        {activeCommunityTab === "chat" ? (
          <div className="community-chat-layout" style={{display: "grid", gap: "1.5rem", flex: 1, minHeight: 0}}>
            {/* Left Peers List - Gamified Sidebar */}
            <div className="glass peers-sidebar" style={{borderRadius: "24px", overflowY: "auto", padding: "0", display: "flex", flexDirection: "column", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(15, 23, 42, 0.6)"}}>
              <div style={{padding: "1.25rem", borderBottom: "1px solid rgba(255,255,255,0.05)", position: "sticky", top: 0, background: "rgba(15, 23, 42, 0.95)", backdropFilter: "blur(10px)", zIndex: 10}}>
                 <h3 style={{fontSize: "0.9rem", color: "white", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px", textTransform: "uppercase", letterSpacing: "1px"}}><Users size={16} color="var(--accent-physics)"/> Connect</h3>
              </div>
              
              <div style={{padding: "1rem"}}>
                <div className={`peer-item ${activeChat === "global" ? "active" : ""}`} onClick={() => setActiveChat("global")} style={{display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "16px", cursor: "pointer", transition: "all 0.2s", background: activeChat === "global" ? "rgba(139, 92, 246, 0.15)" : "transparent", border: activeChat === "global" ? "1px solid rgba(139, 92, 246, 0.3)" : "1px solid transparent", marginBottom: "1rem"}}>
                  <div style={{width: "42px", height: "42px", borderRadius: "12px", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0, boxShadow: "0 4px 10px rgba(139,92,246,0.3)"}}>🌍</div>
                  <div style={{display: "flex", flexDirection: "column"}}>
                     <span style={{fontWeight: "bold", fontSize: "0.95rem", color: "white"}}>Global Lounge</span>
                     <span style={{fontSize: "0.7rem", color: "var(--accent-success)", fontWeight: "600"}}>Public Chat</span>
                  </div>
                </div>

                <h3 style={{fontSize: "0.75rem", color: "var(--text-muted)", margin: "1rem 0 0.75rem 0", paddingLeft: "4px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "bold"}}>Online Peers ({allPeers.filter(p => p.isOnline).length})</h3>
                
                <div style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                  {allPeers.map(peer => (
                    <div key={peer.name} className={`peer-item ${activeChat === \`user:${peer.name}\` ? "active" : ""}`} onClick={() => setActiveChat(\`user:${peer.name}\`)} style={{display: "flex", alignItems: "center", gap: "12px", padding: "10px", borderRadius: "16px", cursor: "pointer", transition: "all 0.2s", background: activeChat === \`user:${peer.name}\` ? "rgba(255,255,255,0.05)" : "transparent"}}>
                      <div style={{position: "relative"}}>
                         <div style={{width: "38px", height: "38px", borderRadius: "12px", background: getAvatarColor(peer.name), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: "bold", flexShrink: 0, border: peer.isOnline ? "2px solid #10b981" : "2px solid rgba(255,255,255,0.1)"}}>{peer.name.charAt(0).toUpperCase()}</div>
                         {peer.isOnline && <div style={{position: "absolute", bottom: "-2px", right: "-2px", width: "12px", height: "12px", borderRadius: "50%", background: "#10b981", border: "2px solid #0f172a"}}></div>}
                      </div>
                      <div style={{display: "flex", flexDirection: "column", flex: 1, minWidth: 0}}>
                         <span style={{overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: peer.isOnline ? "white" : "var(--text-muted)", fontWeight: "600", fontSize: "0.9rem"}}>{peer.name}</span>
                         <span style={{fontSize: "0.65rem", color: "var(--accent-physics)", fontWeight: "bold"}}>Lvl {peer.level}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Area - Ultra Premium */}
            <div className="glass chat-main-area" style={{borderRadius: "24px", display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(15, 23, 42, 0.6)"}}>
              {/* Chat Header */}
              <div style={{padding: "1.25rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", gap: "16px", backdropFilter: "blur(10px)"}}>
                <div style={{width: "48px", height: "48px", borderRadius: "14px", background: activeChat === "global" ? "linear-gradient(135deg, #3b82f6, #8b5cf6)" : getAvatarColor(activeChat.split(":")[1]), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", boxShadow: "0 4px 15px rgba(0,0,0,0.3)"}}>{activeChat === "global" ? "🌍" : activeChat.split(":")[1].charAt(0).toUpperCase()}</div>
                <div>
                  <h2 style={{fontSize: "1.25rem", fontWeight: "800", margin: 0, letterSpacing: "0.5px"}}>{activeChat === "global" ? "Global Lounge" : activeChat.split(":")[1]}</h2>
                  <span style={{fontSize: "0.8rem", color: "#10b981", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px"}}><span style={{display: "inline-block", width: "6px", height: "6px", background: "#10b981", borderRadius: "50%", animation: "pulse 1.5s infinite"}}></span> Active Session</span>
                </div>
              </div>
              
              {/* Chat Messages Body */}
              <div className="custom-scrollbar" style={{flex: 1, overflowY: "auto", padding: "2rem", display: "flex", flexDirection: "column-reverse", gap: "1.25rem"}}>
                {chatMessages.length === 0 ? (
                  <div style={{textAlign: "center", color: "var(--text-muted)", margin: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px"}}>
                    <span style={{fontSize: "3rem"}}>👋</span>
                    <div style={{fontWeight: "bold", fontSize: "1.1rem", color: "white"}}>It\'s quiet here...</div>
                    <div style={{fontSize: "0.9rem"}}>Send a message to break the ice!</div>
                  </div>
                ) : (
                  chatMessages.map(msg => {
                    const isMe = msg.user === sessionUser;
                    const text = activeChat === "global" ? msg.action : msg.action.replace(/^@DM_[^\s]+\s/, "");
                    const { level: mLvl } = getLevelData(msg.xp || 0);
                    return (
                      <div key={msg.id} style={{display: "flex", gap: "16px", alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "85%", animation: "slideUp 0.3s ease-out forwards"}}>
                        {!isMe && (
                          <div style={{width: "40px", height: "40px", borderRadius: "12px", background: getAvatarColor(msg.user), flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", cursor: "pointer", border: "2px solid rgba(255,255,255,0.1)", fontWeight: "bold"}} onClick={() => setViewingProfile(msg.user)}>
                             {msg.user.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div style={{display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start"}}>
                           {!isMe && activeChat === "global" && (
                              <div style={{display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", cursor: "pointer"}} onClick={() => setViewingProfile(msg.user)}>
                                 <span style={{fontSize: "0.85rem", color: "white", fontWeight: "700"}}>{msg.user}</span>
                                 <span style={{fontSize: "0.65rem", background: "rgba(139,92,246,0.2)", color: "var(--accent-physics)", padding: "2px 6px", borderRadius: "6px", fontWeight: "bold"}}>Lvl {mLvl}</span>
                              </div>
                           )}
                           <div style={{background: isMe ? "linear-gradient(135deg, var(--accent-physics), #7c3aed)" : "rgba(255,255,255,0.06)", padding: "14px 18px", borderRadius: isMe ? "20px 20px 4px 20px" : "20px 20px 20px 4px", border: isMe ? "none" : "1px solid rgba(255,255,255,0.1)", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", color: "white"}}>
                             <div style={{fontSize: "0.95rem", lineHeight: 1.5, wordBreak: "break-word"}}>{text}</div>
                           </div>
                           <div style={{fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "6px", fontWeight: "600"}}><TimeAgo date={msg.createdAt} fallback={msg.time}/></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              
              {/* Chat Input */}
              <div style={{padding: "1.25rem 2rem", background: "rgba(0,0,0,0.3)", borderTop: "1px solid rgba(255,255,255,0.05)"}}>
                <form onSubmit={handleSendMessage} style={{display: "flex", gap: "12px"}}>
                  <input type="text" className="input-field" placeholder={`Message ${activeChat === "global" ? "Global Lounge" : activeChat.split(":")[1]}...`} value={chatInput} onChange={e => setChatInput(e.target.value)} style={{flex: 1, padding: "16px 24px", borderRadius: "100px", fontSize: "1rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", transition: "all 0.3s", boxShadow: "inset 0 2px 10px rgba(0,0,0,0.1)", outline: "none"}} onFocus={(e) => e.target.style.boxShadow = "0 0 0 2px var(--accent-physics), inset 0 2px 10px rgba(0,0,0,0.1)"} onBlur={(e) => e.target.style.boxShadow = "inset 0 2px 10px rgba(0,0,0,0.1)"} />
                  <button type="submit" className="btn-primary" style={{borderRadius: "100px", padding: "0 24px", display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold", fontSize: "1rem", boxShadow: "0 4px 15px rgba(139, 92, 246, 0.4)", transition: "all 0.2s"}} disabled={!chatInput.trim()}>Send <Send size={18}/></button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div style={{display: "flex", flexDirection: "column", gap: "1.5rem", overflowY: "auto", paddingBottom: "2rem", flex: 1}}>
             <div className="glass" style={{display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", padding: "2rem", borderRadius: "24px", background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))", border: "1px solid rgba(139,92,246,0.2)"}}>
                <div>
                   <h2 style={{fontSize: "1.8rem", fontWeight: "800", marginBottom: "8px", display: "flex", alignItems: "center", gap: "12px"}}><Target color="var(--accent-math)"/> Collaborative Squad Missions</h2>
                   <p style={{color: "var(--text-muted)", fontSize: "1rem", maxWidth: "600px"}}>Create dedicated study squads. Compete with your peers to finish chapters, solve PYQs, or hit daily targets. Peer pressure turned into a superpower!</p>
                </div>
                <button className="btn-primary" onClick={handleCreateMission} style={{padding: "12px 24px", fontSize: "1rem", borderRadius: "100px", boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)"}}><Plus size={18}/> Create Mission</button>
             </div>
             
             {squadMissions.length === 0 ? (
               <div className="glass" style={{textAlign: "center", padding: "4rem 2rem", color: "var(--text-muted)", borderRadius: "24px"}}>
                  <div style={{fontSize: "3rem", marginBottom: "1rem"}}>🚀</div>
                  <h3 style={{fontSize: "1.25rem", color: "white", marginBottom: "0.5rem"}}>No active missions found.</h3>
                  <p>Be the first to create a squad mission and invite your peers to compete!</p>
               </div>
             ) : (
               <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "1.5rem"}}>
                 {squadMissions.map(mission => {
                    const isMember = mission.members.some(m => m.user === sessionUser);
                    return (
                      <div key={mission.id} className="glass" style={{padding: "1.75rem", borderRadius: "24px", display: "flex", flexDirection: "column", gap: "1.25rem", border: "1px solid rgba(255,255,255,0.08)", transition: "transform 0.2s"}} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                         <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}>
                            <div>
                               <h3 style={{fontSize: "1.2rem", fontWeight: "800", color: "white", marginBottom: "4px"}}>{mission.title}</h3>
                               <span style={{fontSize: "0.75rem", color: "var(--accent-physics)", background: "rgba(139,92,246,0.1)", padding: "2px 8px", borderRadius: "100px", fontWeight: "bold"}}>Admin: {mission.admin}</span>
                            </div>
                            <span style={{background: "rgba(16,185,129,0.15)", color: "var(--accent-success)", padding: "6px 12px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "6px"}}><Users size={14}/> {mission.members.length} Peers</span>
                         </div>
                         <p style={{fontSize: "0.95rem", color: "var(--text-muted)", minHeight: "48px", lineHeight: 1.5}}>{mission.desc}</p>
                         
                         <div style={{background: "rgba(0,0,0,0.25)", padding: "1.25rem", borderRadius: "16px"}}>
                            <h4 style={{fontSize: "0.85rem", color: "white", marginBottom: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px"}}>Squad Progress Tracker</h4>
                            {mission.members.map((member, i) => (
                               <div key={member.user} style={{marginBottom: i === mission.members.length-1 ? 0 : "12px"}}>
                                  <div style={{display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "6px"}}>
                                     <span style={{fontWeight: member.user === sessionUser ? "800" : "600", color: member.user === sessionUser ? "var(--accent-physics)" : "var(--text-muted)"}}>{member.user} {member.progress === 100 && "🏆"}</span>
                                     <span style={{fontWeight: "bold", color: member.progress === 100 ? "var(--accent-success)" : "white"}}>{member.progress}%</span>
                                  </div>
                                  <div style={{width: "100%", height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "100px", overflow: "hidden", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2)"}}>
                                     <div style={{width: `${member.progress}%`, height: "100%", background: member.user === sessionUser ? "linear-gradient(90deg, #8b5cf6, #c026d3)" : "var(--accent-chem)", borderRadius: "100px", transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)"}}></div>
                                  </div>
                               </div>
                            ))}
                         </div>
                         
                         <div style={{marginTop: "auto", paddingTop: "1rem"}}>
                            {!isMember ? (
                               <button className="btn-primary" style={{width: "100%", padding: "14px", background: "rgba(255,255,255,0.05)", color: "white", border: "1px solid rgba(255,255,255,0.1)", fontSize: "1rem", borderRadius: "14px", transition: "all 0.2s"}} onClick={() => handleJoinMission(mission.id)} onMouseEnter={e => {e.target.style.background = "var(--accent-physics)"; e.target.style.border = "none";}} onMouseLeave={e => {e.target.style.background = "rgba(255,255,255,0.05)"; e.target.style.border = "1px solid rgba(255,255,255,0.1)";}}>Join Squad</button>
                            ) : (
                               <button className="btn-primary" style={{width: "100%", padding: "14px", fontSize: "1rem", borderRadius: "14px", boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)"}} onClick={() => handleUpdateMissionProgress(mission.id)}>Log Daily Progress</button>
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
