import { Customer } from './db/schema';

export type ReminderTemplateType = 'polite' | 'hindi' | 'urgent';

export interface ReminderTemplate {
  id: ReminderTemplateType;
  label: string;
  getText: (customerName: string, amount: number, shopName: string) => string;
}

export const REMINDER_TEMPLATES: ReminderTemplate[] = [
  {
    id: 'polite',
    label: 'Polite English Reminder',
    getText: (name, amount, shop) =>
      `Dear ${name}, greeting from ${shop}. Your total outstanding balance is ₹${amount.toFixed(
        2
      )}. Please clear your dues at your earliest convenience. Thank you!`,
  },
  {
    id: 'hindi',
    label: 'Friendly Hindi Reminder (हिन्दी)',
    getText: (name, amount, shop) =>
      `नमस्ते ${name}जी, ${shop} से संदेश। आपका ₹${amount.toFixed(
        2
      )} का हिसाब बाकी है। कृपया सुविधानुसार भुगतान करें। धन्यवाद!`,
  },
  {
    id: 'urgent',
    label: 'Urgent Payment Request',
    getText: (name, amount, shop) =>
      `URGENT: Dear ${name}, your credit balance of ₹${amount.toFixed(
        2
      )} with ${shop} is pending. Kindly settle the amount today.`,
  },
];

export function buildWhatsAppUrl(phone: string | undefined, message: string): string {
  if (!phone) return '#';
  // Clean non-digit characters
  let cleanPhone = phone.replace(/\D/g, '');
  // Add country code if not present (defaulting to 91 for India)
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}
