'use client';

import React, { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { startSpeechRecognition, parseVoiceInput, ParsedVoiceEntry } from '@/lib/voice';

interface VoiceInputButtonProps {
  onParsed: (entry: ParsedVoiceEntry) => void;
}

export default function VoiceInputButton({ onParsed }: VoiceInputButtonProps) {
  const [listening, setListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showOfflineInput, setShowOfflineInput] = useState(false);
  const [offlineSentence, setOfflineSentence] = useState('');

  const handleMicClick = () => {
    setErrorMsg('');
    if (listening) {
      setListening(false);
      return;
    }

    setListening(true);
    const rec = startSpeechRecognition(
      (parsed) => {
        setListening(false);
        onParsed(parsed);
      },
      (err) => {
        setListening(false);
        setErrorMsg(err);
        setShowOfflineInput(true); // Automatically show 100% offline voice command box on error
      }
    );

    if (!rec) {
      setListening(false);
      setShowOfflineInput(true);
    }
  };

  const handleParseOfflineSentence = (sentenceToParse?: string) => {
    const text = sentenceToParse || offlineSentence;
    if (!text.trim()) return;
    setErrorMsg('');
    const parsed = parseVoiceInput(text);
    onParsed(parsed);
    setOfflineSentence('');
    setShowOfflineInput(false);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          type="button"
          onClick={handleMicClick}
          title="Online Speech Recognition (Requires Internet)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            background: listening ? 'var(--gradient-coral)' : 'rgba(108, 58, 232, 0.15)',
            color: listening ? '#FFFFFF' : 'var(--accent)',
            border: '1px solid var(--accent)',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            boxShadow: listening ? '0 0 16px rgba(244, 63, 94, 0.6)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          {listening ? (
            <>
              <MicOff size={18} className="animate-pulse" /> Listening...
            </>
          ) : (
            <>
              <Mic size={18} /> Mic Entry 🎙️
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => setShowOfflineInput(!showOfflineInput)}
          className="btn btn-secondary"
          style={{ fontSize: '0.8rem', padding: '10px 12px' }}
        >
          ⚡ Offline Voice Text
        </button>
      </div>

      {/* Offline Voice Text Popover & Error Notice */}
      {(showOfflineInput || errorMsg) && (
        <div
          style={{
            position: 'absolute',
            top: '115%',
            left: 0,
            width: '320px',
            background: 'var(--bg-card)',
            border: '1px solid var(--accent)',
            borderRadius: 'var(--radius-md)',
            padding: '12px',
            fontSize: '0.8rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            zIndex: 100,
            lineHeight: 1.4,
          }}
        >
          {errorMsg && (
            <div style={{ color: 'var(--coral)', marginBottom: '10px', fontSize: '0.78rem' }}>
              <strong>⚠️ Speech API Notice:</strong> {errorMsg}
            </div>
          )}

          <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
            ⚡ 100% Offline Voice Sentence Parser
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Type or dictate any phrase (e.g. <em>"Ramesh ko 500 udhar"</em> or <em>"200 jama"</em>):
          </p>

          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Ramesh 500 udhar"
              style={{ fontSize: '0.82rem', padding: '6px 10px' }}
              value={offlineSentence}
              onChange={(e) => setOfflineSentence(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleParseOfflineSentence();
                }
              }}
            />
            <button
              type="button"
              onClick={() => handleParseOfflineSentence()}
              className="btn btn-accent"
              style={{ fontSize: '0.78rem', padding: '6px 12px', whiteSpace: 'nowrap' }}
            >
              Parse
            </button>
          </div>

          <div style={{ paddingTop: '6px', borderTop: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block', marginBottom: '4px' }}>
              Quick test presets:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              <button
                type="button"
                onClick={() => handleParseOfflineSentence('500 udhar diya')}
                className="btn btn-secondary"
                style={{ fontSize: '0.72rem', padding: '3px 8px' }}
              >
                "500 udhar diya"
              </button>
              <button
                type="button"
                onClick={() => handleParseOfflineSentence('200 jama kiya')}
                className="btn btn-secondary"
                style={{ fontSize: '0.72rem', padding: '3px 8px' }}
              >
                "200 jama kiya"
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
