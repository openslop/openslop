import { describe, expect, it } from "vitest";
import { resolveElements } from "../resolve";
import {
	SCENE_TYPE,
	type ContentElement,
	type Scene,
} from "@/lib/canvas/types";
import type { ElementSnapshot } from "@/lib/generation/snapshots";
import { splitAttributes } from "@/lib/canvas/element-attributes";
import { toCaption } from "@/lib/captions/word-captions";

function makeElement(
	id: string,
	type: ContentElement["type"],
	customAttributes?: Record<string, string>,
): ContentElement {
	return {
		id,
		type,
		...splitAttributes(customAttributes ?? {}),
		children: [{ id: `${id}-text`, type, text: "test" }],
	};
}

const wrap = (children: ContentElement[]): Scene => ({
	id: "scene-1",
	type: SCENE_TYPE,
	children,
});

function makeSnapshot(
	overrides: Partial<ElementSnapshot> = {},
): ElementSnapshot {
	return {
		status: "idle",
		startedAt: null,
		pinned: false,
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

		const resolved = resolveElements(
			[wrap(elements)],
			(id) => snapshots[id] ?? makeSnapshot({ result: null }),
			{
				captionsEnabled: true,
			},
		);

		expect(resolved).toHaveLength(2);
		expect(resolved[0]).toEqual({
			id: "img1",
			type: "image",
			role: "foreground",
			layer: "visual",
			sceneId: "scene-1",
			sceneNumber: 1,
			prompt: "test",
			url: "https://example.com/img.png",
			durationSec: 3,
			mediaDurationSec: 3,
			trimStartSec: 0,
			loops: 1,
			loop: false,
			volume: 10,
			motion: "none",
		});
		expect(resolved[1]).toEqual({
			id: "nar1",
			type: "narration",
			role: "overlay",
			layer: "audio",
			sceneId: "scene-1",
			sceneNumber: 1,
			prompt: "test",
			url: "https://example.com/nar.mp3",
			durationSec: 8,
			mediaDurationSec: 8,
			trimStartSec: 0,
			loops: 1,
			loop: false,
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

		const resolved = resolveElements(
			[wrap(elements)],
			(id) => snapshots[id] ?? makeSnapshot({ result: null }),
			{
				captionsEnabled: true,
			},
		);
		expect(resolved).toHaveLength(1);
		expect(resolved[0].id).toBe("img1");
	});

	it("returns empty for no elements", () => {
		const resolved = resolveElements([], () => makeSnapshot(), {
			captionsEnabled: true,
		});
		expect(resolved).toEqual([]);
	});

	it("assigns correct roles and layers for all element types", () => {
		const types: ContentElement["type"][] = [
			"image",
			"video",
			"narration",
			"character",
			"music",
			"sound",
		];
		const elements = types.map((t, i) => makeElement(`el${i}`, t));
		const resolved = resolveElements([wrap(elements)], () => makeSnapshot(), {
			captionsEnabled: true,
		});

		const roleMap = Object.fromEntries(resolved.map((r) => [r.type, r.role]));
		expect(roleMap).toEqual({
			image: "foreground",
			video: "foreground",
			narration: "overlay",
			character: "overlay",
			music: "background",
			sound: "effect",
		});

		const layerMap = Object.fromEntries(resolved.map((r) => [r.type, r.layer]));
		expect(layerMap).toEqual({
			image: "visual",
			video: "visual",
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
		const resolved = resolveElements([wrap(elements)], () => makeSnapshot(), {
			captionsEnabled: true,
		});
		expect(resolved[0].loops).toBe(4);
		expect(resolved[1].loops).toBe(1);
	});

	it("clamps invalid loops attributes to at least 1", () => {
		const elements = [
			makeElement("s1", "sound", { loops: "0" }),
			makeElement("s2", "sound", { loops: "not-a-number" }),
		];
		const resolved = resolveElements([wrap(elements)], () => makeSnapshot(), {
			captionsEnabled: true,
		});
		expect(resolved[0].loops).toBe(1);
		expect(resolved[1].loops).toBe(1);
	});

	it("reads volume from customAttributes (default 10)", () => {
		const elements = [
			makeElement("s1", "music", { volume: "3" }),
			makeElement("s2", "music", { volume: "0" }),
			makeElement("s3", "music"),
		];
		const resolved = resolveElements([wrap(elements)], () => makeSnapshot(), {
			captionsEnabled: true,
		});
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
		const resolved = resolveElements([wrap(elements)], () => makeSnapshot(), {
			captionsEnabled: true,
		});
		expect(resolved[0].volume).toBe(0);
		expect(resolved[1].volume).toBe(10);
		expect(resolved[2].volume).toBe(10);
	});

	it("keeps a blank volume attribute audible in the rendered layout", () => {
		const elements = [
			makeElement("s1", "music", { volume: "" }),
			makeElement("s2", "music", { loops: "" }),
		];
		const resolved = resolveElements([wrap(elements)], () => makeSnapshot(), {
			captionsEnabled: true,
		});
		expect(resolved[0].volume).toBe(10);
		expect(resolved[1].loops).toBe(1);
	});

	it("skips all elements when none have results", () => {
		const elements = [
			makeElement("img1", "image"),
			makeElement("nar1", "narration"),
		];
		const noResult = makeSnapshot({ status: "idle", result: null });
		const resolved = resolveElements([wrap(elements)], () => noResult, {
			captionsEnabled: true,
		});
		expect(resolved).toEqual([]);
	});

	describe("captions", () => {
		const heard = [toCaption("one", 0, 1), toCaption("two", 2, 3)];
		const snapshots: Record<string, ElementSnapshot> = {
			vid: makeSnapshot({
				result: {
					videoUrl: "https://example.com/v.mp4",
					durationSec: 5,
					textTimestamps: heard,
				},
			}),
			img: makeSnapshot({
				result: { imageUrl: "https://example.com/i.png", durationSec: 0 },
			}),
		};
		const bySnapshot = (id: string) => snapshots[id] ?? makeSnapshot();
		const resolveOne = (element: ContentElement, captionsEnabled = true) =>
			resolveElements([wrap([element])], bySnapshot, { captionsEnabled })[0];

		it("captions an element with the words on its own result, until it ends", () => {
			expect(resolveOne(makeElement("vid", "video")).captions).toEqual({
				firstWordIndex: 0,
				words: heard,
			});
		});

		it("drops captions when captions are disabled project-wide", () => {
			expect(
				resolveOne(makeElement("vid", "video"), false).captions,
			).toBeUndefined();
		});

		it("counts the words a trim cuts, so an edit still lands on the element's own", () => {
			const { captions } = resolveOne(
				makeElement("vid", "video", { trimStart: "1.5" }),
			);
			expect(captions?.firstWordIndex).toBe(1);
			expect(captions?.words).toEqual([toCaption("two", 0.5, 1.5)]);
		});

		it("captions nothing an element has no words for", () => {
			expect(resolveOne(makeElement("img", "image")).captions).toBeUndefined();
		});
	});

	describe("trims", () => {
		it("applies a video's trims", () => {
			const [video] = resolveElements(
				[
					wrap([
						makeElement("v1", "video", {
							trimStart: "1",
							timelineDuration: "3",
						}),
					]),
				],
				() => makeSnapshot(),
				{ captionsEnabled: false },
			);
			expect(video).toMatchObject({ trimStartSec: 1, durationSec: 3 });
		});
	});
});
