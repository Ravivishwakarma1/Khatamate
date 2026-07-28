'use client';

export interface ParsedVoiceEntry {
  rawText: string;
  name?: string;
  amount?: number;
  type?: 'CREDIT' | 'PAYMENT';
}

const HINDI_NUMBER_MAP: { [key: string]: number } = {
  ek: 1,
  do: 2,
  tin: 3,
  teen: 3,
  char: 4,
  paanch: 5,
  panch: 5,
  che: 6,
  saat: 7,
  aath: 8,
  nau: 9,
  das: 10,
  bees: 20,
  pachas: 50,
  sau: 100,
  hazar: 1000,
  karo: 10,
};

export function parseVoiceInput(transcript: string): ParsedVoiceEntry {
  const text = transcript.trim();
  const lower = text.toLowerCase();

  let type: 'CREDIT' | 'PAYMENT' | undefined = undefined;
  if (lower.includes('udhar') || lower.includes('diya') || lower.includes('gave') || lower.includes('given')) {
    type = 'CREDIT';
  } else if (lower.includes('jama') || lower.includes('liya') || lower.includes('received') || lower.includes('got')) {
    type = 'PAYMENT';
  }

  // Extract digits
  let amount: number | undefined = undefined;
  const numMatches = text.match(/\d+/g);
  if (numMatches && numMatches.length > 0) {
    amount = parseInt(numMatches.join(''), 10);
  } else {
    // Attempt basic Hindi text parsing e.g. "do sau"
    if (lower.includes('do sau')) amount = 200;
    else if (lower.includes('ek sau') || lower.includes('sau')) amount = 100;
    else if (lower.includes('paanch sau')) amount = 500;
    else if (lower.includes('hazar')) amount = 1000;
    else if (lower.includes('pachas')) amount = 50;
  }

  // Extract name (word before 'ko' or 'ne' or first word)
  let name: string | undefined = undefined;
  const words = text.split(/\s+/);
  const koIdx = words.findIndex((w) => w.toLowerCase() === 'ko' || w.toLowerCase() === 'ne');
  if (koIdx > 0) {
    name = words.slice(0, koIdx).join(' ');
  } else if (words.length > 0 && !/\d/.test(words[0])) {
    name = words[0];
  }

  return {
    rawText: text,
    name,
    amount,
    type,
  };
}

export function startSpeechRecognition(
  onResult: (parsed: ParsedVoiceEntry) => void,
  onError?: (err: string) => void
) {
  if (typeof window === 'undefined') return;

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    if (onError) onError('Speech recognition is not supported in this browser. Please use text entry.');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'hi-IN'; // Default to Hindi (India) speech recognition
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    const parsed = parseVoiceInput(transcript);
    onResult(parsed);
  };

  recognition.onerror = (event: any) => {
    let friendlyError = event.error || 'Voice input failed';
    if (event.error === 'network') {
      friendlyError = 'Speech service network blocked (Brave/Chrome speech API requires internet & allowed mic permissions). Please use direct text entry or calculator keypad.';
    } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
      friendlyError = 'Microphone permission denied. Please click the mic icon in your browser address bar to allow mic access.';
    } else if (event.error === 'no-speech') {
      friendlyError = 'No speech detected. Please speak clearly into your mic.';
    }
    if (onError) onError(friendlyError);
  };

  recognition.start();
  return recognition;
}
