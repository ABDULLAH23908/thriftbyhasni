import { useRef, useState } from "react";

interface ProductImageZoomProps {
  src: string;
  alt: string;
  zoomFactor?: number; // how much to magnify, e.g. 2.5
  lensSize?: number; // diameter of the circular lens in px
}

export function ProductImageZoom({
  src,
  alt,
  zoomFactor = 2.5,
  lensSize = 160,
}: ProductImageZoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLens, setShowLens] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [bgPos, setBgPos] = useState({ x: 0, y: 0 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Keep the lens fully inside the image bounds
    const clampedX = Math.min(Math.max(x, lensSize / 2), rect.width - lensSize / 2);
    const clampedY = Math.min(Math.max(y, lensSize / 2), rect.height - lensSize / 2);

    setLensPos({ x: clampedX, y: clampedY });

    // Percentage position for background-position of the zoomed image
    const bgX = (x / rect.width) * 100;
    const bgY = (y / rect.height) * 100;
    setBgPos({ x: bgX, y: bgY });
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden cursor-crosshair select-none"
      onMouseEnter={() => setShowLens(true)}
      onMouseLeave={() => setShowLens(false)}
      onMouseMove={handleMouseMove}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain pointer-events-none"
        draggable={false}
      />

      {showLens && (
        <div
          className="pointer-events-none absolute rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.15)]"
          style={{
            width: lensSize,
            height: lensSize,
            left: lensPos.x - lensSize / 2,
            top: lensPos.y - lensSize / 2,
            backgroundImage: `url(${src})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${zoomFactor * 100}%`,
            backgroundPosition: `${bgPos.x}% ${bgPos.y}%`,
          }}
        />
      )}
    </div>
  );
}
