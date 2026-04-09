import { describe, expect, it } from "vitest";
import { resolveElements } from "../resolve";
import type { CanvasElement } from "@/app/components/canvas/types";
import type { ElementSnapshot } from "@/lib/generation/queue";

function makeElement(id: string, type: CanvasElement["type"]): CanvasElement {
  return { id, type, children: [{ text: "" }] } as CanvasElement;
}

function makeSnapshot(
  result: ElementSnapshot["result"] = null,
): ElementSnapshot {
  return { status: "idle", seconds: 0, result, error: null };
}

describe("resolveElements", () => {
  it("resolves elements with results", () => {
    const elements = [makeElement("1", "image"), makeElement("2", "narration")];
    const snapshots: Record<string, ElementSnapshot> = {
      "1": makeSnapshot({ url: "https://cdn/img.png", durationSec: 0 }),
      "2": makeSnapshot({ url: "https://cdn/audio.mp3", durationSec: 5 }),
    };

    const resolved = resolveElements(elements, (id) => snapshots[id]);

    expect(resolved).toEqual([
      {
        id: "1",
        type: "image",
        role: "foreground",
        layer: "visual",
        url: "https://cdn/img.png",
        durationSec: 0,
      },
      {
        id: "2",
        type: "narration",
        role: "overlay",
        layer: "audio",
        url: "https://cdn/audio.mp3",
        durationSec: 5,
      },
    ]);
  });

  it("skips elements without results", () => {
    const elements = [makeElement("1", "image"), makeElement("2", "music")];
    const snapshots: Record<string, ElementSnapshot> = {
      "1": makeSnapshot({ url: "https://cdn/img.png", durationSec: 0 }),
      "2": makeSnapshot(null),
    };

    const resolved = resolveElements(elements, (id) => snapshots[id]);

    expect(resolved).toHaveLength(1);
    expect(resolved[0].id).toBe("1");
  });

  it("returns empty array for no elements", () => {
    const resolved = resolveElements([], () => makeSnapshot());
    expect(resolved).toEqual([]);
  });

  it("maps all element types to correct roles and layers", () => {
    const types = [
      "image",
      "clip",
      "narration",
      "character",
      "music",
      "sound",
    ] as const;
    const elements = types.map((t, i) => makeElement(String(i), t));
    const getSnapshot = () =>
      makeSnapshot({ url: "https://cdn/file", durationSec: 1 });

    const resolved = resolveElements(elements, getSnapshot);

    const roles = resolved.map((r) => r.role);
    expect(roles).toEqual([
      "foreground",
      "foreground",
      "overlay",
      "overlay",
      "background",
      "effect",
    ]);

    const layers = resolved.map((r) => r.layer);
    expect(layers).toEqual([
      "visual",
      "visual",
      "audio",
      "audio",
      "audio",
      "audio",
    ]);
  });
});
