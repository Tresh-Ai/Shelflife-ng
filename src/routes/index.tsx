import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { matchesMapFilter, type BusinessKind, type MapFilter } from "@/lib/shelf-life-map";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ShelfLife | A connected agricultural supply chain" },
      { name: "description", content: "ShelfLife connects agricultural storage centres, distributors, vendors, dispatch riders and consumers through produce discovery, inventory, freshness and delivery tools." },
      { property: "og:title", content: "ShelfLife | A connected agricultural supply chain" },
      { property: "og:description", content: "Discover produce, manage inventory, monitor freshness and coordinate deliveries across the agricultural supply chain." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShelfLifePage,
});

const mapFilters: MapFilter[] = ["All", "Storage Centres", "Distributors", "Vendors"];
const sampleLocations: { kind: BusinessKind; x: number; y: number; label: string; color: string }[] = [
  { kind: "Storage", x: 176, y: 112, label: "FreshHub Storage", color: "var(--brand)" },
  { kind: "Distributor", x: 304, y: 211, label: "Distributor", color: "var(--accent)" },
  { kind: "Vendor", x: 478, y: 105, label: "Sample Vendor", color: "var(--muted)" },
  { kind: "Vendor", x: 516, y: 270, label: "Vendor", color: "var(--muted)" },
];

function ShelfLifePage() {
  const [mapFilter, setMapFilter] = useState<MapFilter>("All");
  const [heroFilter, setHeroFilter] = useState<"All" | "Storage" | "Vendors">("All");
  const [selectedListing, setSelectedListing] = useState<string | null>(null);

  return (
    <div className="sl-page">
      <Navbar />
      <main>
        <Hero heroFilter={heroFilter} setHeroFilter={setHeroFilter} />
        <ProblemSection />
        <SolutionSection />
        <MapSection filter={mapFilter} setFilter={setMapFilter} selected={selectedListing} setSelected={setSelectedListing} />
        <InventorySection />
        <AIShelfLifeSection />
        <LogisticsSection />
        <VerificationSection />
        <HowItWorksSection />
        <WhoItsForSection />
        <ClosingCTA />
      </main>
      <Footer />
    </div>
  );
}

function LeafMark() {
  return (
    <span className="sl-mark" aria-hidden="true">
      <svg viewBox="0 0 28 28" width="26" height="26" fill="none">
        <path d="M23.4 4.6C13.6 4.5 6.3 7.3 5 14.4c-.8 4.3 2.3 7.4 6.4 6.7 7.2-1.3 10.2-8.2 12-16.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M4.2 23.7c3.3-5.6 7.2-8.9 13.2-12.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function Navbar() {
  return (
    <header className="sl-nav">
      <nav className="sl-container sl-nav-inner" aria-label="Main navigation">
        <a className="sl-wordmark" href="#top" aria-label="ShelfLife home"><LeafMark /><span>SHELFLIFE</span></a>
        <div className="sl-nav-links">
          <a href="#how">How it works</a>
          <a href="#business">For businesses</a>
          <a href="#ai">AI shelf-life</a>
          <a href="#about">About</a>
        </div>
        <div className="sl-nav-cta">
          <Button asChild className="sl-button"><a href="#demo">Explore the platform</a></Button>
        </div>
      </nav>
    </header>
  );
}

function ProductMap({ filter, compact = false }: { filter: MapFilter | "All" | "Storage" | "Vendors"; compact?: boolean }) {
  const activeKind = (kind: BusinessKind) => {
    if (filter === "All") return true;
    if (filter === "Storage") return kind === "Storage";
    if (filter === "Vendors") return kind === "Vendor";
    return matchesMapFilter(kind, filter);
  };

  return (
    <div className={`sl-map${compact ? " sl-map-compact" : ""}`} role="img" aria-label="Illustrative map connecting sample storage, distribution and vendor locations">
      <svg viewBox="0 0 640 340" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g fill="none" stroke="var(--border)" strokeWidth="12" strokeLinecap="round">
          <path d="M-36 72 105 82 215 50 330 70 430 35 690 59" />
          <path d="M-26 177 86 151 175 178 268 151 384 170 484 145 677 171" />
          <path d="M-35 287 70 253 180 280 285 245 389 270 487 238 675 261" />
          <path d="M83-35 100 89 80 161 116 231 92 371" />
          <path d="M241-34 229 65 262 153 238 222 271 368" />
          <path d="M421-38 445 56 414 136 453 210 423 370" />
          <path d="M565-36 546 78 577 158 546 253 571 371" />
        </g>
        <g fill="var(--surface)" stroke="var(--border)" strokeWidth="1">
          <path d="m123 99 47-13 35 18-13 34-52 5-26-20Z" />
          <path d="m297 79 52-6 25 29-12 35-47-2-27-25Z" />
          <path d="m467 75 55 6 20 33-31 26-44-16-14-28Z" />
          <path d="m326 222 55-15 29 31-18 35-47 8-27-27Z" />
        </g>
        <path d="M176 112C220 96 250 156 304 211s113-8 174-106" fill="none" stroke="var(--brand)" strokeWidth="3" strokeDasharray="7 9" strokeLinecap="round" />
        {sampleLocations.map((location) => {
          const isVisible = activeKind(location.kind);
          return (
            <g key={`${location.kind}-${location.x}`} className={`map-marker${isVisible ? " is-active" : " is-muted"}`}>
              <circle cx={location.x} cy={location.y} r="17" fill={location.color} fillOpacity=".14" />
              <circle cx={location.x} cy={location.y} r="8" fill={location.color} stroke="var(--card)" strokeWidth="3" />
              <text x={location.x + 14} y={location.y - 13} fill="var(--text)" fontSize="11" fontFamily="var(--font-sans)" fontWeight="600">{location.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function Hero({ heroFilter, setHeroFilter }: { heroFilter: "All" | "Storage" | "Vendors"; setHeroFilter: (filter: "All" | "Storage" | "Vendors") => void }) {
  return (
    <section className="sl-hero" id="top" aria-labelledby="hero-title">
      <div className="sl-container sl-hero-grid">
        <div className="sl-hero-copy">
          <p className="sl-eyebrow">Nova Challenge #03 · Farm to Future</p>
          <h1 className="sl-title" id="hero-title">A smarter way to move, manage and preserve fresh produce.</h1>
          <p className="sl-lead">ShelfLife connects agricultural storage centres, distributors, vendors and consumers in one platform. Find available produce, manage inventory, coordinate deliveries and monitor freshness from one place.</p>
          <div className="sl-actions">
            <Button asChild className="sl-button"><a href="#demo">Explore ShelfLife</a></Button>
            <Button asChild variant="outline" className="sl-button sl-button-outline"><a href="#how">See how it works</a></Button>
          </div>
          <p className="sl-quiet-line">From storage to distribution to the final customer, one connected supply chain.</p>
        </div>
        <ProductPanel heroFilter={heroFilter} setHeroFilter={setHeroFilter} />
      </div>
    </section>
  );
}

function ProductPanel({ heroFilter, setHeroFilter }: { heroFilter: "All" | "Storage" | "Vendors"; setHeroFilter: (filter: "All" | "Storage" | "Vendors") => void }) {
  return (
    <div className="sl-product-panel" aria-label="ShelfLife product preview">
      <div className="sl-panel-head">
        <h2>Nearby stock</h2>
        <div className="sl-chips" aria-label="Nearby stock filters">
          {(["All", "Storage", "Vendors"] as const).map((filter) => (
            <Button key={filter} variant="outline" className="sl-chip" aria-pressed={heroFilter === filter} onClick={() => setHeroFilter(filter)}>{filter}</Button>
          ))}
        </div>
      </div>
      <ProductMap filter={heroFilter} compact />
      <div className="sl-listing-row">
        <div><strong>FreshHub Storage</strong><p>Ikeja, Lagos · Tomatoes, peppers, onions</p></div>
        <span className="sl-sample-tag">Sample</span>
      </div>
      <div className="sl-alert">
        <div className="sl-alert-top"><span className="sl-alert-title">Tomatoes · Batch TM204</span><span className="sl-status">Attention needed</span></div>
        <div className="sl-metrics">
          <div><span className="sl-metric-label">Quantity</span><span className="sl-metric-value">75 kg</span></div>
          <div><span className="sl-metric-label">Estimated shelf life</span><span className="sl-metric-value">2 days</span></div>
        </div>
        <p className="sl-note">Illustrative estimate. Prioritise this batch and review its storage conditions.</p>
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, intro, id }: { eyebrow: string; title: string; intro?: string; id: string }) {
  return (
    <div className="sl-section-head">
      <p className="sl-eyebrow">{eyebrow}</p>
      <h2 className="sl-title" id={id}>{title}</h2>
      {intro && <p className="sl-lead">{intro}</p>}
    </div>
  );
}

function ProblemSection() {
  const problems = [
    ["Disconnected supply chains", "Businesses struggle to find suppliers, storage facilities and nearby vendors."],
    ["Limited inventory visibility", "It is hard to know what is available, where it is stored and how much remains."],
    ["Poor freshness monitoring", "Businesses may not know which produce needs attention before it spoils."],
    ["Uncoordinated deliveries", "Moving produce between businesses often means chasing arrangements by phone."],
  ];
  return (
    <section className="sl-section sl-section-tint" aria-labelledby="problem-title">
      <div className="sl-container">
        <SectionHeading id="problem-title" eyebrow="The problem" title="Produce moves. Information gets lost." intro="Agricultural produce passes through storage centres, distributors and vendors before it reaches consumers. The information needed to manage that journey is often scattered across calls, messages and guesswork." />
        <div className="sl-problem-grid">{problems.map(([title, text]) => <article className="sl-text-card" key={title}><h3>{title}</h3><p>{text}</p></article>)}</div>
      </div>
    </section>
  );
}

function SolutionSection() {
  const features = [
    "Discover storage centres, distributors and vendors on a map.",
    "View available produce and quantities.",
    "Manage inventory through role-specific dashboards.",
    "Track produce batches as they move between businesses.",
    "Receive AI-assisted shelf-life alerts.",
    "Place orders and coordinate deliveries.",
  ];
  return (
    <section className="sl-section" aria-labelledby="solution-title">
      <div className="sl-container sl-split">
        <div><SectionHeading id="solution-title" eyebrow="The solution" title="One connected platform for the agricultural supply chain." /><p className="sl-copy">ShelfLife brings discovery, inventory, freshness intelligence and logistics together, so produce can be managed from one stage of distribution to the next.</p></div>
        <ul className="sl-list">{features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
      </div>
    </section>
  );
}

function MapSection({ filter, setFilter, selected, setSelected }: { filter: MapFilter; setFilter: (filter: MapFilter) => void; selected: string | null; setSelected: (id: string | null) => void }) {
  return (
    <section className="sl-section sl-section-tint" id="demo" aria-labelledby="map-title">
      <div className="sl-container">
        <SectionHeading id="map-title" eyebrow="Interactive map" title="Find the produce. Find the people. See what's available." intro="Explore nearby storage centres, distributors and vendors on one map. Search for produce, compare availability and discover businesses across the network." />
        <span className="sl-demo-note">Prototype preview. Sample locations and stock, not live businesses.</span>
        <div className="sl-map-layout sl-map-results">
          <div className="sl-map-card">
            <div className="sl-map-toolbar">
              <h3>Map view</h3>
              <div className="sl-chips" aria-label="Map filters">
                {mapFilters.map((option) => <Button key={option} variant="outline" className="sl-chip" aria-pressed={filter === option} onClick={() => setFilter(option)}>{option}</Button>)}
              </div>
            </div>
            <ProductMap filter={filter} />
          </div>
          <div className="sl-map-side">
            <ListingCard id="storage" title="FreshHub Storage" subtitle="Storage centre · Ikeja, Lagos" selected={selected === "storage"} onSelect={() => setSelected(selected === "storage" ? null : "storage")}>Tomatoes, peppers, onions. Stock is shown only when the business has enabled inventory visibility.</ListingCard>
            <ListingCard id="vendor" title="Sample Vendor Shop" subtitle="Vendor · Lagos Island" selected={selected === "vendor"} onSelect={() => setSelected(selected === "vendor" ? null : "vendor")}>Browse produce, compare prices and place an order or request delivery.</ListingCard>
            <div className="sl-filter-card"><h3>Filter what matters</h3><p>Search by produce, business name or location. Filter by distance, price and availability.</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ListingCard({ id, title, subtitle, selected, onSelect, children }: { id: string; title: string; subtitle: string; selected: boolean; onSelect: () => void; children: string }) {
  return (
    <Button id={`listing-${id}`} type="button" variant="outline" className="sl-listing-card" aria-pressed={selected} onClick={onSelect}>
      <span className="sl-listing-card-head"><span><strong>{title}</strong><span className="sl-listing-subtitle">{subtitle}</span></span><span className="sl-sample-tag">Sample</span></span>
      <span className="sl-listing-card-body">{children}</span>
    </Button>
  );
}

function InventorySection() {
  const roles = [
    ["Storage centres", ["Incoming and outgoing stock", "Available and reserved produce", "Batch records", "Storage and freshness alerts"]],
    ["Distributors", ["Purchased and available inventory", "Incoming and outgoing deliveries", "Businesses supplied", "Batch-level freshness alerts"]],
    ["Vendors", ["Stock received and sold", "Remaining quantities", "Low-stock alerts", "Products nearing estimated spoilage"]],
  ];
  const rows = [["Tomatoes", "TM204", "FreshHub Storage", "75 kg", "Attention needed"], ["Peppers", "PP117", "Distributor", "120 kg", "Available"], ["Onions", "ON052", "Sample Vendor Shop", "48 kg", "Available"]];
  return (
    <section className="sl-section" id="business" aria-labelledby="inventory-title">
      <div className="sl-container">
        <SectionHeading id="inventory-title" eyebrow="Inventory management" title="Every business has a clearer view of its stock." intro="Each business gets its own inventory dashboard. When produce moves between businesses, ShelfLife connects the records so stock is never counted twice." />
        <div className="sl-role-grid">{roles.map(([role, bullets]) => <article className="sl-role-card" key={role as string}><h3>{role as string}</h3><ul>{(bullets as string[]).map((bullet) => <li key={bullet}>{bullet}</li>)}</ul></article>)}</div>
        <div className="sl-table-wrap">
          <div className="sl-table-head"><h3>Inventory overview</h3><span className="sl-sample-tag">Sample data</span></div>
          <table className="sl-table"><thead><tr><th>Product</th><th>Batch</th><th>Held by</th><th>Quantity</th><th>Status</th></tr></thead><tbody>{rows.map(([product, batch, owner, quantity, status]) => <tr key={batch}><td>{product}</td><td>{batch}</td><td>{owner}</td><td>{quantity}</td><td>{status === "Attention needed" ? <span className="sl-status">{status}</span> : status}</td></tr>)}</tbody></table>
        </div>
      </div>
    </section>
  );
}

function AIShelfLifeSection() {
  const points = ["Batch-level freshness monitoring", "Estimated remaining shelf life", "Spoilage-risk alerts", "First-expiring, first-out recommendations", "Storage-condition insights where data is available"];
  return (
    <section className="sl-section sl-section-tint" id="ai" aria-labelledby="ai-title">
      <div className="sl-container sl-split sl-ai-layout">
        <div><SectionHeading id="ai-title" eyebrow="AI shelf-life intelligence" title="Know what needs attention before it goes to waste." /><p className="sl-copy">ShelfLife uses available produce, batch and storage information to estimate remaining shelf life, flag batches that need attention and help businesses decide what to sell first.</p><ul className="sl-list sl-feature-list">{points.map((point) => <li key={point}>{point}</li>)}</ul></div>
        <BatchCard />
      </div>
    </section>
  );
}

function BatchCard() {
  return (
    <div className="sl-batch-card">
      <div className="sl-alert-top"><span className="sl-alert-title">Tomatoes · Batch TM204</span><span className="sl-status">Attention needed</span></div>
      <div className="sl-metrics"><div><span className="sl-metric-label">Remaining</span><span className="sl-metric-value">75 kg</span></div><div><span className="sl-metric-label">Estimated shelf life</span><span className="sl-metric-value">2 days</span></div></div>
      <p className="sl-recommendation">Prioritise this batch, review its storage conditions and consider a price adjustment to limit losses.</p>
      <p className="sl-note">Illustrative example. Estimates, not guarantees. Actual freshness depends on variety, harvest time, handling and temperature.</p>
    </div>
  );
}

function LogisticsSection() {
  const features = ["Delivery requests and rider assignment", "Pickup and drop-off details", "Delivery status updates", "Proof of delivery"];
  return (
    <section className="sl-section" aria-labelledby="logistics-title">
      <div className="sl-container sl-split sl-ai-layout">
        <div><SectionHeading id="logistics-title" eyebrow="Logistics and delivery" title="Move produce from one point to the next." intro="From warehouse pickups to wholesale deliveries and customer orders, ShelfLife connects businesses with independent dispatch riders and keeps every step visible." /><ul className="sl-list">{features.map((feature) => <li key={feature}>{feature}</li>)}</ul></div>
        <RouteStatus />
      </div>
    </section>
  );
}

function RouteStatus() {
  const steps = [["Warehouse", "Pickup confirmed", "done"], ["Rider assigned", "Sample delivery", "done"], ["Distributor", "In transit", "current"], ["Vendor", "Proof of delivery pending", "pending"]];
  return (
    <div className="sl-route-card"><h3>Sample delivery</h3>{steps.map(([title, detail, state]) => <div className={`sl-route-step is-${state}`} key={title}><span className="sl-route-dot" aria-hidden="true" /><div><strong>{title}</strong><span>{detail}</span></div></div>)}</div>
  );
}

function VerificationSection() {
  const entries = [
    ["Business verification", "Profiles supported by documented checks."],
    ["Batch identification", "Batch records that stay linked as stock changes hands."],
    ["Supplier records", "A clear history of who supplied what, and when."],
    ["Reporting", "Flag suspicious or inaccurate listings."],
  ];
  return (
    <section className="sl-section sl-section-tint" aria-labelledby="verification-title">
      <div className="sl-container"><SectionHeading id="verification-title" eyebrow="Verification and traceability" title="Keep the journey of every batch connected." intro="With business records, product information and batch history, ShelfLife makes it easier to understand where produce comes from and how it moves through the supply chain." /><div className="sl-verify-grid">{entries.map(([title, text]) => <article className="sl-text-card" key={title}><h3>{title}</h3><p>{text}</p></article>)}</div></div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    ["01", "Discover", "Find nearby storage centres, distributors and vendors on the map."],
    ["02", "Manage", "Record incoming stock, manage inventory and track produce batches."],
    ["03", "Order", "Consumers and businesses select available produce and place orders."],
    ["04", "Deliver", "Riders move produce, and inventory updates once transfers are confirmed."],
  ];
  return (
    <section className="sl-section" id="how" aria-labelledby="how-title">
      <div className="sl-container"><SectionHeading id="how-title" eyebrow="How it works" title="From discovery to delivery." /><div className="sl-steps">{steps.map(([number, title, description]) => <article className="sl-step" key={number}><span className="sl-step-number">{number}</span><h3>{title}</h3><p>{description}</p></article>)}</div></div>
    </section>
  );
}

function WhoItsForSection() {
  const audiences = [
    ["Storage centres", "Manage stored produce, stock movements and freshness."],
    ["Distributors", "Source produce, manage inventory and supply businesses."],
    ["Vendors", "Purchase stock, manage sales and monitor freshness."],
    ["Dispatch riders", "Receive and complete produce delivery requests."],
    ["Consumers", "Discover vendors and order available produce."],
  ];
  return (
    <section className="sl-section sl-section-tint" aria-labelledby="audience-title">
      <div className="sl-container"><SectionHeading id="audience-title" eyebrow="Who it's for" title="Built for every link in the distribution chain." /><div className="sl-audience-grid">{audiences.map(([title, text]) => <article className="sl-text-card" key={title}><h3>{title}</h3><p>{text}</p></article>)}</div></div>
    </section>
  );
}

function ClosingCTA() {
  return (
    <section className="sl-closing" id="about" aria-labelledby="closing-title">
      <div className="sl-container"><h2 className="sl-title" id="closing-title">Better connected. Better managed. Less produce wasted.</h2><p className="sl-lead">ShelfLife brings the agricultural distribution network into one place, helping businesses find produce, manage stock and move it with better visibility.</p><Button asChild className="sl-button"><a href="#demo">Explore the ShelfLife concept</a></Button></div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="sl-footer">
      <div className="sl-container">
        <div className="sl-footer-top"><div><a className="sl-wordmark" href="#top"><LeafMark /><span>SHELFLIFE</span></a><p className="sl-footer-tagline">The operating system for agricultural distribution.</p></div><nav className="sl-footer-links" aria-label="Footer navigation"><a href="#how">How it works</a><a href="#demo">Platform features</a><a href="#business">For businesses</a><a href="#about">About the challenge</a></nav></div>
        <div className="sl-footer-bottom">Built as a solution concept for Nova Challenge #03, Farm to Future (Agriculture).</div>
      </div>
    </footer>
  );
}