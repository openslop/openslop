import { getProjectStore } from "@/lib/project/store";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Descendant } from "slate";
import type { ConnectorRegistry } from "@/lib/connectors/registry";
import { GenerationQueue } from "@/lib/generation/queue";
import { forElement, type GenerationNode } from "@/lib/generation/graph";
import { nodeBuilder } from "@/lib/generation/resolveGraph";
import type { CanvasContentElement, SceneElement } from "@/lib/canvas/types";

const registry: ConnectorRegistry = {
	llm: {
		openslop: {
			defaultModel: "m",
			models: ["m"],
			isDefault: true,
		},
	},
	tts: {
		openslop: {
			defaultModel: "m",
			models: ["m"],
			isDefault: true,
		},
	},
	image: {
		openslop: {
			defaultModel: "m",
			models: ["m"],
			isDefault: true,
		},
	},
	animated_image: {
		openslop: {
			defaultModel: "m",
			models: ["m"],
			isDefault: true,
		},
	},
	video: {
		openslop: {
			defaultModel: "m",
			models: ["m"],
			isDefault: true,
		},
	},
	sfx: {
		openslop: {
			defaultModel: "m",
			models: ["m"],
			isDefault: true,
		},
	},
	music: {
		openslop: {
			defaultModel: "m",
			models: ["m"],
			isDefault: true,
		},
	},
};

vi.mock("react", () => ({
	useCallback: <T>(fn: T) => fn,
}));

let queue: GenerationQueue;

vi.mock("@/lib/generation/GenerationQueueProvider", () => ({
	useGenerationQueue: () => queue,
}));

// The hook under test is about which elements get queued, so bind a real
// resolver rather than standing up the config and project providers.
const resolve = () =>
	nodeBuilder(registry, getProjectStore("test-project").getState());

vi.mock("@/lib/generation/useNodeBuilder", () => ({
	useNodeBuilder: () => resolve(),
}));

function makeElement(
	id: string,
	type: CanvasContentElement["type"],
	text: string,
	attrs?: Record<string, string>,
): CanvasContentElement {
	return {
		id,
		type,
		customAttributes: { provider: "openslop", ...attrs },
		children: [{ id: `${id}-t`, type, text }],
	};
}

function wrapInScene(elements: CanvasContentElement[]): SceneElement {
	return { id: "scene-1", type: "scene", children: elements };
}

/** Commit a result for `element` as if it had just been generated. */
function commitCurrent(element: CanvasContentElement) {
	const node = nodeBuilder(
		registry,
		getProjectStore("test-project").getState(),
	)(forElement(element));
	queue.commitResult(node, {
		imageUrl: "https://example.com/asset.png",
		durationSec: 0,
	});
}

const { useGenerateAll } = await import("../hooks/useGenerateAll");

function useGenerateAllFor(elements: CanvasContentElement[]) {
	const children: Descendant[] = [wrapInScene(elements)];
	const editor = { children } as unknown as Parameters<
		typeof useGenerateAll
	>[0];
	useGenerateAll(editor).generateAll();
	return enqueuedIds();
}

const enqueuedIds = (): string[] =>
	(enqueueGraphSpy.mock.calls[0]?.[0] as GenerationNode[] | undefined)?.map(
		(node) => node.id,
	) ?? [];

let enqueueGraphSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
	vi.clearAllMocks();
	queue = new GenerationQueue();
	enqueueGraphSpy = vi
		.spyOn(queue, "enqueueGraph")
		.mockImplementation(() => {});
});

describe("useGenerateAll", () => {
	it("enqueues every element without a result", async () => {
		const ids = useGenerateAllFor([
			makeElement("a", "image", "sunset"),
			makeElement("b", "narration", "hello"),
		]);
		expect(ids).toEqual(["a", "b"]);
	});

	it("skips elements that already have a current result", async () => {
		const a = makeElement("a", "image", "sunset");
		commitCurrent(a);

		const ids = useGenerateAllFor([a, makeElement("b", "narration", "hello")]);
		expect(ids).toEqual(["b"]);
	});

	it("re-generates an element whose prompt drifted", async () => {
		commitCurrent(makeElement("a", "image", "old prompt"));

		const ids = useGenerateAllFor([
			makeElement("a", "image", "new prompt"),
			makeElement("b", "narration", "hello"),
		]);
		expect(ids).toEqual(["a", "b"]);
	});

	it("re-generates an element whose attributes drifted", async () => {
		commitCurrent(makeElement("a", "narration", "hello", { emotion: "calm" }));

		const ids = useGenerateAllFor([
			makeElement("a", "narration", "hello", { emotion: "happy" }),
			makeElement("b", "image", "sunset"),
		]);
		expect(ids).toEqual(["a", "b"]);
	});

	it("enqueues nothing when every element is current", async () => {
		const elements = [
			makeElement("a", "image", "sunset"),
			makeElement("b", "narration", "hello"),
		];
		elements.forEach(commitCurrent);

		expect(useGenerateAllFor(elements)).toEqual([]);
	});

	it("does not include an uploaded image, which has no prompt", async () => {
		const uploaded = makeElement("a", "image", "");
		commitCurrent(uploaded);

		const ids = useGenerateAllFor([
			uploaded,
			makeElement("b", "narration", "hello"),
		]);
		expect(ids).toEqual(["b"]);
	});

	it("skips elements with blank prompts", async () => {
		const ids = useGenerateAllFor([
			makeElement("a", "image", "sunset"),
			makeElement("b", "narration", "   "),
		]);
		expect(ids).toEqual(["a"]);
	});
});
