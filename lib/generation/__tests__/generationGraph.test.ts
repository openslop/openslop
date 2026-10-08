import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Descendant } from "slate";
import { findAsset, getCanvasElements, NARRATOR } from "@/lib/canvas/assets";
import { createCanvasElement } from "@/lib/canvas/createCanvasElement";
import { splitAttributes } from "@/lib/canvas/elementAttributes";
import {
	SCENE_TYPE,
	type AssetElement,
	type ContentElement,
	type Scene,
} from "@/lib/canvas/types";
import {
	DEFAULT_CONNECTOR_REGISTRY,
	type ConnectorRegistry,
} from "@/lib/connectors/registry";
import type { AssetWrite, ConnectorPlugin } from "@/lib/connectors/types";
import { createProjectStore } from "@/lib/project/store";
import type { BuildContext } from "../graph";
import {
	buildNode,
	GenerationGraph,
	pluginDependencies,
	pluginReads,
	prepareNode,
} from "../generationGraph";
import { depend, read } from "../declare";
import { EMPTY_CONTEXT } from "./_context";
import { GenerationQueue } from "../queue";
import { isNodeStale } from "../staleness";

const element = (
	id: string,
	type: ContentElement["type"],
	text: string,
	attributes: Record<string, string> = {},
): ContentElement => ({
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
	canvas: getCanvasElements([...assets, ...document]),
	registry,
	setAsset: () => {},
});

const redsAvatar = depend("Red's avatar", (_, { canvas }) =>
	findAsset(canvas, "asset_avatar", "Red"),
);
const UNBUILDABLE: ConnectorRegistry = {
	...DEFAULT_CONNECTOR_REGISTRY,
	image: {
		plugins: [
			{ name: "first", dependencies: [redsAvatar] },
			{ name: "second", dependencies: [redsAvatar] },
		],
	},
};

const edit = (...elements: ContentElement[]) => {
	const scene: Scene = {
		id: "scene-1",
		type: SCENE_TYPE,
		children: elements,
	};
	document = [scene];
	graph = new GenerationGraph(contextNow(), graph);
};

const nodeOf = (of: ContentElement) => graph.resolve(of);

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

		const node = nodeOf(image);
		nodeOf(video);

		expect(nodeOf(image)).toBe(node);
	});

	it("shares a node between every dependent that reaches it", () => {
		const first = element("first", "video", "a pan", linked);
		const second = element("second", "video", "a zoom", linked);
		const third = element("third", "video", "a tilt", linked);
		edit(first, second, third);

		const reached = nodeOf(second).dependsOn[PREVIOUS];

		expect(reached?.id).toBe("first");
		expect(nodeOf(third).dependsOn[PREVIOUS]?.dependsOn[PREVIOUS]).toBe(
			reached,
		);
	});

	it("labels the edge to a dependency and shares the node it reaches", () => {
		const image = element("img", "image", "a sunset");
		const video = element("vid", "video", "a pan", linked);
		edit(image, video);

		expect(nodeOf(video).dependsOn[PREVIOUS]).toBe(nodeOf(image));
	});

	it("keeps a node that reads as it did a revision ago", () => {
		const image = element("img", "image", "a sunset");
		edit(image, element("nar", "narration", "hello"));
		const before = nodeOf(image);

		edit(image, element("nar", "narration", "hello there"));

		expect(nodeOf(image)).toBe(before);
	});

	it("replaces an edited node and every node that depends on it", () => {
		const second = element("second", "video", "a zoom", linked);
		const narration = element("nar", "narration", "hello");
		edit(element("first", "video", "a pan", linked), second, narration);
		const dependent = nodeOf(second);
		const bystander = nodeOf(narration);

		edit(element("first", "video", "a slow pan", linked), second, narration);

		expect(nodeOf(second)).not.toBe(dependent);
		expect(nodeOf(second).dependsOn[PREVIOUS]?.inputs.prompt).toBe(
			"a slow pan",
		);
		expect(nodeOf(narration)).toBe(bystander);
	});

	it("replaces a node whose dependency became another element", () => {
		const image = element("img", "image", "a sunset");
		const other = element("other", "image", "a sunrise");
		const video = element("vid", "video", "a pan", linked);
		edit(image, other, video);
		const before = nodeOf(video);

		edit(other, image, video);

		expect(nodeOf(video)).not.toBe(before);
		expect(nodeOf(video).dependsOn[PREVIOUS]?.id).toBe("img");
	});

	it("reads the assets again when they change, keeping what reads the same", () => {
		const image = element("img", "image", "a sunset");
		const narration = element("nar", "narration", "hi");
		edit(image, narration);
		const styled = nodeOf(image);
		const spoken = nodeOf(narration);

		assets = [createCanvasElement("asset_style", { text: "noir" })];
		graph = new GenerationGraph(contextNow(), graph);

		expect(nodeOf(image)).not.toBe(styled);
		expect(nodeOf(image).inputs.reads["the art style"]).toBe("noir");
		expect(nodeOf(narration)).toBe(spoken);
	});

	it("throws the same for every reader of a node that cannot be built", () => {
		const image = element("img", "image", "a sunset");
		registry = UNBUILDABLE;
		assets = [createCanvasElement("asset_avatar", { attrs: { name: "Red" } })];
		edit(image);
		const failure = `Two dependencies of "img" share the label "Red's avatar"`;

		expect(() => nodeOf(image)).toThrow(failure);
		expect(() => nodeOf(image)).toThrow(failure);
	});
});

describe("prepareNode", () => {
	const voice = (voiceId: string): AssetWrite => ({
		type: "asset_voice",
		name: NARRATOR,
		attrs: { voiceId },
	});
	const settling = (...writes: AssetWrite[]): ConnectorPlugin => ({
		name: "settle",
		prepare: async () => writes,
	});
	const readsVoice: ConnectorPlugin = {
		name: "voice",
		reads: [
			read(
				"voice",
				(_, { canvas }) =>
					findAsset(canvas, "asset_voice", NARRATOR)?.generationAttributes
						?.voiceId ?? "",
			),
		],
	};
	const image = element("img", "image", "a sunset");
	const setAsset = vi.fn(({ type, name, attrs }: AssetWrite) => {
		assets = [
			...assets,
			createCanvasElement(type, { attrs: name ? { name, ...attrs } : attrs }),
		];
	});
	const writing = (): BuildContext => ({ ...contextNow(), setAsset });
	const prepare = (...plugins: ConnectorPlugin[]) => {
		registry = { ...DEFAULT_CONNECTOR_REGISTRY, image: { plugins } };
		edit(image);
		return prepareNode(nodeOf(image), writing, new AbortController().signal);
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
		const prepared = prepareNode(nodeOf(image), writing, controller.signal);
		controller.abort();

		await expect(prepared).rejects.toThrow();
		expect(setAsset).not.toHaveBeenCalled();
	});

	it("fails loudly when the element left the canvas", async () => {
		registry = { ...DEFAULT_CONNECTOR_REGISTRY, image: { plugins: [] } };
		edit(image);
		const node = nodeOf(image);
		edit();

		await expect(
			prepareNode(node, writing, new AbortController().signal),
		).rejects.toThrow('Element "img" left the canvas');
		expect(setAsset).not.toHaveBeenCalled();
	});
});

describe("what the plugins declare", () => {
	const image = createCanvasElement("image", { id: "img" });
	const avatar = createCanvasElement("asset_avatar", {
		attrs: { name: "Red" },
	});
	const declaring: ConnectorPlugin = {
		name: "declaring",
		reads: [
			() => ({
				"the art style": "noir",
				"the references": undefined,
				"the language": "",
			}),
		],
		dependencies: [
			() => ({ "Red's avatar": avatar, "Bob's avatar": undefined }),
		],
	};

	it("records only the values a plugin found, leaving out empty ones", () => {
		expect(pluginReads([declaring], image, EMPTY_CONTEXT)).toEqual({
			"the art style": "noir",
		});
	});

	it("depends only on the elements a plugin found", () => {
		expect(pluginDependencies([declaring], image, EMPTY_CONTEXT)).toEqual([
			["Red's avatar", avatar],
		]);
	});
});
