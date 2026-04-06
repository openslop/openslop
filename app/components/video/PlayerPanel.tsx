"use client";

import { useResize } from "./useResize";
import { VideoPanel } from "./VideoPanel";

const TOP_DEFAULT = 300;
const SIDE_DEFAULT = 800;
const HANDLE_PX = 16;

export function TopPlayerPanel() {
  const maxSize =
    typeof window !== "undefined" ? window.innerHeight * 0.6 : 500;

  const { size, handleMouseDown, resizing } = useResize({
    axis: "vertical",
    defaultSize: TOP_DEFAULT,
    minSize: 150,
    maxSize,
  });

  const videoMaxWidth = (size - HANDLE_PX) * (16 / 9);

  return (
    <div className="shrink-0" style={{ height: size }}>
      <div
        className="relative mx-auto h-[calc(100%-0.5rem)] max-w-6xl p-2"
        style={{ maxWidth: videoMaxWidth }}
      >
        <VideoPanel />
      </div>
      <div
        onMouseDown={handleMouseDown}
        className={`relative flex h-2 w-full shrink-0 cursor-row-resize items-end justify-center ${resizing ? "select-none" : ""}`}
      >
        <div
          className={`h-0.5 rounded-full transition-colors ${
            resizing ? "bg-white/40" : "bg-white/10 hover:bg-white/25"
          }`}
          style={{
            width: "100%",
            maskImage:
              "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
          }}
        />
      </div>
    </div>
  );
}

export function SidePlayerPanel() {
  const maxSize = typeof window !== "undefined" ? window.innerWidth * 0.5 : 600;

  const { size, handleMouseDown, resizing } = useResize({
    axis: "horizontal",
    defaultSize: SIDE_DEFAULT,
    minSize: 250,
    maxSize,
  });

  return (
    <div className="flex shrink-0" style={{ width: size }}>
      <div
        onMouseDown={handleMouseDown}
        className={`flex h-full w-4 shrink-0 cursor-col-resize items-center justify-center ${resizing ? "select-none" : ""}`}
      >
        <div
          className={`w-0.5 rounded-full transition-colors ${
            resizing ? "bg-white/40" : "bg-white/10 hover:bg-white/25"
          }`}
          style={{
            height: "100%",
            maskImage:
              "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
          }}
        />
      </div>
      <div className="flex flex-1 flex-col justify-center overflow-hidden p-4">
        <VideoPanel />
      </div>
    </div>
  );
}
