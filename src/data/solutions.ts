/**
 * Keyword landing pages ("solutions"). One static page per entry at /<slug>, each with its own title,
 * description, H1, copy and FAQ, plus the shared product sections. Google ranks pages, not sites:
 * these are the pages that answer the searches venues actually type.
 */
export interface Faq { q: string; a: string }
export interface Solution {
  slug: string;
  nav: string; // short label for footer / cross-links
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  h1: string;
  lede: string;
  points: string[];
  body: { title: string; text: string }[];
  faqs: Faq[];
  sections: ('guest' | 'staff' | 'backoffice' | 'money' | 'integrations')[];
}

export const solutions: Solution[] = [
  {
    slug: 'valet-management-software-dubai',
    nav: 'Valet management software',
    metaTitle: 'Valet Management Software in Dubai | Valett',
    metaDescription:
      'Valett is valet management software built in Dubai for hotels, malls, restaurants and residences. One photo checks the car in, the ticket lives on the guest’s phone, and every car, key and minute is on the record.',
    eyebrow: 'Valet management software · Dubai',
    h1: 'Valet management software for Dubai’s venues.',
    lede:
      'A camera at the door, a page on the guest’s phone and a board the whole operation runs on. Valett replaces the paper ticket with one record of every car, from the first photo to the last text.',
    points: ['Every car photographed before it moves', 'Every guest reachable without an app', 'Every incident traceable'],
    body: [
      { title: 'Why valet in Dubai still runs on paper', text: 'Most valet operations in the UAE still start with a card torn in half and a radio call. The ticket gets lost, the bay gets forgotten, and when a car comes back with a scratch nobody can prove when it happened. In 40-degree heat the guest waits, and the venue pays for it in reputation and compensation.' },
      { title: 'What the software does', text: 'The valet photographs the car. Vehicle recognition reads the plate, make, model and colour, and a ticket with a QR code appears on the valet’s phone. The guest scans it and gets a page with their car’s photo on it. From then on they can see where the car is, request it from the table, message the shift manager and tip the driver, in English or Arabic, with nothing to download. The key controller sees every ticket on one board, sorted by promised time, and is pinged when a request runs late.' },
      { title: 'Built for operators, not just venues', text: 'Run one door or forty from the same back office. Reports per shift, per venue and per driver. Digital validation that ends leakage. Residents’ plans, VIP tiers and incident records with time-stamped photos. Every rule is configurable without a developer, and every venue runs its own white-label brand on the guest page.' },
    ],
    faqs: [
      { q: 'What is valet management software?', a: 'Software that runs a valet operation end to end: check-in by photo, a digital ticket for the guest, key and bay tracking, requests, payments and tips, and reporting for the operator. Valett does all of this from the valet’s phone, the guest’s phone and one board for the shift manager.' },
      { q: 'Does Valett work in Dubai and the rest of the UAE?', a: 'Valett is built in Dubai and launches with luxury hospitality brands here first. The guest page is in English and Arabic, plates from every emirate are recognised, and the system is designed for the volumes and the heat of the Gulf.' },
      { q: 'Do guests need to download an app?', a: 'No. The guest scans the QR on the valet’s phone and gets a web page. No download, no account, no spam. Everything, from requesting the car to paying and tipping, happens on that page or by text.' },
      { q: 'How quickly can a venue go live?', a: 'A door can be live in days. The staff app runs on the drivers’ own phones, the guest page needs no installation, and the venue’s branding, tiers and validation rules are configured without a developer. Book a demo and we will walk through your door with the real app.' },
    ],
    sections: ['guest', 'staff', 'money', 'integrations'],
  },
  {
    slug: 'hotel-valet-app',
    nav: 'Hotels and resorts',
    metaTitle: 'Hotel Valet App for Dubai Hotels and Resorts | Valett',
    metaDescription:
      'A white-label hotel valet app: the guest page carries the hotel’s name, concierge sees every car, and every arrival is photographed and on the record. Built in Dubai for luxury hotels and resorts.',
    eyebrow: 'Hotels and resorts',
    h1: 'The hotel valet app that carries your name, not ours.',
    lede:
      'The last part of a five-star stay is the car. Valett gives the hotel a guest page in its own brand, a concierge view of every car on the property, and a record that settles any question before it becomes a complaint.',
    points: ['White-label guest page in your brand', 'Concierge sees every car and every request', 'Time-stamped photos at check-in and check-out'],
    body: [
      { title: 'The arrival', text: 'The valet photographs the car at the porte-cochère. One photo reads the plate, make, model and colour. The ticket and its QR code appear instantly; the guest scans it and is on their way into the lobby in under a minute, with their car’s photo on their phone.' },
      { title: 'The stay', text: 'Guests request the car from the room, the restaurant or the spa and watch it come. They message the shift manager privately. Concierge sees every car on the property, every request and every promised time. VIP tiers follow the guest from visit to visit.' },
      { title: 'The record', text: 'Damage walkarounds with time-stamped photos, keys tracked, zone and bay recorded, validation stamped digitally by outlets. When a question comes, the answer is already there. Hotel PMS integration is in development so the ticket and the folio meet.' },
    ],
    faqs: [
      { q: 'Can the valet app show our hotel’s brand instead of Valett’s?', a: 'Yes. Every venue runs its own white-label brand on the guest page: your wordmark, your colours, your name on the ticket. Guests see the hotel, not us.' },
      { q: 'How do hotel guests request their car?', a: 'From the page on their phone, with one tap, from wherever they are in the hotel. They see the request received, the driver on the way, and a text when the car is at the door.' },
      { q: 'Does Valett integrate with hotel property management systems?', a: 'Hotel PMS integration is in development. Online card payments, Apple Pay and digital tipping are live today.' },
      { q: 'What about damage disputes?', a: 'Every car is photographed at check-in and on the walkaround, with timestamps and the driver’s name. Check-out is photographed too. The dispute is settled by the record, not by argument.' },
    ],
    sections: ['guest', 'staff', 'money'],
  },
  {
    slug: 'mall-valet-parking-system',
    nav: 'Malls',
    metaTitle: 'Mall Valet Parking System with Digital Validation | Valett',
    metaDescription:
      'A valet parking system for malls: thousands of tickets a day, validation by store, keys and bays tracked, and no paper to reconcile. Built in Dubai for high-volume retail.',
    eyebrow: 'Malls',
    h1: 'Valet parking for malls, without the paper.',
    lede:
      'Thousands of tickets a day, validation by store and a reconciliation that used to take the whole night. Valett puts every ticket, every validation and every key on one record, and the board tells the driver where the car is.',
    points: ['Validation by store, logged against a ticket', 'Thousands of tickets a day on one board', 'No paper to reconcile at close'],
    body: [
      { title: 'Volume', text: 'At a mall door the queue is the enemy. One photo checks the car in, the ticket is on the shopper’s phone before they reach the entrance, and the key controller sees every live ticket sorted by promised time. When a request runs late the shift manager knows before the shopper does.' },
      { title: 'Validation', text: 'Stores stamp the ticket digitally with a scan. Every validation is logged against a venue and a ticket, so leakage ends and the monthly reconciliation is a report, not a pile of stubs.' },
      { title: 'The network', text: 'Operators see every door on one map: cars, revenue, wait times and tips per shift, per site and per driver. Cash variances show who was on, what came in and what is missing.' },
    ],
    faqs: [
      { q: 'How does digital valet validation work in a mall?', a: 'A store scans the shopper’s ticket, or enters its code, and the validation is recorded against that ticket and that store. The shopper sees it on their phone. The operator sees it in the report. Nothing is written on a stub.' },
      { q: 'Can Valett handle thousands of valet tickets a day?', a: 'Yes. The ticket is a scan, not a form. Check-in takes one photo, and the board scales to as many doors as the mall has.' },
      { q: 'Do shoppers need the app?', a: 'No. The ticket is a web page opened from the QR on the valet’s phone, in English or Arabic. Shoppers request, pay and tip from it without downloading anything.' },
      { q: 'What does the mall operator see?', a: 'Every door on one map, with cars, revenue, wait times, tips and validations per shift and per site, plus incident records with photos and timestamps.' },
    ],
    sections: ['guest', 'backoffice', 'money'],
  },
  {
    slug: 'restaurant-valet-service',
    nav: 'Restaurants',
    metaTitle: 'Restaurant Valet Software: Request the Car from the Table | Valett',
    metaDescription:
      'Valet software for restaurants: guests request the car from the table, pay and tip by text, and walk out to a car at the kerb. Built in Dubai for fine dining and beach clubs.',
    eyebrow: 'Restaurants',
    h1: 'Restaurant valet, requested from the table.',
    lede:
      'The wait for the car is the last thing a guest remembers about dinner. With Valett they request it before the bill arrives, pay and tip on their phone, and walk out to a car at the kerb.',
    points: ['Request from the table, one tap', 'Pay and tip by text, Apple Pay live', 'Private line to the shift manager'],
    body: [
      { title: 'Arrival', text: 'The valet photographs the car, the ticket appears, the guest scans it and is at the host stand before the engine has cooled. The ticket, with the car’s photo on it, lives on the guest’s phone for the evening.' },
      { title: 'Dinner', text: 'One tap from the table and the request is on the board. The guest sees the driver on the way, chooses a tip, pays with Apple Pay or a card, and gets a text when the car is at the door. No queue at the podium, no cash, no card torn in half.' },
      { title: 'The operation', text: 'The key controller runs the evening from one board sorted by promised time. The shift manager is pinged when a request runs late. Every car has a photo at check-in and check-out, and the receipt and rating go to the guest by text.' },
    ],
    faqs: [
      { q: 'Can restaurant guests request their car from the table?', a: 'Yes. The ticket on their phone has one button: Request my car. They see the request received, the driver bringing it and the car outside, without leaving the table.' },
      { q: 'How do guests tip the valet?', a: 'On the receipt, digitally, with Apple Pay or a card. The operation sees who earned what, per driver and per shift.' },
      { q: 'Does it work for beach clubs and event venues?', a: 'Yes. Anywhere with a door and a queue of cars: restaurants, beach clubs, lounges and events, with the venue’s own brand on the guest page.' },
      { q: 'What does the valet need?', a: 'A phone. The staff app runs on the drivers’ own devices; the camera reads the plate, make, model and colour from one photo.' },
    ],
    sections: ['guest', 'staff', 'money'],
  },
  {
    slug: 'residential-valet-parking',
    nav: 'Residences',
    metaTitle: 'Residential Valet and Visitor Parking Management | Valett',
    metaDescription:
      'Valet and visitor parking management for residential buildings in Dubai: residents’ permanent plans, visitor tickets, keys tracked, and one record per building.',
    eyebrow: 'Residences',
    h1: 'Residential valet and visitor parking, one record per building.',
    lede:
      'Residents have permanent plans with their own rules. Visitors get a ticket on their phone. The building gets one record of every car, every key and every minute, for the operator, the developer and the owners’ association.',
    points: ['Residents’ permanent plans with their own rules', 'Visitor tickets, no app to download', 'One record per building, per car, per key'],
    body: [
      { title: 'Residents', text: 'A resident’s car is recognised on arrival. Their plan sets what they are entitled to, their preferences follow them, and their car is where they expect it when they ask for it. No ticket to carry, no card to lose.' },
      { title: 'Visitors', text: 'The valet photographs the visitor’s car, the ticket appears, the visitor scans it and is in the lobby. They request the car by text when they leave, pay if the building charges, and the record of the visit stays with the building.' },
      { title: 'The building', text: 'Keys tracked, bays recorded, time-stamped photos on every walkaround, incidents and compensation on one record. Developers and operators see every building on one map and every shift in one report.' },
    ],
    faqs: [
      { q: 'How are residents’ cars handled differently from visitors’?', a: 'Residents have permanent plans with their own rules: entitlements, preferences and billing set per building. Visitors get a standard ticket on their phone. Both are on the same record for the building.' },
      { q: 'Can a building charge for visitor valet?', a: 'Yes, or not, per building. Payments and tipping are live, with Apple Pay and card, and validation rules are configurable without a developer.' },
      { q: 'Who sees the records?', a: 'The operator runs the shift. The developer or owners’ association sees the building: cars, incidents, wait times, keys and variances, with photos and timestamps.' },
      { q: 'Is Valett available for buildings outside Dubai?', a: 'Valett launches in Dubai first, with residential buildings and developers already signing. Ask us about your building and timeline.' },
    ],
    sections: ['guest', 'backoffice', 'money'],
  },
];

export const faqHome: Faq[] = [
  { q: 'What is Valett?', a: 'Valett is valet management software built in Dubai for hotels, malls, restaurants and residences. A camera at the door checks the car in, the ticket lives on the guest’s phone, and the whole operation runs on one board. Every car is documented before it moves, every guest is a text away, and every minute is on the record.' },
  { q: 'Do guests need to download an app?', a: 'No. The guest scans the QR on the valet’s phone and gets a web page with their car’s photo on it. From there they request the car, message the shift manager, pay and tip, in English or Arabic, with no account and no download.' },
  { q: 'How does check-in work?', a: 'The valet takes one photo. Vehicle recognition reads the plate, make, model and colour. The ticket and QR appear instantly, the zone and bay are recorded when the car is parked, and the damage walkaround is photographed with timestamps.' },
  { q: 'Which venues is Valett for?', a: 'Hotels and resorts, malls, restaurants and beach clubs, and residential buildings. Each gets its own white-label brand on the guest page and its own rules for validation, tiers and plans.' },
  { q: 'What does Valett integrate with?', a: 'Online card payments, Apple Pay and digital tipping are live. Hotel PMS and parking barrier systems are in development. Salik and Dubai payments, crypto payments and car care while parked are being explored.' },
  { q: 'How do I see it?', a: 'Book a demo. Thirty minutes, on a call or at your venue, with the real app in your hands.' },
];
