export const site = {
  name: 'Valett',
  domain: 'valett.si',
  url: 'https://valett.si',
  title: 'Valett | Digital Valet Parking Software in Dubai',
  description:
    'Valet management software built in Dubai. One photo checks the car in, the ticket lives on the guest’s phone, and every car and key is on the record.',
  tagline: 'A new era for a timeless service.',
  slogan: 'A new era for a timeless service.',
  email: 'info@valett.si',
  linkedin: 'https://www.linkedin.com/company/valett', // pending confirmation
  location: 'Dubai, UAE',
  /** Office address, one line per entry (30 Oct, from Leon). */
  address: ['Q East, by Alphabeta', 'Al Quoz', 'Dubai, UAE'],
  lang: 'en',
  dir: 'ltr',
  /** Film assets. Null until the Higgsfield film exists; the poster placeholder is used meanwhile. */
  film: {
    mp4: '/film/valett-film-16x9.mp4' as string | null, // 16:9 desktop
    mp4Portrait: '/film/valett-film-9x16.mp4' as string | null, // 9:16 mobile
    captions: '/film/valett-film.en.vtt' as string | null, // .vtt
    /** true: the film replaces the scroll story in the hero (the brief's original hero). false: story hero, film in §2 only. */
    inHero: false,
    /** Off 30 Oct: the film stalls at 00:00 on some iPhones. The two loops in How it works carry the story meanwhile. */
    show: false,
  },
  /** Formspree form id (the part after formspree.io/f/). Public by design: it appears in the page. Submissions go to the inbox set on Formspree (info@valett.si). */
  formspreeId: import.meta.env.FORMSPREE_ID || 'mdeedyja', // "Valett demo requests", delivers to info@valett.si (29 Oct)
  turnstileSiteKey: import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ?? '',
  plausibleDomain: 'valett.si',
  /** Search engine ownership checks. Paste the content="…" value from each tool's "HTML tag" method. */
  verification: {
    google: '', // Google Search Console
    bing: '', // Bing Webmaster Tools
  },
  /** IndexNow key (Bing, Yandex, Seznam, Naver): the file public/<key>.txt holds it; the deploy pings after each publish. */
  indexNowKey: 'cd8df2ff6de06232be66e54bac95e726',
};

export type Status = 'live' | 'dev' | 'exploring';

export const statusLabel: Record<Status, string> = {
  live: 'live',
  dev: 'in development',
  exploring: 'exploring',
};

export const nav = [
  { href: '/#guest', label: 'Guest' },
  { href: '/#staff', label: 'Staff' },
  { href: '/#back-office', label: 'Back office' },
  { href: '/#technology', label: 'Technology' },
  { href: '/#company', label: 'Team' },
];
