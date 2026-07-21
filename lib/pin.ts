export function setSecurityPin(pin: string): void {
  if (typeof window === 'undefined') return;
  // Simple hash for local PIN storage
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
