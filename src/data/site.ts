export const site = {
  name: 'Valett',
  domain: 'valettuae.com',
  url: 'https://valettuae.com',
  title: 'Valett — A new era for a timeless service.',
  description:
    'Valet management for Dubai’s best venues. One record of every car, from the first photo to the last text. Built for the venues guests remember.',
  tagline: 'A new era for a timeless service.',
  slogan: 'A new era for a timeless service.',
  email: 'hello@valettuae.com', // pending confirmation from Leon
  linkedin: 'https://www.linkedin.com/company/valett', // pending confirmation
  location: 'Dubai, UAE',
  lang: 'en',
  dir: 'ltr',
  /** Film assets. Null until the Higgsfield film exists; the poster placeholder is used meanwhile. */
  film: {
    mp4: null as string | null, // 16:9 desktop
    mp4Portrait: null as string | null, // 9:16 mobile
    captions: null as string | null, // .vtt
  },
  formspreeId: import.meta.env.FORMSPREE_ID ?? '',
  turnstileSiteKey: import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ?? '',
  plausibleDomain: 'valettuae.com',
};

export type Status = 'live' | 'dev' | 'exploring';

export const statusLabel: Record<Status, string> = {
  live: 'live',
  dev: 'in development',
  exploring: 'exploring',
};

export const nav = [
  { href: '#guest', label: 'Guest' },
  { href: '#staff', label: 'Staff' },
  { href: '#back-office', label: 'Back office' },
  { href: '#technology', label: 'Technology' },
  { href: '#company', label: 'Company' },
];
