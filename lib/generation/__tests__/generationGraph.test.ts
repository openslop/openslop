import { beforeEach, describe, expect, it } from "vitest";
import type { Descendant } from "slate";
import { getCanvasElements } from "@/lib/canvas/assets";
import { element } from "@/lib/canvas/__tests__/_assets";
import { createCanvasElement } from "@/lib/canvas/createCanvasElement";
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
import type { ConnectorPlugin } from "@/lib/connectors/types";
import type { BuildContext } from "../graph";
import {
	generatedById,
	GenerationGraph,
	pluginRecords,
	rebuildNode,
} from "../generationGraph";
import { buildCtx, EMPTY_CONTEXT } from "./_context";

const linked = { continuity: "true" };
const PREVIOUS = "the previous visual";

let assets: AssetElement[];
let document: Descendant[];
let registry: ConnectorRegistry;
let graph: GenerationGraph;

const contextNow = (): BuildContext =>
	buildCtx(getCanvasElements([...assets, ...document]), { registry });

const UNBUILDABLE: ConnectorRegistry = {
	...DEFAULT_CONNECTOR_REGISTRY,
	image: {
		plugins: [
			{
				name: "itself",
				dependencies: [
					(self, { canvas }) => ({ self: generatedById(canvas, self.id) }),
				],
			},
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

		expect(reached).toBe(nodeOf(first));
		expect(nodeOf(third).dependsOn[PREVIOUS]?.dependsOn[PREVIOUS]).toBe(
			reached,
		);
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
		edit(image);
		const failure = `Cyclic generation dependency at "img"`;

		expect(() => nodeOf(image)).toThrow(failure);
		expect(() => nodeOf(image)).toThrow(failure);
	});
});

describe("rebuildNode", () => {
	const image = element("img", "image", "a sunset");

	beforeEach(() => {
		registry = { ...DEFAULT_CONNECTOR_REGISTRY, image: { plugins: [] } };
	});

	it("builds the node from the canvas as it is now", () => {
		edit(image);
		const queued = nodeOf(image);
		edit(element("img", "image", "a sunrise"));

		expect(rebuildNode(queued, contextNow()).inputs.prompt).toBe("a sunrise");
	});

	it("fails loudly when the element left the canvas", () => {
		edit(image);
		const queued = nodeOf(image);
		edit();

		expect(() => rebuildNode(queued, contextNow())).toThrow(
			'Element "img" left the canvas',
		);
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
		expect(pluginRecords([declaring], "reads", image, EMPTY_CONTEXT)).toEqual({
			"the art style": "noir",
		});
	});

	it("depends only on the elements a plugin found", () => {
		expect(
			pluginRecords([declaring], "dependencies", image, EMPTY_CONTEXT),
		).toEqual({
			"Red's avatar": avatar,
		});
	});

	it("refuses two plugins declaring the same label", () => {
		expect(() =>
			pluginRecords(
				[declaring, declaring],
				"dependencies",
				image,
				EMPTY_CONTEXT,
			),
		).toThrow(`Two plugins declare "Red's avatar"`);
	});
});
