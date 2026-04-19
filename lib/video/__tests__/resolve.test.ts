import { describe, expect, it } from "vitest";
import { resolveElements } from "../resolve";
import {
  SCENE_TYPE,
  type CanvasContentElement,
  type SceneElement,
} from "@/app/components/canvas/types";
import type { ElementSnapshot } from "@/lib/generation/queue";

function makeElement(
  id: string,
  type: CanvasContentElement["type"],
): CanvasContentElement {
  return {
    id,
    type,
    children: [{ id: `${id}-text`, type, text: "test" }],
  };
}

const wrap = (children: CanvasContentElement[]): SceneElement => ({
  id: "scene-1",
  type: SCENE_TYPE,
  children,
});

function makeSnapshot(
  overrides: Partial<ElementSnapshot> = {},
): ElementSnapshot {
  return {
    status: "idle",
    seconds: 0,
    result: { url: "https://example.com/asset.mp3", durationSec: 5 },
    error: null,
    resultInputs: null,
    ...overrides,
  };
}

describe("resolveElements", () => {
  it("resolves elements with results", () => {
    const elements = [
      makeElement("img1", "image"),
      makeElement("nar1", "narration"),
    ];
    const snapshots: Record<string, ElementSnapshot> = {
      img1: makeSnapshot({
        result: { url: "https://example.com/img.png", durationSec: 3 },
      }),
      nar1: makeSnapshot({
        result: { url: "https://example.com/nar.mp3", durationSec: 8 },
      }),
    };

    const resolved = resolveElements([wrap(elements)], (id) => snapshots[id]);

    expect(resolved).toHaveLength(2);
    expect(resolved[0]).toEqual({
      id: "img1",
      type: "image",
      role: "foreground",
      layer: "visual",
      url: "https://example.com/img.png",
      durationSec: 3,
    });
    expect(resolved[1]).toEqual({
      id: "nar1",
      type: "narration",
      role: "overlay",
      layer: "audio",
      url: "https://example.com/nar.mp3",
      durationSec: 8,
    });
  });

  it("skips elements without results", () => {
    const elements = [
      makeElement("img1", "image"),
      makeElement("nar1", "narration"),
    ];
    const snapshots: Record<string, ElementSnapshot> = {
      img1: makeSnapshot({
        result: { url: "https://example.com/img.png", durationSec: 3 },
      }),
      nar1: makeSnapshot({ status: "idle", result: null }),
    };

    const resolved = resolveElements([wrap(elements)], (id) => snapshots[id]);
    expect(resolved).toHaveLength(1);
    expect(resolved[0].id).toBe("img1");
  });

  it("returns empty for no elements", () => {
    const resolved = resolveElements([], () => makeSnapshot());
    expect(resolved).toEqual([]);
  });

  it("assigns correct roles and layers for all element types", () => {
    const types: CanvasContentElement["type"][] = [
      "image",
      "clip",
      "narration",
      "character",
      "music",
      "sound",
    ];
    const elements = types.map((t, i) => makeElement(`el${i}`, t));
    const resolved = resolveElements([wrap(elements)], () => makeSnapshot());

    const roleMap = Object.fromEntries(resolved.map((r) => [r.type, r.role]));
    expect(roleMap).toEqual({
      image: "foreground",
      clip: "foreground",
      narration: "overlay",
      character: "overlay",
      music: "background",
      sound: "effect",
    });

    const layerMap = Object.fromEntries(resolved.map((r) => [r.type, r.layer]));
    expect(layerMap).toEqual({
      image: "visual",
      clip: "visual",
      narration: "audio",
      character: "audio",
      music: "audio",
      sound: "audio",
    });
  });

  it("skips all elements when none have results", () => {
    const elements = [
      makeElement("img1", "image"),
      makeElement("nar1", "narration"),
    ];
    const noResult = makeSnapshot({ status: "idle", result: null });
    const resolved = resolveElements([wrap(elements)], () => noResult);
    expect(resolved).toEqual([]);
  });
});
