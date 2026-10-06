import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Descendant } from "slate";
import { findAsset, getScriptElements, NARRATOR } from "@/lib/canvas/assets";
import { createCanvasNode } from "@/lib/canvas/createCanvasNode";
import { splitAttributes } from "@/lib/canvas/elementAttributes";
import {
	SCENE_TYPE,
	type AssetElement,
	type CanvasContentElement,
	type SceneElement,
} from "@/lib/canvas/types";
import {
	DEFAULT_CONNECTOR_REGISTRY,
	type ConnectorRegistry,
} from "@/lib/connectors/registry";
import type { AssetWrite, ConnectorPlugin } from "@/lib/connectors/types";
import { createProjectStore } from "@/lib/project/store";
import { dependency } from "../dependency";
import type { BuildContext } from "../graph";
import { buildNode, GenerationGraph, prepareNode } from "../generationGraph";
import { GenerationQueue } from "../queue";
import { isNodeStale } from "../staleness";

const element = (
	id: string,
	type: CanvasContentElement["type"],
	text: string,
	attributes: Record<string, string> = {},
): CanvasContentElement => ({
	id,
	type,
	...splitAttributes(attributes),
	children: [{ id: `${id}-t`, type, text }],
});

const linked = { continuity: "true" };
const PREVIOUS = "the previous visual";

let assets: AssetElement[];
let document: Descendant[];
let registry: ConnectorRegistry;
let graph: GenerationGraph;

const contextNow = (): BuildContext => ({
	state: createProjectStore().getState(),
	canvas: getScriptElements([...assets, ...document]),
	registry,
	setAsset: () => {},
});

const { dependencies: redsAvatar } = dependency(
	"Red's avatar",
	(_, { canvas }) => findAsset(canvas, "asset_character", "Red"),
);
const UNBUILDABLE: ConnectorRegistry = {
	...DEFAULT_CONNECTOR_REGISTRY,
	image: {
		plugins: [
			{ name: "first", dependencies: redsAvatar },
			{ name: "second", dependencies: redsAvatar },
		],
	},
};

const edit = (...elements: CanvasContentElement[]) => {
	const scene: SceneElement = {
		id: "scene-1",
		type: SCENE_TYPE,
		children: elements,
	};
	document = [scene];
	graph = new GenerationGraph(contextNow(), graph);
};

const read = (of: CanvasContentElement) => graph.resolve(of);

beforeEach(() => {
	assets = [];
	document = [];
	registry = DEFAULT_CONNECTOR_REGISTRY;
	graph = new GenerationGraph(contextNow());
});

describe("GenerationGraph", () => {
	it("builds a node once, however many read it", () => {
		const image = element("img", "image", "a sunset");
		const video = element("vid", "video", "a pan");
		edit(image, video);

		const node = read(image);
		read(video);

		expect(read(image)).toBe(node);
	});

	it("shares a node between every dependent that reaches it", () => {
		const first = element("first", "video", "a pan", linked);
		const second = element("second", "video", "a zoom", linked);
		const third = element("third", "video", "a tilt", linked);
		edit(first, second, third);

		const reached = read(second).dependsOn[PREVIOUS];

		expect(reached?.id).toBe("first");
		expect(read(third).dependsOn[PREVIOUS]?.dependsOn[PREVIOUS]).toBe(reached);
	});

	it("labels the edge to a dependency and shares the node it reaches", () => {
		const image = element("img", "image", "a sunset");
		const video = element("vid", "video", "a pan", linked);
		edit(image, video);

		expect(read(video).dependsOn[PREVIOUS]).toBe(read(image));
	});

	it("keeps a node that reads as it did a revision ago", () => {
		const image = element("img", "image", "a sunset");
		edit(image, element("nar", "narration", "hello"));
		const before = read(image);

		edit(image, element("nar", "narration", "hello there"));

		expect(read(image)).toBe(before);
	});

	it("replaces an edited node and every node that depends on it", () => {
		const second = element("second", "video", "a zoom", linked);
		const narration = element("nar", "narration", "hello");
		edit(element("first", "video", "a pan", linked), second, narration);
		const dependent = read(second);
		const bystander = read(narration);

		edit(element("first", "video", "a slow pan", linked), second, narration);

		expect(read(second)).not.toBe(dependent);
		expect(read(second).dependsOn[PREVIOUS]?.inputs.prompt).toBe("a slow pan");
		expect(read(narration)).toBe(bystander);
	});

	it("replaces a node whose dependency became another element", () => {
		const image = element("img", "image", "a sunset");
		const other = element("other", "image", "a sunrise");
		const video = element("vid", "video", "a pan", linked);
		edit(image, other, video);
		const before = read(video);

		edit(other, image, video);

		expect(read(video)).not.toBe(before);
		expect(read(video).dependsOn[PREVIOUS]?.id).toBe("img");
	});

	it("reads the assets again when they change, keeping what reads the same", () => {
		const image = element("img", "image", "a sunset");
		const narration = element("nar", "narration", "hi");
		edit(image, narration);
		const styled = read(image);
		const spoken = read(narration);

		assets = [createCanvasNode("asset_style", { text: "noir" })];
		graph = new GenerationGraph(contextNow(), graph);

		expect(read(image)).not.toBe(styled);
		expect(read(image).inputs.reads["the art style"]).toBe("noir");
		expect(read(narration)).toBe(spoken);
	});

	it("throws the same for every reader of a node that cannot be built", () => {
		const image = element("img", "image", "a sunset");
		registry = UNBUILDABLE;
		assets = [createCanvasNode("asset_character", { attrs: { name: "Red" } })];
		edit(image);
		const failure = `Two dependencies of "img" share the label "Red's avatar"`;

		expect(() => read(image)).toThrow(failure);
		expect(() => read(image)).toThrow(failure);
	});
});

describe("prepareNode", () => {
	const voice = (voiceId: string): AssetWrite => ({
		type: "asset_character",
		name: NARRATOR,
		attrs: { voiceId },
	});
	const settling = (...writes: AssetWrite[]): ConnectorPlugin => ({
		name: "settle",
		prepare: async () => writes,
	});
	const readsVoice: ConnectorPlugin = {
		name: "voice",
		reads: (_, { canvas }) => ({
			voice:
				findAsset(canvas, "asset_character", NARRATOR)?.generationAttributes
					?.voiceId ?? "",
		}),
	};
	const image = element("img", "image", "a sunset");
	const setAsset = vi.fn(({ type, name, attrs }: AssetWrite) => {
		assets = [
			...assets,
			createCanvasNode(type, { attrs: name ? { name, ...attrs } : attrs }),
		];
	});
	const writing = (): BuildContext => ({ ...contextNow(), setAsset });
	const prepare = (...plugins: ConnectorPlugin[]) => {
		registry = { ...DEFAULT_CONNECTOR_REGISTRY, image: { plugins } };
		edit(image);
		return prepareNode(read(image), writing, new AbortController().signal);
	};

	beforeEach(() => {
		setAsset.mockClear();
	});

	it("writes what every plugin settles through setAsset, in plugin order", async () => {
		await prepare(
			settling(voice("v-1")),
			{ name: "none" },
			settling(voice("v-2")),
		);

		expect(setAsset.mock.calls.map(([write]) => write)).toEqual([
			voice("v-1"),
			voice("v-2"),
		]);
	});

	it("builds the node again from the canvas as written, so its result is current once committed", async () => {
		const prepared = await prepare(settling(voice("v-found")), readsVoice);
		const queue = new GenerationQueue();
		queue.commitResult(prepared, { imageUrl: "img.png", durationSec: 0 });

		expect(prepared.inputs.reads.voice).toBe("v-found");
		expect(isNodeStale(buildNode(image, contextNow()), queue)).toBe(false);
	});

	it("writes nothing once the job is cancelled", async () => {
		registry = {
			...DEFAULT_CONNECTOR_REGISTRY,
			image: { plugins: [settling(voice("v-1"))] },
		};
		edit(image);
		const controller = new AbortController();
		const prepared = prepareNode(read(image), writing, controller.signal);
		controller.abort();

		await expect(prepared).rejects.toThrow();
		expect(setAsset).not.toHaveBeenCalled();
	});

	it("fails loudly when the element left the canvas", async () => {
		registry = { ...DEFAULT_CONNECTOR_REGISTRY, image: { plugins: [] } };
		edit(image);
		const node = read(image);
		edit();

		await expect(
			prepareNode(node, writing, new AbortController().signal),
		).rejects.toThrow('Element "img" left the canvas');
		expect(setAsset).not.toHaveBeenCalled();
	});
});
