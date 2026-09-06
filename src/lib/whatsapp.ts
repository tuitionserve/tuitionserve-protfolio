/** Real WhatsApp Business number for Tuition Serve — used for every wa.me deep link across the site. */
export const WHATSAPP_NUMBER = "9779765269150";

/** Builds a wa.me deep link that opens a chat with a pre-filled message — no app-side WhatsApp integration needed. */
export function whatsappHref(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
