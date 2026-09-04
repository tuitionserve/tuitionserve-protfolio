/**
 * PROVISIONAL starter location data — Nepal's 7 provinces and a small set
 * of widely-known major cities, used only to unblock structured location
 * selection during tutor onboarding (M3) before the full location
 * data-engineering milestone (M6) sources, normalizes, and imports the
 * authoritative district/municipality/ward/postal-code dataset. Every name
 * below is common-knowledge Nepal administrative geography — no ward,
 * postal code, or coordinate data is included here because that requires
 * real sourcing (location-data-engineering skill: "do not fabricate
 * locality names, postal codes, ward mappings, coordinates").
 */

export const PROVINCE_SEED = [
  { slug: "koshi", name: "Koshi Province" },
  { slug: "madhesh", name: "Madhesh Province" },
  { slug: "bagmati", name: "Bagmati Province" },
  { slug: "gandaki", name: "Gandaki Province" },
  { slug: "lumbini", name: "Lumbini Province" },
  { slug: "karnali", name: "Karnali Province" },
  { slug: "sudurpashchim", name: "Sudurpashchim Province" },
] as const;

export const CITY_SEED = [
  { slug: "kathmandu", name: "Kathmandu", province: "bagmati" },
  { slug: "lalitpur", name: "Lalitpur", province: "bagmati" },
  { slug: "bhaktapur", name: "Bhaktapur", province: "bagmati" },
  { slug: "hetauda", name: "Hetauda", province: "bagmati" },
  { slug: "bharatpur", name: "Bharatpur", province: "bagmati" },
  { slug: "pokhara", name: "Pokhara", province: "gandaki" },
  { slug: "janakpur", name: "Janakpur", province: "madhesh" },
  { slug: "birgunj", name: "Birgunj", province: "madhesh" },
  { slug: "biratnagar", name: "Biratnagar", province: "koshi" },
  { slug: "dharan", name: "Dharan", province: "koshi" },
  { slug: "itahari", name: "Itahari", province: "koshi" },
  { slug: "damak", name: "Damak", province: "koshi" },
  { slug: "ilam", name: "Ilam", province: "koshi" },
  { slug: "nepalgunj", name: "Nepalgunj", province: "lumbini" },
  { slug: "butwal", name: "Butwal", province: "lumbini" },
  { slug: "siddharthanagar", name: "Siddharthanagar (Bhairahawa)", province: "lumbini" },
  { slug: "ghorahi", name: "Ghorahi", province: "lumbini" },
  { slug: "birendranagar", name: "Birendranagar (Surkhet)", province: "karnali" },
  { slug: "dhangadhi", name: "Dhangadhi", province: "sudurpashchim" },
  { slug: "bhimdatta", name: "Bhimdatta (Mahendranagar)", province: "sudurpashchim" },
] as const;

export function provinceLocationId(slug: string): string {
  return `province-${slug}`;
}

export function cityLocationId(slug: string): string {
  return `city-${slug}`;
}
