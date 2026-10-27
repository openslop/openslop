import { beforeEach, describe, expect, it } from "vitest";
import { NARRATOR } from "@/lib/canvas/assets";
import { element as elementWithText } from "@/lib/canvas/__tests__/_assets";
import { createCanvasElement } from "@/lib/canvas/create-canvas-element";
import {
	type ElementType,
	type GeneratedElement,
	type CanvasElement,
} from "@/lib/canvas/types";
import { createProjectStore, type ProjectStore } from "@/lib/project/store";
import { LAYOUT_ATTRIBUTE_KEYS } from "@/lib/canvas/element-attributes";
import { flattenGraph, type GenerationNode } from "../graph";
import { GenerationQueue } from "../queue";
import { buildNode } from "../generation-graph";
import { DEFAULT_TTS_MODEL } from "@/lib/connectors/tts/models";
import { staleReason } from "../stale-reason";
import { isNodeStale } from "../staleness";
import { storeCtx } from "./_context";

let store: ProjectStore;
let assets: CanvasElement[];

const make = <T extends ElementType>(
	type: T,
	text = "",
	attrs: Record<string, string> = {},
	id?: string,
) => createCanvasElement(type, { id, attrs, text });

const avatar = (name: string, appearance: string) =>
	make("asset_avatar", appearance, { name }, `avatar-${name}`);

const element = (
	id: string,
	type: "image" | "video" | "narration",
	customAttributes?: Record<string, string>,
) => elementWithText(id, type, "a sunset", customAttributes);

const resolveOn = (el: GeneratedElement, canvas: CanvasElement[]) =>
	buildNode(el, storeCtx(store, [...assets, ...canvas]));

const resolve = (el: GeneratedElement) => resolveOn(el, []);

const idsOf = (el: GeneratedElement) =>
	flattenGraph([resolve(el)]).map((node) => node.id);

const edgesOf = (node: GenerationNode) =>
	Object.fromEntries(
		Object.entries(node.dependsOn).map(([label, dep]) => [label, dep.id]),
	);

const commit = (queue: GenerationQueue, node: GenerationNode, url: string) =>
	queue.commitResult(node, { imageUrl: url, durationSec: 0 });

const generateAll = (queue: GenerationQueue, root: GenerationNode) => {
	for (const node of flattenGraph([root]))
		commit(queue, node, `${node.id}.out`);
};

beforeEach(() => {
	store = createProjectStore();
	assets = [
		make("asset_style", "noir"),
		make("asset_references", "", { images: "a.png" }),
		avatar("Alice", "red hair"),
	];
});

describe("buildNode", () => {
	// Slate notifies selectors before the next render, so the handed element can be one edit old.
	it("builds from the element on the canvas, not the one it was handed", () => {
		const stale = element("vid", "video", { duration: "10" });
		const canvas = [element("vid", "video", { duration: "11" })];

		expect(resolveOn(stale, canvas).inputs.attributes).toEqual({
			duration: "11",
		});
	});

	it("builds the given element when the canvas does not carry it", () => {
		const offCanvas = element("gone", "video", { duration: "5" });

		expect(resolve(offCanvas).inputs.attributes.duration).toBe("5");
	});

	it.each([
		["image", "image"],
		["narration", "tts"],
		["asset_avatar", "image"],
	] as const)("builds a %s on the %s connector", (type, connectorType) => {
		assets = [];
		const target = make(type, "said", {}, "target");

		const node = resolve(target);

		expect(node.id).toBe(target.id);
		expect(node.inputs.prompt).toBe("said");
		expect(node.job).toMatchObject({
			elementType: type,
			connectorType,
		});
	});

	it("keys each edge by the label its plugin declared", () => {
		const img = element("img", "image");
		const video = elementWithText("vid", "video", "{{Alice}} at sunset", {
			startFrame: "previous",
		});

		const node = resolveOn(video, [img, video]);

		expect(edgesOf(node)).toEqual({
			"Alice's avatar": "avatar-Alice",
			"the previous visual": "img",
		});
	});

	it("reads the style and the references an image is drawn with, depending on neither", () => {
		const img = element("img", "image");

		expect(idsOf(img)).toEqual(["img"]);
		expect(resolve(img).inputs.reads).toMatchObject({
			"the art style": "noir",
			"the reference images": "a.png",
		});
	});

	it.each([
		[
			"a character with no avatar",
			elementWithText("el", "image", "{{Nobody}}"),
		],
		[
			"a video with nothing before it",
			element("el", "video", { startFrame: "previous" }),
		],
	])("declares no edge for %s", (_, el) => {
		expect(resolveOn(el, [el]).dependsOn).toEqual({});
	});

	it("builds an avatar showing itself without depending on it", () => {
		const red = make("asset_avatar", "{{Red}} in a red hood", { name: "Red" });

		const node = resolveOn(red, [red]);

		expect(node.dependsOn).toEqual({});
		expect(node.inputs.reads).toMatchObject({
			"the art style": "noir",
			"the reference images": "a.png",
		});
	});

	it("depends on the avatar of each character it shows, and no other", () => {
		assets = [...assets, avatar("Bob", "tall")];
		const ids = idsOf(elementWithText("img", "image", "{{Alice}} at sunset"));

		expect(ids).toEqual(["avatar-Alice", "img"]);
	});

	it.each([
		[
			"a character it shows is given an avatar",
			"{{Bob}} at sunset",
			() => {
				assets = [...assets, avatar("Bob", "tall")];
			},
			"Bob's avatar",
		],
		[
			"a character's avatar is removed",
			"{{Alice}} at sunset",
			() => {
				assets = assets.filter(({ type }) => type !== "asset_avatar");
			},
			"Alice's avatar",
		],
		[
			"the aspect ratio it read changes",
			"a sunset",
			() => store.getState().updateVideoSettings({ aspectRatio: "9:16" }),
			"The aspect ratio",
		],
		[
			"the art style is edited",
			"a sunset",
			() => {
				assets = [make("asset_style", "watercolor"), ...assets.slice(1)];
			},
			"The art style",
		],
	])("stales an image once %s", (_, text, change, what) => {
		const queue = new GenerationQueue();
		const img = elementWithText("img", "image", text);
		generateAll(queue, resolve(img));
		expect(isNodeStale(resolve(img), queue)).toBe(false);

		change();

		expect(staleReason(resolve(img), queue)).toBe(
			`${what} changed — regenerate to update`,
		);
	});

	it("leaves a character's portrait fresh when their voice changes", () => {
		const queue = new GenerationQueue();
		const img = elementWithText("img", "image", "{{Alice}} at sunset");
		generateAll(queue, resolve(img));

		assets = [
			...assets,
			make("asset_voice", "", {
				name: "Alice",
				age: "child",
				description: "gravelly",
				provider: "cartesia",
				model: "sonic-2",
				voiceId: "v1",
			}),
		];

		expect(isNodeStale(resolve(img), queue)).toBe(false);
	});

	it("keeps generation attributes as inputs and strips every layout key", () => {
		const layoutOnly = Object.fromEntries(
			LAYOUT_ATTRIBUTE_KEYS.map((key) => [key, "1"]),
		);
		const node = resolve(
			element("vid-1", "video", { ...layoutOnly, model: "Slop Video v1" }),
		);

		expect(node.inputs.attributes).toEqual({ model: "Slop Video v1" });
	});

	it("leaves a node that reads nothing alone when the project state changes", () => {
		const queue = new GenerationQueue();
		const sound = make("sound", "rain", {}, "sound");
		generateAll(queue, resolve(sound));

		store.getState().updateVideoSettings({ aspectRatio: "9:16" });

		expect(resolve(sound).inputs.reads).toEqual({});
		expect(isNodeStale(resolve(sound), queue)).toBe(false);
	});

	describe("speech and the voice it is spoken in", () => {
		const line = element("line", "narration");
		const voice = (attrs: Record<string, string>) => {
			assets = [
				make("asset_voice", "", { name: NARRATOR, ...attrs }, "narrator-voice"),
			];
		};

		it("stays current while its voice stays, and stales when another voice is picked", () => {
			const queue = new GenerationQueue();
			voice({ ...DEFAULT_TTS_MODEL, pickedVoiceId: "v-1" });
			generateAll(queue, resolve(line));
			expect(isNodeStale(resolve(line), queue)).toBe(false);

			voice({ ...DEFAULT_TTS_MODEL, pickedVoiceId: "v-2" });

			expect(staleReason(resolve(line), queue)).toBe(
				"Narrator's voice changed — regenerate to update",
			);
		});

		it("stales when the traits of a voice it found change", () => {
			const queue = new GenerationQueue();
			voice({ ...DEFAULT_TTS_MODEL, gender: "feminine" });
			generateAll(queue, resolve(line));

			voice({ ...DEFAULT_TTS_MODEL, gender: "masculine" });

			expect(staleReason(resolve(line), queue)).toBe(
				"Narrator's voice changed — regenerate to update",
			);
		});
	});
});
