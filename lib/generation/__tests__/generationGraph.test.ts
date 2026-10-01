import { beforeEach, describe, expect, it } from "vitest";
import type { Descendant } from "slate";
import { splitAttributes } from "@/lib/canvas/elementAttributes";
import { getContentElements } from "@/lib/canvas/scenes";
import {
	SCENE_TYPE,
	type CanvasContentElement,
	type SceneElement,
} from "@/lib/canvas/types";
import {
	DEFAULT_CONNECTOR_REGISTRY,
	type ConnectorRegistry,
} from "@/lib/connectors/registry";
import { createProjectStore, type ProjectStore } from "@/lib/project/store";
import { dependency } from "../dependency";
import { forElement, sourceNode, type BuildContext } from "../graph";
import { GenerationGraph } from "../generationGraph";
import { forArtStyle } from "../sourceNodes";

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

let store: ProjectStore;
let document: Descendant[];
let registry: ConnectorRegistry;
let graph: GenerationGraph;

const contextNow = (): BuildContext => ({
	store,
	state: store.getState(),
	canvas: getContentElements(document),
	registry,
});

const tone = dependency(
	"tone",
	"the tone",
	({ generationAttributes }) =>
		() =>
			sourceNode("project:tone", { tone: generationAttributes?.tone ?? "" }),
);
const TONED: ConnectorRegistry = {
	...DEFAULT_CONNECTOR_REGISTRY,
	image: { plugins: [{ name: "tone", dependencies: [tone] }] },
};

const twice = dependency("style", "the art style", () => forArtStyle);
const UNBUILDABLE: ConnectorRegistry = {
	...DEFAULT_CONNECTOR_REGISTRY,
	image: { plugins: [{ name: "twice", dependencies: [twice, twice] }] },
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

const read = (of: CanvasContentElement) => graph.resolve(forElement(of));

beforeEach(() => {
	store = createProjectStore();
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

		const reached = read(second).dependsOn.previousVisual?.node;

		expect(reached?.id).toBe("first");
		expect(
			read(third).dependsOn.previousVisual?.node.dependsOn.previousVisual?.node,
		).toBe(reached);
	});

	it("labels the edge to a dependency and shares the node it reaches", () => {
		const image = element("img", "image", "a sunset");
		const video = element("vid", "video", "a pan", linked);
		edit(image, video);

		const edge = read(video).dependsOn.previousVisual;
		expect(edge?.label).toBe("the previous visual");
		expect(edge?.node).toBe(read(image));
	});

	it("keeps a node that reads as it did a revision ago", () => {
		const image = element("img", "image", "a sunset");
		edit(image, element("nar", "narration", "hello"));
		const before = read(image);

		edit(image, element("nar", "narration", "hello there"));

		expect(read(image)).toBe(before);
	});

	it("keeps each of two nodes that read one source differently", () => {
		const warm = element("warm", "image", "a sunset", { tone: "warm" });
		const cold = element("cold", "image", "a glacier", { tone: "cold" });
		registry = TONED;
		edit(warm, cold, element("nar", "narration", "hello"));
		const before = [read(warm), read(cold)];

		edit(warm, cold, element("nar", "narration", "hello there"));

		expect([read(warm), read(cold)]).toEqual(before);
		expect(read(warm)).toBe(before[0]);
		expect(read(cold)).toBe(before[1]);
		expect(read(cold).dependsOn.tone?.node.inputs.attributes.tone).toBe("cold");
	});

	it("replaces an edited node and every node that depends on it", () => {
		const second = element("second", "video", "a zoom", linked);
		const narration = element("nar", "narration", "hello");
		edit(element("first", "video", "a pan", linked), second, narration);
		const dependent = read(second);
		const bystander = read(narration);

		edit(element("first", "video", "a slow pan", linked), second, narration);

		expect(read(second)).not.toBe(dependent);
		expect(read(second).dependsOn.previousVisual?.node.inputs.prompt).toBe(
			"a slow pan",
		);
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
		expect(read(video).dependsOn.previousVisual?.node.id).toBe("img");
	});

	it("reads the project again when its state changes, keeping what reads the same", () => {
		const image = element("img", "image", "a sunset");
		const narration = element("nar", "narration", "hi");
		edit(image, narration);
		const styled = read(image);
		const spoken = read(narration);

		store.getState().updateMetadata({ style: "noir" });
		graph = new GenerationGraph(contextNow(), graph);

		expect(read(image)).not.toBe(styled);
		expect(read(image).dependsOn.artStyle?.node.inputs.attributes.style).toBe(
			"noir",
		);
		expect(read(narration)).toBe(spoken);
	});

	it("throws the same for every reader of a node that cannot be built", () => {
		const image = element("img", "image", "a sunset");
		registry = UNBUILDABLE;
		edit(image);
		const failure = 'Two dependencies of "img" share the key "style"';

		expect(() => read(image)).toThrow(failure);
		expect(() => read(image)).toThrow(failure);
	});
});
