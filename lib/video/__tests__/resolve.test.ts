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
	customAttributes?: Record<string, string>,
): CanvasContentElement {
	return {
		id,
		type,
		...(customAttributes && { customAttributes }),
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
		result: {
			imageUrl: "https://example.com/asset.png",
			audioUrl: "https://example.com/asset.mp3",
			videoUrl: "https://example.com/asset.mp4",
			durationSec: 5,
		},
		error: null,
		resultInputs: null,
		connectorType: null,
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
				result: { imageUrl: "https://example.com/img.png", durationSec: 3 },
			}),
			nar1: makeSnapshot({
				result: { audioUrl: "https://example.com/nar.mp3", durationSec: 8 },
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
			loops: 1,
			volume: 10,
			motion: "none",
		});
		expect(resolved[1]).toEqual({
			id: "nar1",
			type: "narration",
			role: "overlay",
			layer: "audio",
			url: "https://example.com/nar.mp3",
			durationSec: 8,
			loops: 1,
			volume: 10,
			motion: "none",
		});
	});

	it("skips elements without results", () => {
		const elements = [
			makeElement("img1", "image"),
			makeElement("nar1", "narration"),
		];
		const snapshots: Record<string, ElementSnapshot> = {
			img1: makeSnapshot({
				result: { imageUrl: "https://example.com/img.png", durationSec: 3 },
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
			"animated_image",
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
			animated_image: "foreground",
			clip: "foreground",
			narration: "overlay",
			character: "overlay",
			music: "background",
			sound: "effect",
		});

		const layerMap = Object.fromEntries(resolved.map((r) => [r.type, r.layer]));
		expect(layerMap).toEqual({
			image: "visual",
			animated_image: "visual",
			clip: "visual",
			narration: "audio",
			character: "audio",
			music: "audio",
			sound: "audio",
		});
	});

	it("reads loops from customAttributes (default 1)", () => {
		const elements = [
			makeElement("s1", "sound", { loops: "4" }),
			makeElement("s2", "sound"),
		];
		const resolved = resolveElements([wrap(elements)], () => makeSnapshot());
		expect(resolved[0].loops).toBe(4);
		expect(resolved[1].loops).toBe(1);
	});

	it("clamps invalid loops attributes to at least 1", () => {
		const elements = [
			makeElement("s1", "sound", { loops: "0" }),
			makeElement("s2", "sound", { loops: "not-a-number" }),
		];
		const resolved = resolveElements([wrap(elements)], () => makeSnapshot());
		expect(resolved[0].loops).toBe(1);
		expect(resolved[1].loops).toBe(1);
	});

	it("reads volume from customAttributes (default 10)", () => {
		const elements = [
			makeElement("s1", "music", { volume: "3" }),
			makeElement("s2", "music", { volume: "0" }),
			makeElement("s3", "music"),
		];
		const resolved = resolveElements([wrap(elements)], () => makeSnapshot());
		expect(resolved[0].volume).toBe(3);
		expect(resolved[1].volume).toBe(0);
		expect(resolved[2].volume).toBe(10);
	});

	it("clamps volume to 0-10 and falls back on invalid values", () => {
		const elements = [
			makeElement("s1", "music", { volume: "-2" }),
			makeElement("s2", "music", { volume: "42" }),
			makeElement("s3", "music", { volume: "not-a-number" }),
		];
		const resolved = resolveElements([wrap(elements)], () => makeSnapshot());
		expect(resolved[0].volume).toBe(0);
		expect(resolved[1].volume).toBe(10);
		expect(resolved[2].volume).toBe(10);
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
