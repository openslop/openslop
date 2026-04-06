import { useEffect, useRef } from "react";
import { prefetch } from "remotion";
import type { VideoLayout } from "@/lib/video/types";

function collectUrls(layout: VideoLayout): Set<string> {
  const urls = new Set<string>();
  for (const seq of layout.series) {
    if (seq.element) urls.add(seq.element.url);
  }
  for (const seqs of Object.values(layout.sequences)) {
    if (seqs)
      for (const seq of seqs) {
        if (seq.element) urls.add(seq.element.url);
      }
  }
  return urls;
}

export function useAssetPrefetch(layout: VideoLayout | null) {
  const activeRef = useRef(new Map<string, ReturnType<typeof prefetch>>());

  useEffect(() => {
    if (!layout) return;
    const desired = collectUrls(layout);
    const active = activeRef.current;

    for (const [url, handle] of active) {
      if (!desired.has(url)) {
        handle.free();
        active.delete(url);
      }
    }

    for (const url of desired) {
      if (!active.has(url)) {
        active.set(url, prefetch(url));
      }
    }
  }, [layout]);

  useEffect(() => {
    const active = activeRef.current;
    return () => {
      for (const handle of active.values()) handle.free();
      active.clear();
    };
  }, []);
}
