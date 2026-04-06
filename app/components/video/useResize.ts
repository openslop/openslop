"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useResize({
  axis,
  defaultSize,
  minSize,
  maxSize,
}: {
  axis: "vertical" | "horizontal";
  defaultSize: number;
  minSize: number;
  maxSize: number;
}) {
  const [size, setSize] = useState(defaultSize);
  const [resizing, setResizing] = useState(false);
  const sizeRef = useRef(size);
  useEffect(() => {
    sizeRef.current = size;
  }, [size]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const start = axis === "vertical" ? e.clientY : e.clientX;
      const startSize = sizeRef.current;
      setResizing(true);

      const onMove = (ev: MouseEvent) => {
        const pos = axis === "vertical" ? ev.clientY : ev.clientX;
        const delta = axis === "vertical" ? pos - start : start - pos;
        setSize(Math.max(minSize, Math.min(startSize + delta, maxSize)));
      };

      const onUp = () => {
        setResizing(false);
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [axis, minSize, maxSize],
  );

  return { size, handleMouseDown, resizing };
}
