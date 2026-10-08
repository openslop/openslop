import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_CONNECTOR_REGISTRY } from "@/lib/connectors/registry";
import { NARRATOR } from "@/lib/canvas/assets";
import { createCanvasElement } from "@/lib/canvas/createCanvasElement";
import type {
	ElementType,
	GeneratedElement,
	CanvasElement,
} from "@/lib/canvas/types";
import { createProjectStore, type ProjectStore } from "@/lib/project/store";
import {
	LAYOUT_ATTRIBUTE_KEYS,
	splitAttributes,
} from "@/lib/canvas/elementAttributes";
import { flattenGraph, type BuildContext, type GenerationNode } from "../graph";
import { GenerationQueue } from "../queue";
import { buildNode } from "../generationGraph";
import { staleReason } from "../staleReason";
import { isNodeStale, needsGeneration } from "../staleness";

let store: ProjectStore;
let assets: CanvasElement[];

const make = <T extends ElementType>(
	type: T,
	text = "",
	attrs: Record<string, string> = {},
	id?: string,
) => createCanvasElement(type, { id, attrs, text });

const avatar = (name: string, appearance: string) =>
	make("asset_avatar", appearance, { name });

const element = (
	id: string,
	type: "image" | "video" | "narration",
	customAttributes?: Record<string, string>,
): GeneratedElement => ({
	id,
	type,
	...splitAttributes({ ...customAttributes }),
	children: [{ id: `${id}-t`, type, text: "a sunset" }],
});

const context = (canvas: CanvasElement[]): BuildContext => ({
	state: store.getState(),
	canvas: [...assets, ...canvas],
	registry: DEFAULT_CONNECTOR_REGISTRY,
	setAsset: () => {},
});

const resolveOn = (el: GeneratedElement, canvas: CanvasElement[]) =>
	buildNode(el, context(canvas));

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
			elementId: target.id,
			elementType: type,
			connectorType,
		});
	});

	it("keys each edge by the label its plugin declared", () => {
		const img = element("img", "image");
		const video = element("vid", "video", {
			startFrame: "previous",
			characters: "Alice",
		});

		const node = resolveOn(video, [img, video]);

		expect(edgesOf(node)).toEqual({
			"Alice's avatar": "asset_avatar:Alice",
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
		["an asset that is not on the canvas", "image", {}],
		["a character with no avatar", "image", { characters: "Nobody" }],
		["a video with nothing before it", "video", { startFrame: "previous" }],
	] as const)("declares no edge for %s", (name, type, attrs) => {
		if (name.startsWith("an asset")) assets = [];
		const el = element("el", type, attrs);

		expect(resolveOn(el, [el]).dependsOn).toEqual({});
	});

	it("depends on the avatar of each character it shows, and no other", () => {
		assets = [...assets, avatar("Bob", "tall")];
		const ids = idsOf(element("img", "image", { characters: "Alice" }));

		expect(ids).toEqual(["asset_avatar:Alice", "img"]);
	});

	it("goes stale once a character it shows is given an avatar", () => {
		const queue = new GenerationQueue();
		const img = element("img", "image", { characters: "Bob" });
		generateAll(queue, resolve(img));
		expect(isNodeStale(resolve(img), queue)).toBe(false);

		assets = [...assets, avatar("Bob", "tall")];

		expect(isNodeStale(resolve(img), queue)).toBe(true);
	});

	it("drops a character's avatar from the pictures showing them once it is removed", () => {
		const queue = new GenerationQueue();
		const img = element("img", "image", { characters: "Alice" });
		generateAll(queue, resolve(img));

		assets = assets.filter(({ type }) => type !== "asset_avatar");

		expect(idsOf(img)).toEqual(["img"]);
		expect(staleReason(resolve(img), queue)).toBe(
			"Alice's avatar changed — regenerate to update",
		);
	});

	it("visits a dependency shared by the element and the visual before it only once", () => {
		const img = element("img", "image", { characters: "Alice" });
		const video = element("vid", "video", {
			startFrame: "previous",
			characters: "Alice",
		});

		const ids = flattenGraph([resolveOn(video, [img, video])]).map(
			(node) => node.id,
		);
		expect(ids).toEqual(["asset_avatar:Alice", "img", "vid"]);
	});

	it("leaves a character's portrait fresh when their voice changes", () => {
		const queue = new GenerationQueue();
		const img = element("img", "image", { characters: "Alice" });
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

	describe("the project state a node reads", () => {
		const reframe = () =>
			store.getState().updateVideoSettings({ aspectRatio: "9:16" });

		it("stales a result when the aspect ratio it read changes", () => {
			const queue = new GenerationQueue();
			const img = element("img", "image");
			generateAll(queue, resolve(img));
			expect(isNodeStale(resolve(img), queue)).toBe(false);

			reframe();

			expect(staleReason(resolve(img), queue)).toBe(
				"The aspect ratio changed — regenerate to update",
			);
		});

		it("leaves a node that reads nothing alone when it changes", () => {
			const queue = new GenerationQueue();
			const sound = make("sound", "rain", {}, "sound");
			generateAll(queue, resolve(sound));

			reframe();

			expect(resolve(sound).inputs.reads).toEqual({});
			expect(isNodeStale(resolve(sound), queue)).toBe(false);
		});
	});

	it("marks a video stale when its start frame is replaced by an upload", () => {
		const img = element("img", "image");
		const el = element("vid-1", "video", { startFrame: "previous" });
		const video = resolveOn(el, [img, el]);
		const queue = new GenerationQueue();
		generateAll(queue, video);
		expect(isNodeStale(video, queue)).toBe(false);

		commit(queue, resolveOn(img, [img, el]), "uploaded.png");
		expect(isNodeStale(video, queue)).toBe(true);
	});

	it("marks a video stale when the visual before it changes", () => {
		const queue = new GenerationQueue();
		const img = element("img", "image");
		const other = element("other", "image");
		const el = element("vid-1", "video", { startFrame: "previous" });
		generateAll(queue, resolveOn(el, [img, el]));

		expect(isNodeStale(resolveOn(el, [img, other, el]), queue)).toBe(true);
	});

	it("regenerates a generated image when the art style is edited", () => {
		const queue = new GenerationQueue();
		const img = element("img", "image");
		generateAll(queue, resolve(img));
		expect(needsGeneration(resolve(img), queue)).toBe(false);

		assets = [make("asset_style", "watercolor"), ...assets.slice(1)];

		expect(needsGeneration(resolve(img), queue)).toBe(true);
		expect(staleReason(resolve(img), queue)).toBe(
			"The art style changed — regenerate to update",
		);
	});

	describe("speech and the voice it is spoken in", () => {
		const line = element("line", "narration");
		const voice = (attrs: Record<string, string>) => {
			assets = [make("asset_voice", "", { name: NARRATOR, ...attrs })];
		};

		it("reads the voice its speaker chose, depending on nothing", () => {
			voice({ voiceId: "v-1" });
			const node = resolve(line);

			expect(edgesOf(node)).toEqual({});
			expect(
				JSON.parse(node.inputs.reads["Narrator's voice"] ?? "{}"),
			).toMatchObject({ voiceId: "v-1" });
		});

		it("stays current while only the search filters change, and stales when another voice is chosen", () => {
			const queue = new GenerationQueue();
			voice({ voiceId: "v-1", gender: "feminine" });
			generateAll(queue, resolve(line));
			voice({ voiceId: "v-1", gender: "masculine", language: "fr" });
			expect(isNodeStale(resolve(line), queue)).toBe(false);

			voice({ voiceId: "v-2", gender: "masculine" });

			expect(staleReason(resolve(line), queue)).toBe(
				"Narrator's voice changed — regenerate to update",
			);
		});
	});
});
