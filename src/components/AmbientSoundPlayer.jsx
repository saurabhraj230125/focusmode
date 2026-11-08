import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, CloudRain, Waves, Flame, Headphones, Wind, Sparkles } from 'lucide-react';

// Pure Web Audio API procedural sound synthesizer (100% offline, zero network requests)
export const AmbientSoundPlayer = ({ compact = false }) => {
  const [activeSound, setActiveSound] = useState(null); // 'rain' | 'waves' | 'binaural' | 'campfire' | 'brown'
  const [volume, setVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioCtxRef = useRef(null);
  const soundNodesRef = useRef([]);
  const masterGainRef = useRef(null);

  const SOUND_PRESETS = [
    { id: 'rain', label: 'Rainfall', icon: CloudRain, color: '#38bdf8' },
    { id: 'waves', label: 'Ocean Waves', icon: Waves, color: '#06b6d4' },
    { id: 'campfire', label: 'Campfire', icon: Flame, color: '#f97316' },
    { id: 'binaural', label: '40Hz Gamma', icon: Headphones, color: '#a855f7' },
    { id: 'brown', label: 'Deep Noise', icon: Wind, color: '#10b981' }
  ];

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const stopCurrentSound = () => {
    soundNodesRef.current.forEach(node => {
      try {
        if (typeof node.stop === 'function') node.stop();
        if (typeof node.disconnect === 'function') node.disconnect();
      } catch {}
    });
    soundNodesRef.current = [];
    setIsPlaying(false);
  };

  const startSound = (soundId) => {
    stopCurrentSound();
    const ctx = getAudioContext();

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, ctx.currentTime);
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    const createdNodes = [masterGain];

    if (soundId === 'rain') {
      // Pink/White noise with bandpass filtering for gentle rain
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, ctx.currentTime);

      noise.connect(filter);
      filter.connect(masterGain);
      noise.start();
      createdNodes.push(noise, filter);
    } else if (soundId === 'waves') {
      // Brown noise modulated with a slow LFO (ocean surge)
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const waveFilter = ctx.createBiquadFilter();
      waveFilter.type = 'lowpass';
      waveFilter.frequency.setValueAtTime(350, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(250, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(waveFilter.frequency);
      noise.connect(waveFilter);
      waveFilter.connect(masterGain);

      noise.start();
      lfo.start();
      createdNodes.push(noise, waveFilter, lfo, lfoGain);
    } else if (soundId === 'campfire') {
      // Low rumble + crackle pulses
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const r = Math.random();
        data[i] = (r > 0.998 ? (Math.random() * 2 - 1) * 0.9 : (Math.random() * 0.05 - 0.025));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, ctx.currentTime);
      filter.Q.setValueAtTime(3, ctx.currentTime);

      noise.connect(filter);
      filter.connect(masterGain);
      noise.start();
      createdNodes.push(noise, filter);
    } else if (soundId === 'binaural') {
      // 40Hz gamma focus (200Hz + 240Hz sine wave)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(200, ctx.currentTime);
      osc2.frequency.setValueAtTime(240, ctx.currentTime);

      const softGain = ctx.createGain();
      softGain.gain.setValueAtTime(0.2, ctx.currentTime);

      osc1.connect(softGain);
      osc2.connect(softGain);
      softGain.connect(masterGain);

      osc1.start();
      osc2.start();
      createdNodes.push(osc1, osc2, softGain);
    } else if (soundId === 'brown') {
      // Pure deep brown noise for ultimate brain silencing
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 2.5;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      noise.connect(masterGain);
      noise.start();
      createdNodes.push(noise);
    }

    soundNodesRef.current = createdNodes;
    setActiveSound(soundId);
    setIsPlaying(true);
  };

  const toggleSound = (soundId) => {
    if (activeSound === soundId && isPlaying) {
      stopCurrentSound();
      setActiveSound(null);
    } else {
      startSound(soundId);
    }
  };

  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(newVol, audioCtxRef.current.currentTime);
    }
  };

  useEffect(() => {
    return () => {
      stopCurrentSound();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        try { audioCtxRef.current.close(); } catch {}
      }
    };
  }, []);

  if (compact) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Headphones size={14} color={isPlaying ? 'var(--accent-success)' : 'var(--text-muted)'} />
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isPlaying ? '#fff' : 'var(--text-muted)' }}>
          {isPlaying ? SOUND_PRESETS.find(s => s.id === activeSound)?.label : 'Soundscape'}
        </span>
        <div style={{ display: 'flex', gap: '3px' }}>
          {SOUND_PRESETS.slice(0, 3).map(s => {
            const Icon = s.icon;
            const isCur = activeSound === s.id && isPlaying;
            return (
              <button
                key={s.id}
                onClick={() => toggleSound(s.id)}
                title={s.label}
                style={{
                  background: isCur ? s.color : 'transparent',
                  color: isCur ? '#000' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={12} />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="glass" style={{
      padding: '1rem 1.25rem',
      borderRadius: '20px',
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(15, 23, 42, 0.6)',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: isPlaying ? 'linear-gradient(135deg, #10b981, #06b6d4)' : 'rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isPlaying ? '0 0 12px rgba(16,185,129,0.4)' : 'none',
            transition: 'all 0.3s'
          }}>
            <Headphones size={15} color={isPlaying ? '#fff' : 'var(--text-muted)'} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Study Soundscapes</span>
              {isPlaying && (
                <span style={{ fontSize: '0.65rem', background: 'rgba(16,185,129,0.2)', color: '#10b981', padding: '2px 6px', borderRadius: '100px', fontWeight: 800 }}>
                  ACTIVE 🎧
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Procedural audio for deep focus (100% offline)
            </div>
          </div>
        </div>

        {isPlaying && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Volume2 size={14} color="var(--text-muted)" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              style={{ width: '70px', accentColor: '#10b981', cursor: 'pointer' }}
              title={`Volume: ${Math.round(volume * 100)}%`}
            />
            <button
              onClick={stopCurrentSound}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '4px 8px',
                borderRadius: '8px',
                fontSize: '0.7rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Mute
            </button>
          </div>
        )}
      </div>

      {/* Preset Buttons */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {SOUND_PRESETS.map((preset) => {
          const Icon = preset.icon;
          const isSelected = activeSound === preset.id && isPlaying;
          return (
            <button
              key={preset.id}
              onClick={() => toggleSound(preset.id)}
              style={{
                flex: '1 1 calc(20% - 8px)',
                minWidth: '70px',
                padding: '8px 10px',
                borderRadius: '12px',
                border: isSelected ? `1.5px solid ${preset.color}` : '1px solid rgba(255,255,255,0.06)',
                background: isSelected ? `${preset.color}22` : 'rgba(255,255,255,0.02)',
                color: isSelected ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s',
                boxShadow: isSelected ? `0 0 14px ${preset.color}33` : 'none'
              }}
            >
              <Icon size={16} color={isSelected ? preset.color : 'currentColor'} />
              <span style={{ fontSize: '0.72rem', fontWeight: isSelected ? 800 : 600 }}>{preset.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

