import { whatsappHref } from "@/lib/whatsapp";
import { WhatsappIcon } from "./SocialIcons";

/** A prominent, tactile "Chat on WhatsApp" CTA — opens a real chat with a pre-filled message. */
export function WhatsAppButton({ message, className = "" }: { message: string; className?: string }) {
  return (
    <a
      href={whatsappHref(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative inline-flex items-center gap-3 rounded-2xl bg-gradient-to-b from-[#25D366] to-[#128C4A] px-6 py-3.5 font-label-md text-label-md text-white shadow-[0_10px_0_#0d6b39,0_18px_28px_-10px_rgba(13,107,57,0.55)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_12px_0_#0d6b39,0_22px_32px_-10px_rgba(13,107,57,0.6)] active:translate-y-1 active:shadow-[0_4px_0_#0d6b39,0_10px_18px_-8px_rgba(13,107,57,0.5)] ${className}`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
        <WhatsappIcon className="h-5 w-5" />
      </span>
      <span className="flex flex-col items-start leading-tight">
        <span className="text-[0.95rem] font-bold">Chat on WhatsApp</span>
        <span className="text-xs font-normal text-white/85">Usually replies within a few hours</span>
      </span>
    </a>
  );
}
