/**
 * Approximate AD -> BS (Bikram Sambat) year conversion. Nepali New Year
 * falls around April 13-14 each AD year; this is precise enough for a
 * coarse "graduation year" field (not a full date), which is how
 * graduation year is conventionally stated in Nepal.
 */
export function getCurrentBsYear(): number {
  const now = new Date();
  const isAfterNepaliNewYear = now.getMonth() > 3 || (now.getMonth() === 3 && now.getDate() >= 14);
  return now.getFullYear() + (isAfterNepaliNewYear ? 57 : 56);
}

export const EARLIEST_BS_GRADUATION_YEAR = 2000;
