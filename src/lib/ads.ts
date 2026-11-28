const ADSENSE_CLIENT_REGEX = /^ca-pub-\d{10,20}$/;

/** Returns the validated Google AdSense client ID (`ca-pub-...`) or null if unset/invalid. */
export function getAdSenseClientId(): string | null {
  const raw = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() ?? "";
  return ADSENSE_CLIENT_REGEX.test(raw) ? raw : null;
}

/** Named ad slot env IDs configured by the site owner in AdSense. */
export const AD_SLOTS = {
  vacanciesTop: process.env.NEXT_PUBLIC_ADSENSE_SLOT_VACANCIES_TOP?.trim() || null,
  vacancyDetail: process.env.NEXT_PUBLIC_ADSENSE_SLOT_VACANCY_DETAIL?.trim() || null,
  blogTop: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BLOG_TOP?.trim() || null,
  blogInArticle: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BLOG_IN_ARTICLE?.trim() || null,
} as const;

export function isAdUnitEnabled(slotId: string | null | undefined): boolean {
  return Boolean(getAdSenseClientId() && slotId && /^\d{6,20}$/.test(slotId.trim()));
}

/** Builds the standard IAB `ads.txt` entry required by Google AdSense. */
export function buildAdsTxtContent(clientId = getAdSenseClientId()): string | null {
  if (!clientId) return null;
  const publisherId = clientId.replace(/^ca-/, "");
  return `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`;
}
