import React, { useState } from 'react';
import { ChevronRight, Calendar, User, Clock, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

const BlogPost = () => {
  return (
    <article className="blog-post-content glass" style={{
      padding: 'clamp(1.5rem, 4vw, 3rem)',
      borderRadius: '24px',
      background: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: '#e2e8f0',
      lineHeight: '1.8'
    }}>
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span style={{ background: 'rgba(139,92,246,0.2)', color: '#c4b5fd', padding: '4px 12px', borderRadius: '100px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Tag size={12} /> EdTech
          </span>
          <span style={{ background: 'rgba(59,130,246,0.2)', color: '#93c5fd', padding: '4px 12px', borderRadius: '100px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Tag size={12} /> YouTube
          </span>
          <span style={{ background: 'rgba(236,72,153,0.2)', color: '#f9a8d4', padding: '4px 12px', borderRadius: '100px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Tag size={12} /> 2026 Trends
          </span>
        </div>
        
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, marginBottom: '1rem', background: 'linear-gradient(to right, #fff, #c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2 }}>
          Best Platform to Study on YouTube in 2026: The Ultimate Guide for Students
        </h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', color: '#94a3b8', fontSize: '0.9rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={16} /> By FocusMode Editorial</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> October 10, 2026</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} /> 7 min read</div>
        </div>
      </header>

      <div style={{ fontSize: '1.1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <p>
          As we navigate through <strong>2026</strong>, YouTube has solidified its position not just as an entertainment hub, but as the world's most accessible educational platform. With AI-driven recommendations, interactive video features, and hyper-niche creators, finding the <strong>best platform to study on YouTube</strong> can feel overwhelming.
        </p>

        <p>
          Whether you are preparing for competitive exams like JEE, NEET, SATs, or just upskilling in coding and design, YouTube offers an unprecedented wealth of knowledge. But what makes a study channel or "platform within a platform" truly the best in 2026? Let's dive in.
        </p>

        <h2 style={{ fontSize: '1.8rem', color: '#fff', marginTop: '1rem', borderBottom: '2px solid rgba(139,92,246,0.3)', display: 'inline-block', paddingBottom: '4px' }}>1. The Rise of "Interactive Study Channels"</h2>
        <p>
          The days of passive video consumption are over. The best YouTube study platforms in 2026 utilize live polls, community Q&A, and integrated study notes directly in the video description. Channels that prioritize active recall and spaced repetition in their content delivery are leading the pack.
        </p>

        <h2 style={{ fontSize: '1.8rem', color: '#fff', marginTop: '1rem', borderBottom: '2px solid rgba(139,92,246,0.3)', display: 'inline-block', paddingBottom: '4px' }}>2. AI-Curated Playlists & Deep Work Integration</h2>
        <p>
          Finding the right video is only half the battle. Maintaining focus is the real challenge. The best study setups on YouTube now involve pairing high-quality educational playlists (like MIT OpenCourseWare, freeCodeCamp, or Physics Wallah) with dedicated <strong>Focus Tools</strong>.
        </p>
        <div style={{ background: 'rgba(139,92,246,0.1)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #8b5cf6' }}>
          <strong>Pro Tip:</strong> Use apps like <em>Focus Mode Player</em> (which you are currently on!) to watch YouTube educational content completely ad-free and without the distraction of the recommendation sidebar.
        </div>

        <h2 style={{ fontSize: '1.8rem', color: '#fff', marginTop: '1rem', borderBottom: '2px solid rgba(139,92,246,0.3)', display: 'inline-block', paddingBottom: '4px' }}>3. Top Channels by Category in 2026</h2>
        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <li><strong>Tech & Coding:</strong> <span style={{color: '#a78bfa'}}>freeCodeCamp</span> and <span style={{color: '#a78bfa'}}>Fireship</span> remain undefeated for concise, high-yield programming tutorials.</li>
          <li><strong>Competitive Exams (India):</strong> Channels like <span style={{color: '#a78bfa'}}>Unacademy</span> and <span style={{color: '#a78bfa'}}>Apna College</span> have integrated AI tutors into their community posts, offering a hybrid learning experience.</li>
          <li><strong>Productivity & Study Techniques:</strong> <span style={{color: '#a78bfa'}}>Ali Abdaal</span> and <span style={{color: '#a78bfa'}}>Thomas Frank</span> continue to provide the best meta-learning strategies to optimize your study sessions.</li>
          <li><strong>Sciences:</strong> <span style={{color: '#a78bfa'}}>Kurzgesagt</span> and <span style={{color: '#a78bfa'}}>Veritasium</span> have pushed the boundaries of visual learning with new 3D rendering techniques available on YouTube.</li>
        </ul>

        <h2 style={{ fontSize: '1.8rem', color: '#fff', marginTop: '1rem', borderBottom: '2px solid rgba(139,92,246,0.3)', display: 'inline-block', paddingBottom: '4px' }}>4. How to Optimize Your YouTube Study Sessions</h2>
        <p>
          To make YouTube the absolute best platform for your studies, you must engineer your environment:
        </p>
        <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <li><strong>Create a Separate Study Account:</strong> Do not mix your entertainment feed with your study feed. In 2026, YouTube's algorithm is too powerful; one gaming video can derail a 4-hour study block.</li>
          <li><strong>Use Ad-Blockers or Premium:</strong> Interruptions destroy flow state. If you can't afford Premium, use dedicated ad-free players.</li>
          <li><strong>Engage with the Community:</strong> The comment sections on top educational videos are goldmines of timestamps, corrections, and summarized notes.</li>
        </ol>

        <h2 style={{ fontSize: '1.8rem', color: '#fff', marginTop: '1rem', borderBottom: '2px solid rgba(139,92,246,0.3)', display: 'inline-block', paddingBottom: '4px' }}>Conclusion</h2>
        <p>
          Ultimately, the <strong>best platform to study on YouTube in 2026</strong> isn't just a single channel—it's how you build your personalized curriculum and control your focus. By combining high-yield educational channels with strict anti-distraction tools, YouTube transforms from a time-sink into the most powerful educational engine in human history.
        </p>
      </div>
    </article>
  );
};

export default function Blog() {
  const [activeArticle, setActiveArticle] = useState(1);

  const articles = [
    {
      id: 1,
      title: "Best Platform to Study on YouTube in 2026",
      excerpt: "Discover the top channels, AI tools, and focus strategies to transform YouTube into your ultimate study engine this year.",
      date: "Oct 10, 2026",
      category: "EdTech"
    },
    {
      id: 2,
      title: "How to Build a 30-Day Study Streak",
      excerpt: "The science of habit formation and why consistency beats intensity when preparing for competitive exams.",
      date: "Oct 05, 2026",
      category: "Productivity"
    },
    {
      id: 3,
      title: "The Pomodoro Technique: 2026 Update",
      excerpt: "Why the standard 25-minute timer might be failing you, and how to use flow-state-based timing instead.",
      date: "Sep 28, 2026",
      category: "Focus"
    }
  ];

  return (
    <div style={{ display: 'flex', gap: '2rem', height: '100%', flexDirection: 'column' }}>
      
      {/* Blog Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.15))',
        borderRadius: '24px',
        padding: '2rem',
        border: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ maxWidth: '600px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>Study Insights & Guides</h1>
          <p style={{ color: '#a1a1aa', fontSize: '1.1rem' }}>Expert articles on productivity, focus techniques, and navigating the digital learning landscape.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {articles.map(article => (
          <motion.div 
            key={article.id}
            whileHover={{ y: -5, boxShadow: '0 10px 30px -10px rgba(139,92,246,0.3)' }}
            onClick={() => setActiveArticle(article.id)}
            style={{
              padding: '1.5rem',
              borderRadius: '16px',
              background: activeArticle === article.id ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${activeArticle === article.id ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.05)'}`,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: '0.8rem', color: '#a855f7', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>{article.category}</span>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginTop: '0.5rem', marginBottom: '0.5rem' }}>{article.title}</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '1rem', lineHeight: '1.5' }}>{article.excerpt}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.85rem' }}>
              <span>{article.date}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: activeArticle === article.id ? '#c4b5fd' : '#64748b' }}>
                Read more <ChevronRight size={14} />
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ marginTop: '2rem' }}>
        {activeArticle === 1 && <BlogPost />}
        {activeArticle !== 1 && (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Article coming soon...</h2>
            <p style={{ color: '#94a3b8' }}>Our editorial team is still working on this piece. Check back later!</p>
          </div>
        )}
      </div>
      
    </div>
  );
}
