"use client";

export default function BackgroundGradientAnimation() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Base gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgb(108, 0, 162) 0%, rgb(0, 17, 82) 100%)",
        }}
      />

      {/* SVG blur filter */}
      <svg className="hidden">
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
              "radial-gradient(circle at center, rgba(18, 113, 255, 0.8) 0%, transparent 50%)",
            mixBlendMode: "hard-light",
          }}
        />

        {/* Blob 2 — magenta, circular reverse */}
        <div
          className="absolute w-[80%] h-[80%] top-[calc(50%-40%)] left-[calc(50%-40%)] animate-second opacity-70"
          style={{
            background:
              "radial-gradient(circle at center, rgba(221, 74, 255, 0.8) 0%, transparent 50%)",
            mixBlendMode: "hard-light",
          }}
        />

        {/* Blob 3 — cyan, circular */}
        <div
          className="absolute w-[80%] h-[80%] top-[calc(50%-40%)] left-[calc(50%-40%)] animate-third opacity-35"
          style={{
            background:
              "radial-gradient(circle at center, rgba(100, 220, 255, 0.8) 0%, transparent 50%)",
            mixBlendMode: "hard-light",
          }}
        />

        {/* Blob 4 — red, horizontal */}
        <div
          className="absolute w-[80%] h-[80%] top-[calc(50%-40%)] left-[calc(50%-40%)] animate-fourth opacity-70"
          style={{
            background:
              "radial-gradient(circle at center, rgba(200, 50, 50, 0.8) 0%, transparent 50%)",
            mixBlendMode: "hard-light",
          }}
        />

        {/* Blob 5 — yellow, circular */}
        <div
          className="absolute w-[80%] h-[80%] top-[calc(50%-40%)] left-[calc(50%-40%)] animate-fifth opacity-50"
          style={{
            background:
              "radial-gradient(circle at center, rgba(180, 180, 50, 0.8) 0%, transparent 50%)",
            mixBlendMode: "hard-light",
          }}
        />
      </div>
    </div>
  );
}
