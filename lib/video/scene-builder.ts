import last from "lodash/last";
import type {
  ResolvedElement,
  Sequence,
  VideoConfig,
  VideoLayout,
} from "./types";
import { DEFAULT_CONFIG } from "./types";

const MIN_DURATION_SEC = 1;

function createSequence(
  element: ResolvedElement | null,
  start: number,
  duration?: number,
): Sequence {
  return {
    element,
    start,
    duration: duration ?? Math.max(element?.durationSec ?? 0, MIN_DURATION_SEC),
  };
}

function pushSequence(
  sequences: Record<string, Sequence[]>,
  element: ResolvedElement,
  start: number,
) {
  (sequences[element.type] ??= []).push(createSequence(element, start));
}

/**
 * Walks the element list and assembles scenes with these rules:
 *
 *  1. Foreground → starts a new scene (or fills the current placeholder).
 *  2. Overlay    → extends the current scene's duration; creates a placeholder if none exists.
 *  3. Background → updates the active background layer for that element type. Exclusive (one at a time per type).
 *  4. Effect     → same as background but additive (can overlap).
 *
 * A scene is a consecutive, blocking sequence containing an element within a series.
 */
export function buildVideoLayout(
  elements: ResolvedElement[],
  config?: Partial<VideoConfig>,
): VideoLayout {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const series: Sequence[] = [];
  const sequences: Record<string, Sequence[]> = {};

  for (const element of elements) {
    const current = last(series);
    const cursor = current ? current.start + current.duration : 0;

    switch (element.role) {
      case "effect": {
        pushSequence(sequences, element, cursor);
        break;
      }
      case "background": {
        const prev = last(sequences[element.type]);
        if (prev) {
          prev.duration = Math.min(prev.duration, cursor - prev.start);
        }
        pushSequence(sequences, element, cursor);
        break;
      }
      case "foreground": {
        if (current && !current.element) {
          current.element = element;
        } else {
          series.push(createSequence(element, cursor));
        }
        break;
      }
      case "overlay": {
        if (!current) {
          series.push(createSequence(null, cursor, element.durationSec));
        } else {
          current.duration += element.durationSec;
        }
        pushSequence(sequences, element, cursor);
        break;
      }
    }
  }

  const lastEntry = last(series);
  const totalDurationSec = lastEntry ? lastEntry.start + lastEntry.duration : 0;

  for (const seqs of Object.values(sequences)) {
    for (const seq of seqs) {
      const end = seq.start + seq.duration;
      if (end > totalDurationSec) {
        seq.duration = Math.max(MIN_DURATION_SEC, totalDurationSec - seq.start);
      }
    }
  }

  return {
    series,
    sequences,
    fps: cfg.fps,
    width: cfg.width,
    height: cfg.height,
    totalDurationSec,
    totalFrames: Math.max(2, Math.ceil(totalDurationSec * cfg.fps)),
  };
}
