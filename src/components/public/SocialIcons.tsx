// Minimal hand-drawn glyphs (not a brand-icon library dependency) for the
// three platforms currently in scope. Hrefs are placeholders ("#") until
// the client provides real profile URLs.
export function FacebookIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V8c0-.9.25-1.5 1.55-1.5H16.7V3.7C16.4 3.66 15.4 3.57 14.24 3.57c-2.4 0-4.04 1.47-4.04 4.16v2.16H7.5v3.1h2.7v8h3.3z" />
    </svg>
  );
}

export function InstagramIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WhatsappIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 3a9 9 0 0 0-7.75 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Zm0 1.8a7.2 7.2 0 1 1-3.86 13.3l-.28-.17-2.73.71.73-2.66-.18-.28A7.2 7.2 0 0 1 12 4.8Zm-3.1 3.6c-.18 0-.47.07-.72.35-.24.27-.94.9-.94 2.2 0 1.3.96 2.55 1.1 2.73.14.18 1.87 2.98 4.6 4.06 2.27.9 2.73.72 3.23.68.5-.05 1.6-.65 1.83-1.28.22-.63.22-1.17.16-1.28-.06-.12-.24-.18-.5-.32-.26-.13-1.6-.79-1.85-.88-.25-.09-.43-.13-.6.14-.18.26-.7.88-.86 1.06-.16.18-.31.2-.58.07-.26-.13-1.1-.4-2.1-1.28-.78-.69-1.3-1.55-1.46-1.81-.15-.26-.02-.4.11-.53.12-.12.26-.31.4-.46.13-.16.17-.27.26-.45.09-.18.04-.34-.02-.47-.07-.13-.6-1.5-.83-2.04-.22-.53-.44-.46-.6-.47Z" />
    </svg>
  );
}
