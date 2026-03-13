"use client";

import { useEffect, useRef } from "react";

export default function BackgroundGradientAnimation() {
  const interactiveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = interactiveRef.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight / 2;
    let targetX = currentX;
    let targetY = currentY;
    let frame = 0;

    const handleMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const animate = () => {
      currentX += (targetX - currentX) / 12;
      currentY += (targetY - currentY) / 12;

      el.style.transform = `translate(calc(${currentX}px - 50%), calc(${currentY}px - 50%))`;

      frame = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    frame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Base gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgb(108, 0, 162) 0%, rgb(0, 17, 82) 100%)",
          // "linear-gradient(135deg, rgb(78, 31, 153) 0%, rgb(28, 28, 112) 100%)",
          // "linear-gradient(135deg, rgb(112, 5, 165) 0%, rgb(6, 25, 101) 100%)",
        }}
      />

      {/* SVG blur filter */}
      <svg className="hidden" aria-hidden="true">
        <filter id="blurMe">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
            result="goo"
          />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>
      </svg>

      {/* Animated gradient blobs */}
      <div
        className="absolute inset-0"
        style={{ filter: "url(#blurMe) blur(40px)" }}
      >
        {/* Blob 1 — blue, vertical motion */}
        <div
          className="absolute w-[80%] h-[80%] top-[calc(50%-40%)] left-[calc(50%-40%)] animate-first opacity-70"
          style={{
            background:
              // "radial-gradient(circle at center, rgba(18, 113, 255, 0.8) 0%, transparent 50%)",
              "radial-gradient(circle at center, rgb(75, 134, 206) 0%, transparent 50%)",
            mixBlendMode: "hard-light",
          }}
        />

        {/* Blob 2 — magenta, circular reverse */}
        <div
          className="absolute w-[90%] h-[90%] top-[calc(50%-45%)] left-[calc(50%-45%)] opacity-70"
          style={{
            background:
              // "radial-gradient(circle at center, rgba(221, 74, 255, 0.8) 0%, transparent 50%)",
              "radial-gradient(circle at center, rgb(178, 74, 230) 0%, transparent 50%)",
            mixBlendMode: "hard-light",
          }}
        />

        {/* Blob 4 — red, horizontal */}
        <div
          className="absolute w-[80%] h-[80%] top-[calc(50%-40%)] left-[calc(50%-40%)] animate-fourth opacity-70"
          style={{
            background:
              "radial-gradient(circle at center, rgb(155, 48, 128) 0%, transparent 50%)",
            mixBlendMode: "hard-light",
          }}
        />

        {/* Interactive pointer blob */}
        <div
          ref={interactiveRef}
          className="pointer-events-none absolute z-30 w-[100vmin] h-[100vmin] rounded-full opacity-50 blur-[60px]"
          style={{
            left: 0,
            top: 0,
            willChange: "transform",
            background:
              "radial-gradient(circle at center, rgba(40,152,244,0.9) 0%, transparent 75%)",
            mixBlendMode: "hard-light",
          }}
        />
      </div>
    </div>
  );
}
