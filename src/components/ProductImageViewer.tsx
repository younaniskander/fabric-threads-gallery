import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const ZOOM = 2.75; // magnification factor (premium ecommerce feel)

const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

interface ProductImageViewerProps {
  images: string[];
  alt: string;
  /** Optional externally controlled active index (e.g. when a color variant changes). */
  index?: number;
  onIndexChange?: (index: number) => void;
  className?: string;
}

/**
 * Premium product image viewer with a hover magnifier lens + live zoom panel
 * on desktop, and pinch / double-tap / swipe gestures on mobile.
 * Fully reusable, accessible and optimized for 60fps (DOM writes are batched
 * with requestAnimationFrame and avoid React re-renders during mouse movement).
 */
const ProductImageViewer = ({
  images,
  alt,
  index,
  onIndexChange,
  className,
}: ProductImageViewerProps) => {
  const isMobile = useIsMobile();
  const gallery = useMemo(
    () => images.filter(Boolean),
    [images],
  );

  const [internalActive, setInternalActive] = useState(0);
  const active = index ?? internalActive;

  const setActive = useCallback(
    (next: number) => {
      const safe = ((next % gallery.length) + gallery.length) % gallery.length;
      if (onIndexChange) onIndexChange(safe);
      if (index === undefined) setInternalActive(safe);
    },
    [gallery.length, index, onIndexChange],
  );

  // Keep internal index in range when the gallery shrinks/grows.
  useEffect(() => {
    if (internalActive > gallery.length - 1) setInternalActive(0);
  }, [gallery.length, internalActive]);

  const currentSrc = gallery[active] ?? gallery[0] ?? "";

  if (!gallery.length) return null;

  return (
    <div
      className={cn("relative", className)}
      role="group"
      aria-roledescription="carousel"
      aria-label="معرض صور المنتج"
    >
      <div className="flex gap-3 flex-col-reverse lg:flex-row">
        {/* Thumbnails */}
        {gallery.length > 1 && (
          <div
            className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0"
            role="tablist"
            aria-label="صور مصغّرة"
          >
            {gallery.map((img, i) => (
              <button
                key={img + i}
                role="tab"
                aria-selected={i === active}
                aria-label={`عرض الصورة ${i + 1} من ${gallery.length}`}
                onClick={() => setActive(i)}
                className={cn(
                  "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  i === active
                    ? "border-primary shadow-fabric"
                    : "border-border opacity-70 hover:opacity-100 hover:border-primary/50",
                )}
              >
                <img
                  src={img}
                  alt={`${alt} - مصغّرة ${i + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main stage */}
        <div className="relative flex-1">
          {isMobile ? (
            <MobileStage
              src={currentSrc}
              alt={alt}
              canNavigate={gallery.length > 1}
              onPrev={() => setActive(active - 1)}
              onNext={() => setActive(active + 1)}
            />
          ) : (
            <DesktopStage src={currentSrc} alt={alt} />
          )}

          {/* Navigation arrows */}
          {gallery.length > 1 && (
            <>
              <NavButton
                side="right"
                label="الصورة السابقة"
                onClick={() => setActive(active - 1)}
              />
              <NavButton
                side="left"
                label="الصورة التالية"
                onClick={() => setActive(active + 1)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Navigation arrow                                                    */
/* ------------------------------------------------------------------ */
const NavButton = ({
  side,
  label,
  onClick,
}: {
  side: "left" | "right";
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className={cn(
      "absolute top-1/2 z-20 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full",
      "bg-background/80 text-foreground shadow-fabric backdrop-blur-sm border border-border",
      "transition-all duration-200 hover:bg-background hover:scale-105",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
      side === "left" ? "left-3" : "right-3",
    )}
  >
    {side === "left" ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
  </button>
);

/* ------------------------------------------------------------------ */
/* Desktop stage — hover magnifier + live zoom panel                   */
/* ------------------------------------------------------------------ */
const DesktopStage = ({ src, alt }: { src: string; alt: string }) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);
  const [zooming, setZooming] = useState(false);

  const apply = useCallback((clientX: number, clientY: number) => {
    const stage = stageRef.current;
    const lens = lensRef.current;
    const panel = panelRef.current;
    if (!stage || !lens || !panel) return;

    const rect = stage.getBoundingClientRect();
    const px = clamp((clientX - rect.left) / rect.width, 0, 1);
    const py = clamp((clientY - rect.top) / rect.height, 0, 1);

    const lensW = rect.width / ZOOM;
    const lensH = rect.height / ZOOM;
    const lx = px * (rect.width - lensW);
    const ly = py * (rect.height - lensH);

    lens.style.width = `${lensW}px`;
    lens.style.height = `${lensH}px`;
    lens.style.transform = `translate3d(${lx}px, ${ly}px, 0)`;
    panel.style.backgroundPosition = `${px * 100}% ${py * 100}%`;
  }, []);

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const { clientX, clientY } = e;
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => apply(clientX, clientY));
    },
    [apply],
  );

  useEffect(
    () => () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    },
    [],
  );

  return (
    <>
      <div
        ref={stageRef}
        className="group relative aspect-square cursor-crosshair overflow-hidden rounded-2xl border border-border shadow-fabric"
        onMouseEnter={() => setZooming(true)}
        onMouseLeave={() => setZooming(false)}
        onMouseMove={handleMove}
        tabIndex={0}
        role="img"
        aria-label={alt}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={src}
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="h-full w-full select-none object-cover"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </AnimatePresence>

        {/* Magnifier lens */}
        <div
          ref={lensRef}
          aria-hidden
          className={cn(
            "pointer-events-none absolute left-0 top-0 rounded-md border border-primary/40 bg-primary/10 backdrop-blur-[1px]",
            "transition-opacity duration-200",
            zooming ? "opacity-100" : "opacity-0",
          )}
          style={{ boxShadow: "0 0 0 9999px hsl(var(--background) / 0.18)" }}
        />

        {/* Hover hint */}
        <div
          className={cn(
            "pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-background/85 px-3 py-1.5 text-xs font-body text-muted-foreground shadow-fabric backdrop-blur-sm transition-opacity duration-200",
            zooming ? "opacity-0" : "opacity-100",
          )}
        >
          <ZoomIn size={14} /> مرّر للتكبير
        </div>
      </div>

      {/* Live zoom panel */}
      <AnimatePresence>
        {zooming && (
          <motion.div
            ref={panelRef}
            key="zoom-panel"
            aria-hidden
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="pointer-events-none absolute left-[calc(100%+1.5rem)] top-0 z-30 hidden aspect-square w-full overflow-hidden rounded-2xl border border-border bg-card shadow-fabric-hover lg:block"
            style={{
              backgroundImage: `url(${src})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: `${ZOOM * 100}% ${ZOOM * 100}%`,
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Mobile stage — pinch / double-tap to zoom + swipe to change image   */
/* ------------------------------------------------------------------ */
const MobileStage = ({
  src,
  alt,
  canNavigate,
  onPrev,
  onNext,
}: {
  src: string;
  alt: string;
  canNavigate: boolean;
  onPrev: () => void;
  onNext: () => void;
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Gesture state held in refs to avoid re-renders.
  const transform = useRef({ scale: 1, x: 0, y: 0 });
  const start = useRef({ x: 0, y: 0, dist: 0, scale: 1 });
  const lastTap = useRef(0);
  const swipeStartX = useRef<number | null>(null);
  const [zoomed, setZoomed] = useState(false);

  const render = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    const { scale, x, y } = transform.current;
    img.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  }, []);

  const reset = useCallback(() => {
    transform.current = { scale: 1, x: 0, y: 0 };
    setZoomed(false);
    render();
  }, [render]);

  useEffect(() => {
    reset();
  }, [src, reset]);

  const distance = (t: TouchList) => {
    const [a, b] = [t[0], t[1]];
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      start.current.dist = distance(e.touches);
      start.current.scale = transform.current.scale;
    } else if (e.touches.length === 1) {
      const t = e.touches[0];
      start.current.x = t.clientX - transform.current.x;
      start.current.y = t.clientY - transform.current.y;
      swipeStartX.current = transform.current.scale === 1 ? t.clientX : null;
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const d = distance(e.touches);
      const next = clamp((d / start.current.dist) * start.current.scale, 1, 4);
      transform.current.scale = next;
      setZoomed(next > 1);
      render();
    } else if (e.touches.length === 1 && transform.current.scale > 1) {
      const t = e.touches[0];
      transform.current.x = t.clientX - start.current.x;
      transform.current.y = t.clientY - start.current.y;
      render();
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    // Double-tap to toggle zoom.
    const now = Date.now();
    if (e.changedTouches.length === 1 && transform.current.scale <= 1) {
      if (now - lastTap.current < 280) {
        transform.current.scale = 2.5;
        setZoomed(true);
        render();
        lastTap.current = 0;
      } else {
        lastTap.current = now;
      }
    }

    // Swipe to change image (only when not zoomed).
    if (
      canNavigate &&
      swipeStartX.current !== null &&
      transform.current.scale === 1 &&
      e.changedTouches.length === 1
    ) {
      const dx = e.changedTouches[0].clientX - swipeStartX.current;
      if (Math.abs(dx) > 50) {
        // RTL-aware: swipe left -> next, swipe right -> prev.
        if (dx < 0) onNext();
        else onPrev();
      }
    }
    swipeStartX.current = null;

    if (transform.current.scale <= 1) reset();
  };

  return (
    <div
      ref={wrapRef}
      className="relative aspect-square touch-none overflow-hidden rounded-2xl border border-border shadow-fabric"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onDoubleClick={() => (zoomed ? reset() : undefined)}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={src}
          ref={imgRef}
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="h-full w-full select-none object-cover will-change-transform"
          style={{ transition: zoomed ? "none" : "transform 0.25s ease-out" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      </AnimatePresence>

      <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-background/85 px-3 py-1.5 text-xs font-body text-muted-foreground shadow-fabric backdrop-blur-sm">
        <ZoomIn size={14} /> اضغط مرتين أو قرّب للتكبير
      </div>
    </div>
  );
};

export default ProductImageViewer;