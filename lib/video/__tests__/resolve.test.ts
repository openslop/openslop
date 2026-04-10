import { describe, expect, it } from "vitest";
import { resolveElements } from "../resolve";
import type { ElementSnapshot } from "@/lib/generation/queue";
import type { CanvasElement } from "@/app/components/canvas/types";

function makeElement(id: string, type: CanvasElement["type"]): CanvasElement {
  return {
    id,
    type,
    children: [{ id: `${id}-t`, type, text: "some prompt" }],
  };
}

const IDLE_WITH_RESULT: ElementSnapshot = {
  status: "idle",
  seconds: 0,
  result: { url: "https://example.com/asset.mp3", durationSec: 5 },
  error: null,
};

const IDLE_NO_RESULT: ElementSnapshot = {
  status: "idle",
  seconds: 0,
  result: null,
  error: null,
};

const GENERATING: ElementSnapshot = {
  status: "generating",
  seconds: 3,
  result: null,
  error: null,
};

describe("resolveElements", () => {
  it("returns empty array for no elements", () => {
    const result = resolveElements([], () => IDLE_NO_RESULT);
    expect(result).toEqual([]);
  });

  it("skips elements without results", () => {
    const elements = [
      makeElement("e1", "image"),
      makeElement("e2", "narration"),
    ];
    const result = resolveElements(elements, () => IDLE_NO_RESULT);
    expect(result).toEqual([]);
  });

  it("skips elements that are still generating", () => {
    const elements = [makeElement("e1", "image")];
    const result = resolveElements(elements, () => GENERATING);
    expect(result).toEqual([]);
  });

  it("resolves elements with results", () => {
    const elements = [makeElement("e1", "image")];
    const result = resolveElements(elements, () => IDLE_WITH_RESULT);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "e1",
      type: "image",
      role: "foreground",
      layer: "visual",
      url: "https://example.com/asset.mp3",
      durationSec: 5,
    });
  });

  it("maps element types to correct roles and layers", () => {
    const types: CanvasElement["type"][] = [
      "image",
      "clip",
      "narration",
      "character",
      "music",
      "sound",
    ];
    const elements = types.map((t, i) => makeElement(`e${i}`, t));
    const result = resolveElements(elements, () => IDLE_WITH_RESULT);

    expect(result).toHaveLength(6);
    expect(result[0]).toMatchObject({
      type: "image",
      role: "foreground",
      layer: "visual",
    });
    expect(result[1]).toMatchObject({
      type: "clip",
      role: "foreground",
      layer: "visual",
    });
    expect(result[2]).toMatchObject({
      type: "narration",
      role: "overlay",
      layer: "audio",
    });
    expect(result[3]).toMatchObject({
      type: "character",
      role: "overlay",
      layer: "audio",
    });
    expect(result[4]).toMatchObject({
      type: "music",
      role: "background",
      layer: "audio",
    });
    expect(result[5]).toMatchObject({
      type: "sound",
      role: "effect",
      layer: "audio",
    });
  });

  it("only includes elements whose snapshots have results", () => {
    const elements = [
      makeElement("e1", "image"),
      makeElement("e2", "narration"),
      makeElement("e3", "clip"),
    ];
    const snapshots: Record<string, ElementSnapshot> = {
      e1: IDLE_WITH_RESULT,
      e2: IDLE_NO_RESULT,
      e3: {
        status: "idle",
        seconds: 0,
        result: { url: "https://example.com/clip.mp4", durationSec: 10 },
        error: null,
      },
    };
    const result = resolveElements(
      elements,
      (id) => snapshots[id] ?? IDLE_NO_RESULT,
    );

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("e1");
    expect(result[1].id).toBe("e3");
  });

  it("preserves element order", () => {
    const elements = [
      makeElement("e3", "music"),
      makeElement("e1", "image"),
      makeElement("e2", "narration"),
    ];
    const result = resolveElements(elements, () => IDLE_WITH_RESULT);

    expect(result.map((r) => r.id)).toEqual(["e3", "e1", "e2"]);
  });

  it("uses durationSec from the snapshot result", () => {
    const elements = [makeElement("e1", "clip")];
    const snapshot: ElementSnapshot = {
      status: "idle",
      seconds: 0,
      result: { url: "https://example.com/vid.mp4", durationSec: 42 },
      error: null,
    };
    const result = resolveElements(elements, () => snapshot);

    expect(result[0].durationSec).toBe(42);
    expect(result[0].url).toBe("https://example.com/vid.mp4");
  });
});
