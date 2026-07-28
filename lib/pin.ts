export function setSecurityPin(pin: string): void {
  if (typeof window === 'undefined') return;
  const hashed = btoa(`khataflow_${pin}_salt`);
  localStorage.setItem('khataflow_pin_hash', hashed);
  localStorage.setItem('khataflow_pin_enabled', 'true');
}

export function disableSecurityPin(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('khataflow_pin_hash');
  localStorage.setItem('khataflow_pin_enabled', 'false');
}

export function isPinEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('khataflow_pin_enabled') === 'true';
}

export function verifySecurityPin(pin: string): boolean {
  if (typeof window === 'undefined') return false;
  const storedHash = localStorage.getItem('khataflow_pin_hash');
  const inputHash = btoa(`khataflow_${pin}_salt`);
  return storedHash === inputHash;
}

// Web Crypto API - PIN derived key generation & AES-GCM Encryption / Decryption
async function deriveCryptoKey(pin: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(`khataflow_master_salt_${pin}`),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('khataflow_static_salt_v1'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptText(text: string, pin: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) return text;
  try {
    const key = await deriveCryptoKey(pin);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(text)
    );
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);
    return Array.from(combined).map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    console.warn('Encryption failed, using plain text fallback:', err);
    return text;
  }
}

export async function decryptText(encryptedHex: string, pin: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) return encryptedHex;
  try {
    const combined = new Uint8Array(
      encryptedHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
    );
    if (combined.length < 13) return encryptedHex; // Not encrypted
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    const key = await deriveCryptoKey(pin);
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    return new TextDecoder().decode(decrypted);
  } catch (err) {
    return encryptedHex;
  }
}

