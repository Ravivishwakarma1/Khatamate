'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Volume2, Play, Pause, CheckCircle } from 'lucide-react';
import styles from '../modals/modal.module.css';

interface VoiceTutorialModalProps {
  onClose: () => void;
}

export default function VoiceTutorialModal({ onClose }: VoiceTutorialModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Check if audio file exists or load fallback
    audioRef.current = new Audio('/audio/tutorial_hi.mp3');
    audioRef.current.onended = () => setIsPlaying(false);
    audioRef.current.onerror = () => {
      console.log('Audio asset /audio/tutorial_hi.mp3 fallback active');
    };

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch((err) => {
        console.warn('Audio play notice:', err);
        setIsPlaying(false);
      });
    }
  };

  const handleFinish = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('khataflow_tutorial_seen', 'true');
    }
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleFinish}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', textAlign: 'center' }}>
        <div className={styles.dragHandle} />

        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#0F0A1E' }}>
          <Volume2 size={32} />
        </div>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
          KhataMate App Kaise Chalaein?
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.5 }}>
          60-second Audio Walkthrough (Hindi) • Seekhein customer add karna aur Udhar/Jama record karna.
        </p>

        {/* Audio Player Box */}
        <div
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>🔊 Voice Guide</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Duration: 60 Seconds</div>
          </div>

          <button
            type="button"
            onClick={togglePlay}
            className="btn btn-accent"
            style={{ borderRadius: '50%', width: 48, height: 48, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {isPlaying ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: 3 }} />}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left', marginBottom: '24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={16} color="var(--emerald)" /> 1. Customer add karein mobile number ke saath
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={16} color="var(--emerald)" /> 2. Rupee symbol = Udhar (Red), Checkmark = Jama (Green)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={16} color="var(--emerald)" /> 3. Mic button daba kar aawaz se entry karein
          </div>
        </div>

        <button type="button" onClick={handleFinish} className="btn btn-primary" style={{ width: '100%' }}>
          Samajh Gaya (Start App)
        </button>
      </div>
    </div>
  );
}
