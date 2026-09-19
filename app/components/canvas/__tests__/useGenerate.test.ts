import { beforeEach, describe, expect, it, vi } from "vitest";
import { splitAttributes } from "@/lib/canvas/elementAttributes";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { DEFAULT_CONNECTOR_REGISTRY } from "@/lib/connectors/registry";
import {
	forElement,
	needsGeneration,
	type GenerationNode,
} from "@/lib/generation/graph";
import { GenerationQueue } from "@/lib/generation/queue";
import { nodeBuilder } from "@/lib/generation/resolveGraph";
import { createProjectStore } from "@/lib/project/store";

// Memos hold across renders, as React's do: the bug is a graph kept from an
// earlier render. Each render reads its slots back in call order.
let slots: unknown[] = [];
let slot = 0;
const render = <T>(hook: () => T): T => {
	slot = 0;
	return hook();
};

vi.mock("react", () => ({
	useCallback: <T>(fn: T) => fn,
	useMemo: <T>(fn: () => T) => {
		const index = slot++;
		if (!(index in slots)) slots[index] = fn();
		return slots[index] as T;
	},
}));

vi.mock("slate-react", () => ({
	useSlateStatic: () => ({}),
	useSlateSelector: <T>(selector: () => T) => selector(),
}));

let queue: GenerationQueue;
vi.mock("@/lib/generation/GenerationQueueProvider", () => ({
	useGenerationQueue: () => queue,
	useQueueSelector: <T>(selector: (q: GenerationQueue) => T) => selector(queue),
}));

const store = createProjectStore();
let canvas: CanvasContentElement[] = [];
// Like the real hook, the builder keeps its identity while text inside an
// element changes, and reads the canvas when it builds.
const context = () => ({ state: store.getState(), canvas });
const builder = nodeBuilder(DEFAULT_CONNECTOR_REGISTRY, context);
vi.mock("@/lib/generation/useNodeBuilder", () => ({
	useNodeBuilder: () => ({ build: builder, context }),
}));

const { useGenerate } = await import("../hooks/useGenerate");
const { useGenerateScope } = await import("../hooks/useGenerateScope");

const element = (
	id: string,
	type: CanvasContentElement["type"],
	text: string,
	attrs: Record<string, string> = {},
): CanvasContentElement => ({
	id,
	type,
	...splitAttributes(attrs),
	children: [{ id: `${id}-t`, type, text }],
});

const image = element("img", "image", "a sunset");
const video = element("vid", "video", "Shot 1: slow pan", {
	startFrame: "previous",
});
const edited = element("img", "image", "a sunrise");

/** The image as it was regenerated from its own card: current, not stale. */
function regenerateImageFromItsCard() {
	canvas = [edited, video];
	queue.commitResult(builder(forElement(edited)), {
		imageUrl: "https://img/sunrise.png",
		durationSec: 0,
	});
}

const queuedImage = (spy: ReturnType<typeof vi.spyOn>) => {
	const roots = spy.mock.calls[0]?.[0] as GenerationNode[];
	return roots[0]?.dependsOn.find((dep) => dep.id === "img");
};

let enqueue: ReturnType<typeof vi.spyOn>;

const useVideoGeneration = () => useGenerate(video);
const useVideoScope = () => useGenerateScope(() => [video], "scene");

beforeEach(() => {
	slots = [];
	queue = new GenerationQueue();
	enqueue = vi.spyOn(queue, "enqueueGraph").mockImplementation(() => {});
	canvas = [image, video];
});

describe("generating after the element it depends on changed", () => {
	it("reads that element as it is now, so a current one is not queued again", () => {
		render(useVideoGeneration);
		regenerateImageFromItsCard();

		render(useVideoGeneration).generate();

		const dependency = queuedImage(enqueue);
		expect(dependency?.inputs.prompt).toBe("a sunrise");
		expect(dependency && needsGeneration(dependency, queue)).toBe(false);
	});

	it("does the same when a whole scope is generated", () => {
		render(useVideoScope);
		regenerateImageFromItsCard();

		render(useVideoScope).run();

		const dependency = queuedImage(enqueue);
		expect(dependency?.inputs.prompt).toBe("a sunrise");
		expect(dependency && needsGeneration(dependency, queue)).toBe(false);
	});
});
