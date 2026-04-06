import { describe, expect, it } from "vitest";
import { buildVideoLayout } from "../scene-builder";
import type { ResolvedElement, Sequence, VideoLayout } from "../types";
import type { CanvasElementType } from "@/app/components/canvas/types";

function seqs(layout: VideoLayout, type: CanvasElementType): Sequence[] {
  const s = layout.sequences[type];
  expect(s).toBeDefined();
  return s as Sequence[];
}

function el(
  overrides: Partial<ResolvedElement> & {
    id: string;
    type: ResolvedElement["type"];
  },
): ResolvedElement {
  const roles: Record<string, ResolvedElement["role"]> = {
    image: "foreground",
    clip: "foreground",
    narration: "overlay",
    character: "overlay",
    music: "background",
    sound: "background",
  };
  const layers: Record<string, ResolvedElement["layer"]> = {
    image: "visual",
    clip: "visual",
    narration: "audio",
    character: "audio",
    music: "audio",
    sound: "audio",
  };
  return {
    role: roles[overrides.type],
    layer: layers[overrides.type],
    url: `https://example.com/${overrides.id}`,
    durationSec: 0,
    ...overrides,
  };
}

describe("buildVideoLayout", () => {
  it("returns empty layout for no elements", () => {
    const layout = buildVideoLayout([]);
    expect(layout.series).toHaveLength(0);
    expect(layout.totalDurationSec).toBe(0);
    expect(layout.totalFrames).toBe(2);
  });

  it("creates a series entry for a foreground element", () => {
    const layout = buildVideoLayout([
      el({ id: "img1", type: "image", durationSec: 5 }),
    ]);
    expect(layout.series).toHaveLength(1);
    expect(layout.series[0].element?.id).toBe("img1");
    expect(layout.series[0].start).toBe(0);
    expect(layout.series[0].duration).toBe(5);
    expect(layout.totalDurationSec).toBe(5);
  });

  it("plays foreground elements consecutively", () => {
    const layout = buildVideoLayout([
      el({ id: "img1", type: "image", durationSec: 5 }),
      el({ id: "clip1", type: "clip", durationSec: 3 }),
    ]);
    expect(layout.series).toHaveLength(2);
    expect(layout.series[0].start).toBe(0);
    expect(layout.series[1].start).toBe(5);
    expect(layout.totalDurationSec).toBe(8);
  });

  it("overlay extends current series entry duration", () => {
    const layout = buildVideoLayout([
      el({ id: "img1", type: "image", durationSec: 5 }),
      el({ id: "n1", type: "narration", durationSec: 8 }),
    ]);
    expect(layout.series).toHaveLength(1);
    expect(layout.series[0].duration).toBe(13);
    expect(seqs(layout, "narration")).toHaveLength(1);
    expect(seqs(layout, "narration")[0].start).toBe(5);
    expect(seqs(layout, "narration")[0].duration).toBe(8);
  });

  it("foreground fills empty entry created by preceding overlay", () => {
    const layout = buildVideoLayout([
      el({ id: "n1", type: "narration", durationSec: 4 }),
      el({ id: "img1", type: "image", durationSec: 5 }),
    ]);
    expect(layout.series).toHaveLength(1);
    expect(layout.series[0].element?.id).toBe("img1");
    expect(layout.series[0].duration).toBe(4);
    expect(seqs(layout, "narration")[0].start).toBe(0);
  });

  it("multiple overlays stack on current series entry", () => {
    const layout = buildVideoLayout([
      el({ id: "img1", type: "image", durationSec: 0 }),
      el({ id: "n1", type: "narration", durationSec: 5 }),
      el({ id: "c1", type: "character", durationSec: 3 }),
    ]);
    expect(layout.series[0].duration).toBe(9);
    expect(seqs(layout, "narration")[0].start).toBe(1);
    expect(seqs(layout, "character")[0].start).toBe(6);
  });

  it("background element spans until replaced", () => {
    const layout = buildVideoLayout([
      el({ id: "m1", type: "music", durationSec: 30 }),
      el({ id: "img1", type: "image", durationSec: 10 }),
    ]);
    expect(seqs(layout, "music")).toHaveLength(1);
    expect(seqs(layout, "music")[0].start).toBe(0);
    expect(seqs(layout, "music")[0].duration).toBe(10);
  });

  it("new background of same type caps previous duration", () => {
    const layout = buildVideoLayout([
      el({ id: "m1", type: "music", durationSec: 30 }),
      el({ id: "img1", type: "image", durationSec: 10 }),
      el({ id: "m2", type: "music", durationSec: 20 }),
    ]);
    expect(seqs(layout, "music")).toHaveLength(2);
    expect(seqs(layout, "music")[0].duration).toBe(10);
    expect(seqs(layout, "music")[1].start).toBe(10);
    expect(seqs(layout, "music")[1].duration).toBe(1);
  });

  it("overlay-only produces null-element series entry", () => {
    const layout = buildVideoLayout([
      el({ id: "n1", type: "narration", durationSec: 4 }),
    ]);
    expect(layout.series).toHaveLength(1);
    expect(layout.series[0].element).toBeNull();
    expect(layout.series[0].duration).toBe(4);
  });

  it("computes totalFrames from totalDurationSec and fps", () => {
    const layout = buildVideoLayout(
      [el({ id: "img1", type: "image", durationSec: 5 })],
      { fps: 30 },
    );
    expect(layout.totalFrames).toBe(150);
  });

  it("handles mixed foreground, overlay, and background", () => {
    const layout = buildVideoLayout([
      el({ id: "m1", type: "music", durationSec: 60 }),
      el({ id: "img1", type: "image", durationSec: 3 }),
      el({ id: "n1", type: "narration", durationSec: 5 }),
      el({ id: "clip1", type: "clip", durationSec: 4 }),
      el({ id: "n2", type: "narration", durationSec: 6 }),
    ]);

    expect(layout.series).toHaveLength(2);
    expect(layout.series[0].element?.id).toBe("img1");
    expect(layout.series[0].duration).toBe(8);
    expect(layout.series[1].element?.id).toBe("clip1");
    expect(layout.series[1].duration).toBe(10);
    expect(layout.totalDurationSec).toBe(18);

    expect(seqs(layout, "music")).toHaveLength(1);
    expect(seqs(layout, "narration")).toHaveLength(2);
  });
});
