import { ArrowRight, Boxes, MapPin, PackageCheck, Route as RouteIcon, ScanLine, Warehouse } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import distributionHub from "@/assets/shelflife-distribution-hub.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ShelfLife | Uber for farm produce" },
      { name: "description", content: "ShelfLife connects agricultural storage, distributors, vendors and delivery teams to help businesses discover produce, manage inventory and coordinate each handoff." },
      { property: "og:title", content: "ShelfLife | Uber for farm produce" },
      { property: "og:description", content: "Request produce, get matched to the nearest stock and a rider, and track it live." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShelfLifePage,
});

function BrandMark() {
  return (
    <span className="sl-mark" aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none">
        <path d="M25.6 5.8C14 5.8 7.2 9.1 6.4 17.1c-.4 4.4 2.7 7.1 6.6 6.2C20 21.4 23.3 13.5 25.6 5.8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M5.8 26.1c3.7-5.8 8.3-9.7 15.1-13.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function ShelfLifePage() {
  return (
    <div className="sl-page" id="top">
      <SiteHeader />
      <main>
        <Hero />
        <PlatformSection />
        <JourneySection />
        <NetworkSection />
        <ClosingSection />
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sl-header">
      <nav className="sl-container sl-nav" aria-label="Main navigation">
        <a className="sl-wordmark" href="#top" aria-label="ShelfLife home">
          <BrandMark />
          <span>SHELFLIFE</span>
        </a>
        <div className="sl-nav-links">
          <a href="#platform">Platform</a>
          <a href="#how">How it works</a>
          <a href="#network">Who it connects</a>
        </div>
        <Button asChild className="sl-button sl-header-cta">
          <a href="#how">Explore ShelfLife <ArrowRight aria-hidden="true" /></a>
        </Button>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="sl-hero sl-container" aria-labelledby="hero-title">
      <div className="sl-hero-copy">
        <p className="sl-kicker"><span className="sl-kicker-dot" /> Not a marketplace. A movement network.</p>
        <h1 id="hero-title"><span className="sl-hero-line">Uber for</span><span className="sl-hero-line sl-hero-accent">farm produce.</span></h1>
        <p className="sl-hero-lead">
          Need produce moved? Request it. ShelfLife finds the nearest stock, books a rider and tracks it to your door.
        </p>
        <div className="sl-hero-actions">
          <Button asChild className="sl-button sl-button-primary">
            <a href="#how">See how it works <ArrowRight aria-hidden="true" /></a>
          </Button>
          <a className="sl-text-link" href="#platform">Why it's different</a>
        </div>
      </div>
      <figure className="sl-hero-image-wrap">
        <img
          className="sl-hero-image"
          src={distributionHub}
          alt="Fresh tomatoes, onions and green peppers moving through a produce distribution hub"
          width={1808}
          height={1104}
          fetchPriority="high"
        />
      </figure>
    </section>
  );
}

function SectionIntro({ label, title, body }: { label: string; title: string; body: string }) {
  return (
    <div className="sl-section-intro">
      <p className="sl-section-label">{label}</p>
      <h2>{title}</h2>
      <p className="sl-section-body">{body}</p>
    </div>
  );
}

function PlatformSection() {
  const capabilities = [
    { icon: MapPin, title: "Nearest stock, instantly", body: "See which storage centre near you has the produce right now." },
    { icon: RouteIcon, title: "A rider, on demand", body: "Book pickup in a tap. The closest dispatch rider takes the job." },
    { icon: ScanLine, title: "Live tracking", body: "Watch the delivery move, from the store to your door." },
    { icon: Boxes, title: "Stock that updates itself", body: "Every pickup and drop changes inventory for everyone automatically." },
  ];

  return (
    <section className="sl-platform sl-section" id="platform" aria-labelledby="platform-title">
      <div className="sl-container">
        <SectionIntro
          label="Why it's different"
          title="Farm-to-buyer sites sell food. We move it."
          body="Marketplaces list produce and leave delivery to you. ShelfLife is the network underneath: stores, stock and riders working like one app."
        />
        <div className="sl-capabilities">
          {capabilities.map(({ icon: Icon, title, body }) => (
            <article className="sl-capability" key={title}>
              <div className="sl-capability-top"><Icon aria-hidden="true" /></div>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
        <div className="sl-platform-note">
          <span className="sl-note-mark"><PackageCheck aria-hidden="true" /></span>
          <p><strong>Think ride-hailing, but for crates.</strong> You ask, the network finds stock and a rider, and it shows up.</p>
          <a href="#network" aria-label="See who ShelfLife connects"><ArrowRight aria-hidden="true" /></a>
        </div>
      </div>
    </section>
  );
}

function JourneySection() {
  const steps = [
    { title: "Request", body: "Say what you need and where." },
    { title: "Match", body: "ShelfLife finds the closest stock." },
    { title: "Dispatch", body: "A nearby rider picks it up." },
    { title: "Track", body: "Follow it live until it arrives." },
  ];

  return (
    <section className="sl-journey sl-section" id="how" aria-labelledby="journey-title">
      <div className="sl-container">
        <div className="sl-journey-heading">
          <SectionIntro
            label="How it works"
            title="Four taps. Produce on the move."
            body="The same simple flow you know from ride apps."
          />
          <span className="sl-journey-symbol" aria-hidden="true"><Warehouse /><span>→</span><RouteIcon /><span>→</span><PackageCheck /></span>
        </div>
        <div className="sl-steps">
          {steps.map((step) => (
            <article className="sl-step" key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function NetworkSection() {
  const members = [
    { role: "Storage centres", detail: "Fill empty space and get stock picked up fast." },
    { role: "Distributors", detail: "Move bulk produce without owning a fleet." },
    { role: "Vendors", detail: "Restock on demand instead of waiting days." },
    { role: "Dispatch riders", detail: "Get nearby delivery jobs and earn per trip." },
    { role: "Buyers", detail: "Order produce and see exactly where it is." },
  ];

  return (
    <section className="sl-network sl-section" id="network" aria-labelledby="network-title">
      <div className="sl-container sl-network-layout">
        <div className="sl-network-heading">
          <SectionIntro
            label="Who's on the network"
            title="Everyone who moves food, in one app."
            body="Each side gets something simple out of it."
          />
        </div>
        <div className="sl-member-list">
          {members.map((member) => (
            <article className="sl-member" key={member.role}>
              <h3>{member.role}</h3>
              <p>{member.detail}</p>
              <ArrowRight className="sl-member-arrow" aria-hidden="true" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClosingSection() {
  return (
    <section className="sl-closing" aria-labelledby="closing-title">
      <div className="sl-container sl-closing-inner">
        <p className="sl-section-label">ShelfLife</p>
        <h2 id="closing-title">Request produce.<br /><em>We'll move it.</em></h2>
        <p>Stock, riders and tracking in one network.</p>
        <Button asChild className="sl-button sl-button-light">
          <a href="#top">Back to top <ArrowRight aria-hidden="true" /></a>
        </Button>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="sl-footer">
      <div className="sl-container sl-footer-inner">
        <a className="sl-wordmark" href="#top" aria-label="ShelfLife home"><BrandMark /><span>SHELFLIFE</span></a>
        <p>A clearer supply chain for fresh produce.</p>
        <nav aria-label="Footer navigation"><a href="#platform">Platform</a><a href="#how">How it works</a><a href="#network">Who it connects</a></nav>
        <span className="sl-copyright">© ShelfLife</span>
      </div>
    </footer>
  );
}