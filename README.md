# Remix of Shelflife Ng

Build a complete, production-quality, single-page marketing website for **ShelfLife**, a connected agricultural supply-chain, inventory and logistics platform. This is a B2B software product site. It must not look like a farm NGO page, a grocery delivery app, a generic SaaS template, or an AI-generated landing page.

## 1. Purpose and first impression

A visitor should understand within ten seconds that ShelfLife connects agricultural storage centres, distributors, vendors, dispatch riders and consumers through one map-based system, with inventory tracking, batch-level freshness monitoring and delivery coordination. The site should feel calm, credible and serious, like enterprise software built by people who understand agriculture.

The three ideas that must be immediately visible: the map (discovery), the inventory (management), and the AI shelf-life intelligence (waste prevention).

## 2. Visual direction

**Overall feel:** Clean, professional, restrained, confident. Think modern B2B infrastructure software, not a startup landing page. Generous whitespace, strong typographic hierarchy, precise alignment, and very few decorative elements.

**Explicitly avoid:**
- Gradients, glow effects, blurred orbs, noise textures, glassmorphism, neon accents
- Floating abstract shapes, emoji, mascots, 3D blobs, and decorative illustrations
- Stock photography of farms, crops, people shaking hands, or delivery scooters
- Icon grids with random icons above every heading
- Oversized hero text, bouncing elements, typing animations, counters, and scroll-jacking
- Badges like "New", "Beta", "Powered by AI", and "Trusted by" logos
- Filler sections such as testimonials, pricing tiers, FAQs, newsletter signup, or stats bars

**Visuals must be built from real product UI** using HTML and CSS, not images. Build a map panel with markers, an inventory table, a batch alert card, and a route status component. These should look like the actual product: crisp borders, tabular numbers, small type, clear status colours.

## 3. Colour system

Use these exact values as CSS variables.

| Token | Value | Use |
|---|---|---|
| --brand | #14532D | Primary buttons, logo mark, selected states, key brand moments |
| --brand-2 | #166534 | Button hover, secondary emphasis |
| --accent | #65A30D | Small map markers and positive indicators only |
| --surface | #F0FDF4 | Panels and map backgrounds |
| --bg | #FAFCF8 | Page background |
| --card | #FFFFFF | Cards and product panels |
| --text | #17231B | Headings and body text |
| --muted | #647067 | Secondary text, captions |
| --border | #E3EAE3 | All borders and dividers |
| --warn | #D97706 | "Attention needed" status only |
| --crit | #DC2626 | Critical status only, if used |

Rules: most of the page is white or warm off-white. Green appears on the primary button, the logo, the eyebrow labels, and selected filter states. Do not colour whole sections green. Do not use green for body text. Amber and red appear only in inventory and freshness status indicators.

Support dark mode through `prefers-color-scheme`, with a considered dark palette (deep green-black backgrounds, mint text accents). Light mode is the default presentation.

## 4. Typography

- Font: Inter (Google Fonts), with system-ui fallback.
- Hero headline: 52 to 56px on desktop, 36px on mobile, weight 700, line-height 1.1, letter-spacing -0.025em.
- Section headings: 40px desktop, 28px mobile, weight 700, line-height 1.15.
- Card headings: 18px, weight 600.
- Body: 16px, line-height 1.6. Lead paragraphs: 18px, muted colour.
- Eyebrow labels: 12px, uppercase, letter-spacing 0.1em, weight 600, brand colour.
- All quantities, dates, inventory figures and metrics use `font-variant-numeric: tabular-nums`.
- Maximum line length for paragraphs: about 62 characters.

## 5. Layout system

- Container max-width: 1120px, horizontal padding 24px (16px on mobile).
- Section vertical padding: 96px desktop, 64px mobile.
- Grid: 12-column on desktop. Two-column splits use 1fr 1fr or 1.05fr 1fr.
- Cards: 1px border (--border), radius 12px, padding 24px. Shadow only on the hero product panel, very subtle.
- Buttons: height 44px, radius 10px, padding 0 20px, weight 600, 15px text. Primary is filled brand green with white text. Secondary is transparent with a border.
- Consistent spacing scale: 8, 12, 16, 24, 32, 48, 64, 96.
- Breakpoints: 960px (stack two-column sections, two-column card grids) and 720px (single column everywhere, collapsed navigation, full-width buttons).

## 6. Navigation

- Sticky top bar, height 68px, background white at 90% opacity with backdrop blur, bottom border in --border.
- Left: logo. A simple mark (a stylised leaf or a curved shelf line, in brand green, 24px) followed by the wordmark "SHELFLIFE" in 15px, weight 700, letter-spacing 0.06em.
- Centre or right: links "How it works", "For businesses", "AI shelf-life", "About". 14px, muted, darker on hover. Smooth scroll to section anchors with a scroll offset equal to the header height.
- Far right: one primary button "Explore the platform" that scrolls to the interactive map section.
- Below 720px: hide the text links, keep the logo and the button. Do not add a hamburger menu unless the links are needed; if needed, make it a simple full-width dropdown with the same four links.

## 7. Sections, in exact order

### 7.1 Hero

- Eyebrow: "Nova Challenge #03 · Farm to Future"
- Headline: "A smarter way to move, manage and preserve fresh produce."
- Supporting text: "ShelfLife connects agricultural storage centres, distributors, vendors and consumers in one platform. Find available produce, manage inventory, coordinate deliveries and monitor freshness from one place."
- Primary button: "Explore ShelfLife" (scrolls to map section)
- Secondary button: "See how it works" (scrolls to How it works)
- Quiet line below buttons, muted, with a thin top border: "From storage to distribution to the final customer, one connected supply chain."

**Right column: product panel.** A card containing:
- Top bar: title "Nearby stock", and three filter chips (All, Storage, Vendors). The active chip is filled brand green.
- A map area (height about 220px, background --surface) with abstract street lines in --border, a dashed route line in brand green, and three markers: a filled brand-green circle for a storage centre, a leaf-green circle for a distributor, and a grey circle for a vendor. Use inline SVG.
- A listing row: "FreshHub Storage", "Ikeja, Lagos · Tomatoes, peppers, onions", with a small "Sample" tag on the right.
- A freshness alert card inside the panel: "Tomatoes · Batch TM204" as the title, an amber pill "Attention needed", two metrics side by side: "Quantity 75 kg" and "Estimated shelf life 2 days", and one muted caption: "Illustrative estimate. Prioritise this batch and review its storage conditions."

### 7.2 Problem

- Eyebrow: "The problem"
- Heading: "Produce moves. Information gets lost."
- Intro (muted, one paragraph): "Agricultural produce passes through storage centres, distributors and vendors before it reaches consumers. The information needed to manage that journey is often scattered across calls, messages and guesswork."
- Four cards in a row (two per row on tablet, one on mobile). Each card: heading and one sentence only.
  - Disconnected supply chains: "Businesses struggle to find suppliers, storage facilities and nearby vendors."
  - Limited inventory visibility: "It is hard to know what is available, where it is stored and how much remains."
  - Poor freshness monitoring: "Businesses may not know which produce needs attention before it spoils."
  - Uncoordinated deliveries: "Moving produce between businesses often means chasing arrangements by phone."
- Section background: --surface, with top and bottom borders.

### 7.3 Solution

- Eyebrow: "The solution"
- Heading: "One connected platform for the agricultural supply chain."
- Left column: short paragraph: "ShelfLife brings discovery, inventory, freshness intelligence and logistics together, so produce can be managed from one stage of distribution to the next."
- Right column: a plain vertical list of six items, each with a small leaf-green dot marker, no cards:
  - Discover storage centres, distributors and vendors on a map.
  - View available produce and quantities.
  - Manage inventory through role-specific dashboards.
  - Track produce batches as they move between businesses.
  - Receive AI-assisted shelf-life alerts.
  - Place orders and coordinate deliveries.

### 7.4 Interactive map (id="demo")

- Section background: --surface, with top and bottom borders.
- Eyebrow: "Interactive map"
- Heading: "Find the produce. Find the people. See what's available."
- Supporting text: "Explore nearby storage centres, distributors and vendors on one map. Search for produce, compare availability and discover businesses across the network."
- Small label beneath, muted, with a dashed border: "Prototype preview. Sample locations and stock, not live businesses."
- Layout: two columns on desktop.
  - Left: a map card. Header row with the title "Map view" and four filter chips: All, Storage Centres, Distributors, Vendors. Clicking a chip must change its active state (one active at a time) and dim or highlight the matching markers on the map. Map area around 300px tall with the same abstract street styling and three to four markers.
  - Right: two listing cards and one filter card.
    - Listing 1: "FreshHub Storage", "Storage centre · Ikeja, Lagos", "Sample" tag. Body: "Tomatoes, peppers, onions. Stock is shown only when the business has enabled inventory visibility."
    - Listing 2: "Sample Vendor Shop", "Vendor · Lagos Island", "Sample" tag. Body: "Browse produce, compare prices and place an order or request delivery."
    - Filter card: heading "Filter what matters", body "Search by produce, business name or location. Filter by distance, price and availability."
- Clicking a listing card should toggle a selected state (border in brand green). Keep it simple.

### 7.5 Inventory management (id="business")

- Eyebrow: "Inventory management"
- Heading: "Every business has a clearer view of its stock."
- Supporting text: "Each business gets its own inventory dashboard. When produce moves between businesses, ShelfLife connects the records so stock is never counted twice."
- Three columns (stack on mobile). Each card has a heading and four bullet points, with bullets as plain text with thin separators. No icons.
  - Storage centres: Incoming and outgoing stock; Available and reserved produce; Batch records; Storage and freshness alerts.
  - Distributors: Purchased and available inventory; Incoming and outgoing deliveries; Businesses supplied; Batch-level freshness alerts.
  - Vendors: Stock received and sold; Remaining quantities; Low-stock alerts; Products nearing estimated spoilage.
- Optional: below the cards, one small inventory table with columns Product, Batch, Held by, Quantity, Status. Use three sample rows (Tomatoes TM204, Peppers PP117, Onions ON052) labelled "Sample data". Status uses only the amber pill for the tomato row, and plain text for others. Tabular numbers.

### 7.6 AI shelf-life intelligence (id="ai")

- Section background: --surface.
- Eyebrow: "AI shelf-life intelligence"
- Heading: "Know what needs attention before it goes to waste."
- Left column: paragraph: "ShelfLife uses available produce, batch and storage information to estimate remaining shelf life, flag batches that need attention and help businesses decide what to sell first."
- Five feature points as a plain list: Batch-level freshness monitoring; Estimated remaining shelf life; Spoilage-risk alerts; First-expiring, first-out recommendations; Storage-condition insights where data is available.
- Right column: one batch card (white, bordered). Title "Tomatoes · Batch TM204". Amber pill "Attention needed". Metrics: "Remaining 75 kg", "Estimated shelf life 2 days". Recommendation: "Prioritise this batch, review its storage conditions and consider a price adjustment to limit losses." Footer note, small and muted: "Illustrative example. Estimates, not guarantees. Actual freshness depends on variety, harvest time, handling and temperature."

### 7.7 Logistics

- Eyebrow: "Logistics and delivery"
- Heading: "Move produce from one point to the next."
- Supporting text: "From warehouse pickups to wholesale deliveries and customer orders, ShelfLife connects businesses with independent dispatch riders and keeps every step visible."
- Left column: four feature points as a plain list: Delivery requests and rider assignment; Pickup and drop-off details; Delivery status updates; Proof of delivery.
- Right column: a vertical route status component inside a card. Four stops connected by a vertical line:
  - Warehouse, "Pickup confirmed" (completed: filled brand dot)
  - Rider assigned, "Sample delivery" (completed: filled brand dot)
  - Distributor, "In transit" (current: filled dot with a ring)
  - Vendor, "Proof of delivery pending" (pending: hollow dot)
- Label the component "Sample delivery" in the card header.

### 7.8 Verification and traceability

- Section background: --surface.
- Eyebrow: "Verification and traceability"
- Heading: "Keep the journey of every batch connected."
- Supporting text: "With business records, product information and batch history, ShelfLife makes it easier to understand where produce comes from and how it moves through the supply chain."
- Four items in a row, each with a heading and one sentence:
  - Business verification: "Profiles supported by documented checks."
  - Batch identification: "Batch records that stay linked as stock changes hands."
  - Supplier records: "A clear history of who supplied what, and when."
  - Reporting: "Flag suspicious or inaccurate listings."

### 7.9 How it works (id="how")

- Eyebrow: "How it works"
- Heading: "From discovery to delivery."
- Four numbered steps in a row, each with a number (01 to 04) in brand green, a heading, and one sentence:
  - 01 Discover: "Find nearby storage centres, distributors and vendors on the map."
  - 02 Manage: "Record incoming stock, manage inventory and track produce batches."
  - 03 Order: "Consumers and businesses select available produce and place orders."
  - 04 Deliver: "Riders move produce, and inventory updates once transfers are confirmed."
- Connect the steps with a thin horizontal line on desktop.

### 7.10 Who it's for

- Section background: --surface.
- Eyebrow: "Who it's for"
- Heading: "Built for every link in the distribution chain."
- Five cards (three on the first row, two on the second, or a balanced grid):
  - Storage centres: "Manage stored produce, stock movements and freshness."
  - Distributors: "Source produce, manage inventory and supply businesses."
  - Vendors: "Purchase stock, manage sales and monitor freshness."
  - Dispatch riders: "Receive and complete produce delivery requests."
  - Consumers: "Discover vendors and order available produce."

### 7.11 Closing call to action (id="about")

- Centred layout, generous vertical padding (104px).
- Heading: "Better connected. Better managed. Less produce wasted."
- Supporting text: "ShelfLife brings the agricultural distribution network into one place, helping businesses find produce, manage stock and move it with better visibility."
- Button: "Explore the ShelfLife concept" (primary, scrolls to top or map).
- No background imagery.

### 7.12 Footer

- Top row: left side wordmark "SHELFLIFE" with the tagline "The operating system for agricultural distribution." Right side links: How it works, Platform features, For businesses, About the challenge.
- Bottom line, small and muted, with a top border: "Built as a solution concept for Nova Challenge #03, Farm to Future (Agriculture)."

## 8. Copy rules (strict)

- Use the copy exactly as written above. Do not add headings, taglines, testimonials, statistics, customer logos, pricing, or claims that are not in this brief.
- No em dashes or en dashes anywhere on the page. Use commas, full stops, colons or parentheses.
- No exclamation marks.
- Avoid superlatives and buzzwords: "revolutionary", "seamless", "powerful", "game-changing", "cutting-edge", "next-generation", "unlock", "empower", "leverage".
- Do not describe anything as "AI-powered" in a decorative way. The AI feature is described plainly.
- Every sample business, location, quantity, and estimate must carry a visible "Sample" or "Illustrative" label.
- The word "challenge" appears only in the eyebrow label and the footer attribution.

## 9. Interactions and behaviour

- Smooth scroll for in-page anchors, with scroll-padding-top equal to the header height.
- Map filter chips and listing selection must work on click and update visual states.
- Button and link hover: subtle colour change only. Focus states: a visible 2px outline in brand green with 2px offset.
- No entrance animations, no scroll-triggered effects, no parallax, no autoplay, no counters.
- Respect `prefers-reduced-motion`.

## 10. Responsiveness

- Desktop (1024px and up): full two-column layouts as described.
- Tablet (720px to 1023px): two-column sections become single column, card grids become two per row.
- Mobile (below 720px): everything single column, nav links hidden, buttons full width, headings scale down, map panel height reduced to about 200px, route component and batch card remain fully readable without horizontal scrolling.
- Test that no element overflows horizontally at 360px width.

## 11. Accessibility

- Semantic HTML: header, nav, main, section with aria-labelledby, footer.
- Exactly one h1 (the hero headline). Sequential heading levels after that.
- Colour contrast at least WCAG AA for all text, including muted text on the surface colour.
- Every decorative SVG has aria-hidden="true". Meaningful visual panels have role="img" and a descriptive aria-label.
- Filter chips use aria-pressed. Buttons are real button elements, links are real anchors.

## 12. Technical requirements

- Build with React and Tailwind if the platform supports it, otherwise plain HTML, CSS and minimal JavaScript.
- Organise code into clear components: Navbar, Hero, ProductPanel, ProblemSection, SolutionSection, MapSection, InventorySection, AIShelfLifeSection, LogisticsSection, VerificationSection, HowItWorksSection, WhoItsForSection, ClosingCTA, Footer.
- Store colours, spacing and type sizes as design tokens at the top of the stylesheet.
- No external images. Only Google Fonts (Inter) is loaded externally.
- No placeholder lorem ipsum anywhere.
- Clean, commented code. No unused components or dependencies.

## 13. Final quality bar

Before finishing, check each of the following and fix anything that fails:
- Does the page look like B2B software and not a generic template or farm website?
- Are there any gradients, emoji, stock images, or decorative blobs? If yes, remove them.
- Is there any text not in this brief? If yes, remove it.
- Is every sample item labelled "Sample" or "Illustrative"?
- Are there any em dashes or en dashes? If yes, replace them.
- Does the page work at 360px, 768px and 1440px without horizontal scrolling?
- Does the map filter and listing selection respond to clicks?
- Is green used with restraint, with white and off-white dominating?

Deliver the complete working site.

---
Modern design, you can make design choices and scrap this if you have a better design. Liquid glass and all. Modern. No assumtion and so on. Animations, motions, and realistic.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d8b1b194-b4b2-4dcf-8a0a-7c1edda75b4d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
