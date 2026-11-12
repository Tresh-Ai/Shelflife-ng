import { useRef, useState, type ReactNode } from "react";

/** Bottom sheet you drag up and down; snaps to the nearest stop. Heights are fractions of the screen. */
export function Drawer({ children, snaps = [0.3, 0.58, 0.9], start = 1 }: { children: ReactNode; snaps?: number[]; start?: number }) {
  const [h, setH] = useState(snaps[start] ?? 0.58);
  const [drag, setDrag] = useState(false);
  const d = useRef({ y: 0, h: 0, moved: false });

  function down(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture(e.pointerId);
    d.current = { y: e.clientY, h, moved: false };
    setDrag(true);
  }
  function move(e: React.PointerEvent) {
    if (!drag) return;
    const dy = e.clientY - d.current.y;
    if (Math.abs(dy) > 4) d.current.moved = true;
    setH(Math.min(0.95, Math.max(0.15, d.current.h - dy / window.innerHeight)));
  }
  function up() {
    setDrag(false);
    if (!d.current.moved) { // tap on handle cycles
      const i = snaps.indexOf(h);
      setH(snaps[(i + 1) % snaps.length] ?? snaps[0]!);
      return;
    }
    setH(snaps.reduce((a, b) => (Math.abs(b - h) < Math.abs(a - h) ? b : a)));
  }

  return (
    <section
      className="pb-safe fixed inset-x-0 bottom-16 z-[500] mx-auto flex max-w-lg flex-col rounded-t-3xl bg-card shadow-[var(--shadow-sheet)]"
      style={{ height: `calc(${h * 100}dvh - 4rem)`, transition: drag ? "none" : "height .32s cubic-bezier(.2,.8,.2,1)" }}
    >
      <div
        role="slider" aria-label="Drag to resize panel" aria-valuenow={Math.round(h * 100)} tabIndex={0}
        onKeyDown={(e) => { if (e.key === "ArrowUp") setH(snaps[snaps.length - 1]!); if (e.key === "ArrowDown") setH(snaps[0]!); }}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        className="shrink-0 cursor-grab touch-none py-3 active:cursor-grabbing"
      >
        <div className="mx-auto h-1.5 w-11 rounded-full bg-border" />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6">{children}</div>
    </section>
  );
}
