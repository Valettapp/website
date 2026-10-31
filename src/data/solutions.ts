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
      'Valet management software for Dubai hotels, malls, restaurants and residences. Check-in by photo, a ticket on the guest’s phone, every car on record.',
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
    slug: 'valet-parking-dubai',
    nav: 'Valet parking in Dubai',
    metaTitle: 'Valet Parking in Dubai, Run on One Record | Valett',
    metaDescription:
      'Valet parking for Dubai hotels, restaurants, malls and residences: every car photographed, the ticket on the guest’s phone, keys and bays tracked.',
    eyebrow: 'Valet parking · Dubai',
    h1: 'Valet parking in Dubai, without the wait.',
    lede:
      'Dubai runs on valet. Hotels, restaurants, malls and towers hand over thousands of cars a night, most of them on paper tickets and radio calls. Valett puts the whole valet operation on one record: the car photographed at the door, the ticket on the guest’s phone, the car requested from the table and waiting at the kerb when the guest walks out.',
    points: ['Car valet with a photo of every car', 'Request from the table, a text when it is outside', 'For in-house valet teams and valet companies'],
    body: [
      { title: 'For venues', text: 'In-house team or contracted operator, the guest sees the same thing: a ticket on their phone with their car’s photo, a button to request it, and a text when it is at the door. The venue sees every car, every request and every promised time, under its own brand.' },
      { title: 'For valet companies', text: 'Valet companies running several doors across Dubai run them from one board: drivers and shifts, keys and bays, tips and cash variances, incidents with time-stamped photos. Every venue gets its own white-label guest page; the operator sees them all on one map.' },
      { title: 'Built for the Dubai summer', text: 'Nobody should wait in 40-degree heat wondering if anyone wrote down their plate. The guest requests the car from inside, sees the driver bringing it, and walks out when the text arrives. The wait becomes the shortest part of the evening.' },
    ],
    faqs: [
      { q: 'How does valet parking work with Valett?', a: 'The valet photographs the car at the door. One photo reads the plate, make, model and colour, and the ticket appears with a QR code. The guest scans it and gets a page on their phone. When they are ready, they request the car with one tap and get a text when it is outside.' },
      { q: 'Do you work with existing valet companies?', a: 'Yes. Valett is the system a valet operation runs on. Venues with their own team and valet companies running several venues use the same staff app, key board and back office.' },
      { q: 'Where in Dubai is Valett available?', a: 'Valett launches in Dubai with luxury hospitality brands first. It works at any door: hotels, restaurants and beach clubs, malls and residential towers, in English and Arabic.' },
      { q: 'Can guests pay and tip the valet digitally?', a: 'Yes. Online card payments, Apple Pay and digital tipping are live. The receipt goes to the guest by text, and the operation sees tips per driver and per shift.' },
    ],
    sections: ['guest', 'staff', 'money'],
  },
  {
    slug: 'digital-valet-software',
    nav: 'Digital valet',
    metaTitle: 'Digital Valet Software: the Ticket on the Guest’s Phone | Valett',
    metaDescription:
      'Digital valet software from Dubai: the paper ticket replaced by a QR and a page on the guest’s phone, check-in by photo, requests, payments and tips by text.',
    eyebrow: 'Digital valet',
    h1: 'Digital valet: the paper ticket, replaced.',
    lede:
      'A digital valet ticket lives on the guest’s phone, not in their pocket. It cannot be lost, it carries a photo of the car, and it is how the guest asks for the car back. No app to download, no account to create.',
    points: ['No paper ticket to lose', 'Nothing for the guest to download', 'Check-in by photo, plate read automatically'],
    body: [
      { title: 'What digital valet means', text: 'The valet takes one photo. Vehicle recognition reads the plate, make, model and colour. A ticket code and QR appear on the valet’s phone; the guest scans it and the ticket opens on theirs, with the car’s photo, the ticket number and a button to request the car. It can still be sent by SMS or printed.' },
      { title: 'What changes for the team', text: 'No ticket books, no stubs, no radio calls to find a car. The zone and bay are recorded when the car is parked, keys are tracked, and requests arrive on the driver’s phone. The key controller sees every live ticket on one board, sorted by promised time.' },
      { title: 'What changes for the venue', text: 'Every car is on the record before it moves, with time-stamped photos for damage disputes. Validation is a scan, not a stamp. Reports show cars, wait times, revenue and tips per shift, per venue and per driver.' },
    ],
    faqs: [
      { q: 'What is a digital valet ticket?', a: 'A ticket that lives on the guest’s phone instead of on paper. The guest opens it from a QR on the valet’s phone; it shows their car’s photo and lets them request the car, message the shift manager, pay and tip.' },
      { q: 'Is digital valet the same as a valet app?', a: 'For the team, yes: the staff app runs on the drivers’ phones. For the guest, no: there is nothing to install. The ticket is a web page, in English or Arabic.' },
      { q: 'Can we still give guests a printed ticket?', a: 'Yes. The ticket can be shown on screen, sent by SMS or printed, whichever the guest prefers.' },
      { q: 'Does digital valet software need new hardware?', a: 'No. The staff app runs on the drivers’ own phones and the guest uses theirs. The back office runs in a browser.' },
    ],
    sections: ['guest', 'staff', 'integrations'],
  },
  {
    slug: 'hotel-valet-app',
    nav: 'Hotels and resorts',
    metaTitle: 'Hotel Valet and Parking Solutions for Dubai Hotels | Valett',
    metaDescription:
      'A white-label hotel valet app: the guest page carries your hotel’s name, concierge sees every car, and every arrival is photographed. Built in Dubai.',
    eyebrow: 'Hotels and resorts',
    h1: 'The hotel valet app that carries your name, not ours.',
    lede:
      'The last part of a five-star stay is the car. Valett gives the hotel a guest page in its own brand, a concierge view of every car on the property, and a record that settles any question before it becomes a complaint.',
    points: ['White-label guest page in your brand', 'Concierge sees every car and every request', 'Time-stamped photos at check-in and check-out'],
    body: [
      { title: 'The arrival', text: 'The valet photographs the car at the porte-cochère. One photo reads the plate, make, model and colour. The ticket and its QR code appear instantly; the guest scans it and is on their way into the lobby in under a minute, with their car’s photo on their phone.' },
      { title: 'The stay', text: 'Guests request the car from the room, the restaurant or the spa and watch it come. They message the shift manager privately. Concierge sees every car on the property, every request and every promised time. VIP tiers follow the guest from visit to visit.' },
      { title: 'The record', text: 'Damage walkarounds with time-stamped photos, keys tracked, zone and bay recorded, validation stamped digitally by outlets. When a question comes, the answer is already there. Hotel PMS integration is live, so the ticket and the folio meet.' },
    ],
    faqs: [
      { q: 'Can the valet app show our hotel’s brand instead of Valett’s?', a: 'Yes. Every venue runs its own white-label brand on the guest page: your wordmark, your colours, your name on the ticket. Guests see the hotel, not us.' },
      { q: 'How do hotel guests request their car?', a: 'From the page on their phone, with one tap, from wherever they are in the hotel. They see the request received, the driver on the way, and a text when the car is at the door.' },
      { q: 'Does Valett integrate with hotel property management systems?', a: 'Yes. Hotel PMS integration is live: room charge and guest profile. Online card payments, Apple Pay, digital tipping and crypto payments are live too.' },
      { q: 'Does Valett work with Oracle OPERA?', a: 'It is next. Valett is building its connection to Oracle OPERA Cloud: the guest profile on the ticket, valet fees on the room bill, the car queued for the door at check-out, and VIP tiers that follow the guest. Other major hotel systems follow.' },
      { q: 'What hotel parking solutions does Valett cover?', a: 'Valet at the porte-cochère, guest and visitor parking, residents’ permanent plans for branded residences, validation by outlet, and the reporting behind them, on one record per property.' },
      { q: 'What about damage disputes?', a: 'Every car is photographed at check-in and on the walkaround, with timestamps and the driver’s name. Check-out is photographed too. The dispute is settled by the record, not by argument.' },
    ],
    sections: ['guest', 'staff', 'money'],
  },
  {
    slug: 'mall-valet-parking-system',
    nav: 'Malls',
    metaTitle: 'Mall Valet Parking System with Digital Validation | Valett',
    metaDescription:
      'Valet parking for malls: thousands of tickets a day, digital validation by store, keys and bays tracked, nothing to reconcile on paper. Built in Dubai.',
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
      'Restaurant valet software: guests request the car from the table, pay and tip on their phone, and walk out to a car at the kerb. Built in Dubai.',
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
      'Valet and visitor parking for residential buildings in Dubai: residents’ plans, visitor tickets on the phone, keys tracked, one record per building.',
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
  { q: 'What is digital valet?', a: 'Valet without the paper ticket. The valet photographs the car, the guest scans a QR and the ticket opens on their phone with a photo of their car. They request the car, pay and tip from there. Valett is digital valet software built in Dubai.' },
  { q: 'Which venues is Valett for?', a: 'Hotels and resorts, malls, restaurants and beach clubs, and residential buildings. Each gets its own white-label brand on the guest page and its own rules for validation, tiers and plans.' },
  { q: 'What does Valett integrate with?', a: 'Live today: online card payments, Apple Pay and digital tipping, hotel PMS, crypto payments and car care while parked (cleaning, fuel), all on a fully digital system with AI scanning at the door. Parking and barrier systems are in development. Salik and Dubai payments are being explored.' },
  { q: 'How do I see it?', a: 'Book a demo. Thirty minutes, on a call or at your venue, with the real app in your hands.' },
];
