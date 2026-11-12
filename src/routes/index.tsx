import { useEffect } from "react";
import { ArrowRight, BellRing, Boxes, ShieldCheck, Map as MapIcon, MapPin, PackageCheck, Route as RouteIcon, ScanLine, Warehouse } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
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

function useScrollMotion() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    items.forEach((el) => (reduce ? el.classList.add("is-visible") : io.observe(el)));
    if (reduce) return () => io.disconnect();
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
          const r = el.parentElement!.getBoundingClientRect();
          const speed = Number(el.dataset["parallax"]);
          el.style.transform = `translate3d(0, ${(r.top + r.height / 2 - window.innerHeight / 2) * speed}px, 0) scale(1.12)`;
        });
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { io.disconnect(); window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);
}

function ShelfLifePage() {
  useScrollMotion();
  return (
    <div className="sl-page" id="top">
      <SiteHeader />
      <main>
        <Hero />
        <PlatformSection />
        <JourneySection />
        <BeyondSection />
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
          <a href="#freshness">Freshness</a>
          <a href="#network">Who it connects</a>
        </div>
        <Button asChild className="sl-button sl-header-cta">
          <Link to="/auth">Get started <ArrowRight aria-hidden="true" /></Link>
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
            <Link to="/auth">Book a hauler <ArrowRight aria-hidden="true" /></Link>
          </Button>
          <a className="sl-text-link" href="#how">See how it works</a>
        </div>
      </div>
      <figure className="sl-hero-image-wrap">
        <img
          data-parallax="-0.12"
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
    <div className="sl-section-intro" data-reveal>
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
            <article className="sl-capability" key={title} data-reveal>
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
            <article className="sl-step" key={step.title} data-reveal>
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
            <article className="sl-member" key={member.role} data-reveal>
              <h3>{member.role}</h3>
              <p>{member.detail}</p>
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
      <div className="sl-container sl-closing-inner" data-reveal>
        <p className="sl-section-label">ShelfLife</p>
        <h2 id="closing-title">Request produce.<br /><em>We'll move it.</em></h2>
        <p>Stock, riders, freshness alerts and verified partners in one network.</p>
        <Button asChild className="sl-button sl-button-light">
          <Link to="/auth">Create your account <ArrowRight aria-hidden="true" /></Link>
        </Button>
      </div>
    </section>
  );
}

function BeyondSection() {
  const layers = [
    { icon: BellRing, label: "AI shelf-life alerts", title: "Know what spoils first.", body: "ShelfLife estimates how long each batch will last and warns you early, so it gets sold or moved before it goes bad.", points: ["Shelf-life estimate per batch", "Early warning before spoilage", "Sell or move the oldest stock first"] },
    { icon: MapIcon, label: "Live map", title: "See who has what, near you.", body: "Storage centres, distributors and vendors on one map. Search a crop and see who has it and how much.", points: ["Search by crop or location", "Filter by distance and price", "Businesses choose what they show"] },
    { icon: Boxes, label: "Inventory", title: "Stock that keeps itself current.", body: "Each business gets its own dashboard. Every pickup, drop and sale updates the numbers for everyone involved.", points: ["Batch-by-batch tracking", "Dashboards for each role", "No more counting by phone"] },
    { icon: ShieldCheck, label: "Verified partners", title: "Trade with people you can trust.", body: "Businesses and riders are checked before they join, so every handoff is with a known partner.", points: ["Business verification", "Checked dispatch riders", "Clear record of every handoff"] },
  ];
  return (
    <section className="sl-beyond sl-section" id="freshness" aria-labelledby="beyond-title">
      <div className="sl-container">
        <SectionIntro label="More than delivery" title="Movement is only half of it." body="ShelfLife also tells you what is about to spoil, where stock sits, and who you are dealing with." />
        <div className="sl-stack">
          {layers.map(({ icon: Icon, label, title, body, points }, i) => (
            <article className="sl-stack-card" key={label} style={{ top: `${96 + i * 22}px` }}>
              <div>
                <p className="sl-stack-label"><Icon aria-hidden="true" /> {label}</p>
                <h3>{title}</h3>
                <p className="sl-stack-body">{body}</p>
              </div>
              <ul>{points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="sl-footer">
      <div className="sl-container">
        <div className="sl-footer-top">
          <div className="sl-footer-brand">
            <a className="sl-wordmark" href="#top" aria-label="ShelfLife home"><BrandMark /><span>SHELFLIFE</span></a>
            <p>The network that moves fresh produce and keeps it fresh on the way.</p>
          </div>
          <nav className="sl-footer-col" aria-label="Product">
            <h4>Product</h4>
            <a href="#platform">Why it's different</a>
            <a href="#how">How it works</a>
            <a href="#freshness">Freshness alerts</a>
          </nav>
          <nav className="sl-footer-col" aria-label="Network">
            <h4>Network</h4>
            <a href="#network">Storage centres</a>
            <a href="#network">Distributors</a>
            <a href="#network">Vendors and riders</a>
          </nav>
        </div>
        <div className="sl-footer-bottom">
          <span>© {year} ShelfLife. All rights reserved.</span>
          <span>Built in Lagos, Nigeria</span>
        </div>
      </div>
    </footer>
  );
}
