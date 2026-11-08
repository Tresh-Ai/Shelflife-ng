import { ArrowDown, ArrowRight, Boxes, MapPin, PackageCheck, Route as RouteIcon, ScanLine, Warehouse } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import distributionHub from "@/assets/shelflife-distribution-hub.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ShelfLife | A clearer supply chain for fresh produce" },
      { name: "description", content: "ShelfLife connects agricultural storage, distributors, vendors and delivery teams to help businesses discover produce, manage inventory and coordinate each handoff." },
      { property: "og:title", content: "ShelfLife | A clearer supply chain for fresh produce" },
      { property: "og:description", content: "One connected way to discover produce, manage inventory and coordinate each handoff." },
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
        <p className="sl-kicker"><span className="sl-kicker-dot" /> Agricultural supply, connected</p>
        <h1 id="hero-title">Fresh produce.<br /><span>Clear movement.</span></h1>
        <p className="sl-hero-lead">
          ShelfLife connects the people and places behind fresh produce, from storage and distribution to the last mile.
        </p>
        <div className="sl-hero-actions">
          <Button asChild className="sl-button sl-button-primary">
            <a href="#platform">Meet the platform <ArrowRight aria-hidden="true" /></a>
          </Button>
          <a className="sl-text-link" href="#how">See how it works <ArrowDown aria-hidden="true" /></a>
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
        <figcaption className="sl-image-caption"><span>From source to storefront</span><span>One connected journey</span></figcaption>
      </figure>
      <a className="sl-scroll-cue" href="#platform" aria-label="Scroll to the platform section"><ArrowDown aria-hidden="true" /></a>
    </section>
  );
}

function SectionIntro({ number, label, title, body }: { number: string; label: string; title: string; body: string }) {
  return (
    <div className="sl-section-intro">
      <p className="sl-section-label"><span>{number}</span>{label}</p>
      <h2>{title}</h2>
      <p className="sl-section-body">{body}</p>
    </div>
  );
}

function PlatformSection() {
  const capabilities = [
    {
      icon: MapPin,
      number: "01",
      title: "Find the right source",
      body: "Discover storage centres, distributors and vendors, then see what produce is available across the network.",
    },
    {
      icon: Boxes,
      number: "02",
      title: "Keep stock in view",
      body: "Give each business a clearer picture of its incoming, available and moving inventory, batch by batch.",
    },
    {
      icon: ScanLine,
      number: "03",
      title: "Protect freshness",
      body: "Use produce and storage information to flag batches that may need attention and help teams act sooner.",
    },
    {
      icon: RouteIcon,
      number: "04",
      title: "Coordinate each handoff",
      body: "Bring order details, dispatch and delivery updates into one connected flow from one business to the next.",
    },
  ];

  return (
    <section className="sl-platform sl-section" id="platform" aria-labelledby="platform-title">
      <div className="sl-container">
        <SectionIntro
          number="01"
          label="The platform"
          title="Less guesswork between every handoff."
          body="ShelfLife brings discovery, inventory, freshness and delivery into one shared view, so every part of the produce journey is easier to follow."
        />
        <div className="sl-capabilities">
          {capabilities.map(({ icon: Icon, number, title, body }) => (
            <article className="sl-capability" key={number}>
              <div className="sl-capability-top"><span>{number}</span><Icon aria-hidden="true" /></div>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
        <div className="sl-platform-note">
          <span className="sl-note-mark"><PackageCheck aria-hidden="true" /></span>
          <p><strong>Every business has its own view.</strong> Shared records help stock stay connected as it moves through the supply chain.</p>
          <a href="#network" aria-label="See who ShelfLife connects"><ArrowRight aria-hidden="true" /></a>
        </div>
      </div>
    </section>
  );
}

function JourneySection() {
  const steps = [
    { number: "01", title: "Discover", body: "Find available produce and the businesses behind it." },
    { number: "02", title: "Manage", body: "Keep quantities and batches visible as stock changes hands." },
    { number: "03", title: "Coordinate", body: "Connect orders with pickup and delivery details." },
    { number: "04", title: "Deliver", body: "Track progress through to the final handoff." },
  ];

  return (
    <section className="sl-journey sl-section" id="how" aria-labelledby="journey-title">
      <div className="sl-container">
        <div className="sl-journey-heading">
          <SectionIntro
            number="02"
            label="How it works"
            title="One journey. Every step connected."
            body="From finding the right supplier to confirming a delivery, ShelfLife helps each participant work from a clearer picture."
          />
          <span className="sl-journey-symbol" aria-hidden="true"><Warehouse /><span>→</span><RouteIcon /><span>→</span><PackageCheck /></span>
        </div>
        <div className="sl-steps">
          {steps.map((step) => (
            <article className="sl-step" key={step.number}>
              <span className="sl-step-number">{step.number}</span>
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
    { number: "01", role: "Storage centres", detail: "Track stored produce, stock movement and freshness." },
    { number: "02", role: "Distributors", detail: "Source, manage and supply produce across the network." },
    { number: "03", role: "Vendors", detail: "Manage stock received, sales and products nearing spoilage." },
    { number: "04", role: "Dispatch riders", detail: "Receive delivery requests and share progress along the route." },
    { number: "05", role: "Consumers", detail: "Discover vendors and order available produce." },
  ];

  return (
    <section className="sl-network sl-section" id="network" aria-labelledby="network-title">
      <div className="sl-container sl-network-layout">
        <div className="sl-network-heading">
          <SectionIntro
            number="03"
            label="The network"
            title="Built around the people who move food forward."
            body="A more connected supply chain starts by giving every participant the information they need to do their part."
          />
        </div>
        <div className="sl-member-list">
          {members.map((member) => (
            <article className="sl-member" key={member.number}>
              <span className="sl-member-number">{member.number}</span>
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
        <p className="sl-section-label"><span>04</span> A better-connected supply chain</p>
        <h2 id="closing-title">Keep good produce<br /><em>moving forward.</em></h2>
        <p>Discover produce, manage stock and coordinate deliveries with ShelfLife.</p>
        <Button asChild className="sl-button sl-button-light">
          <a href="#top">Back to the beginning <ArrowRight aria-hidden="true" /></a>
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