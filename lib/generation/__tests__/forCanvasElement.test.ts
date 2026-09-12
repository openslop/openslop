import { beforeEach, describe, expect, it } from "vitest";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { DEFAULT_CONNECTOR_REGISTRY } from "@/lib/connectors/registry";
import { createProjectStore, type ProjectStore } from "@/lib/project/store";
import { splitAttributes } from "@/lib/video/elementAttributes";
import {
	flattenGraph,
	forElement,
	isNodeStale,
	needsGeneration,
	type GenerationNode,
} from "../graph";
import { GenerationQueue } from "../queue";
import { nodeBuilder } from "../resolveGraph";

const element = (
	id: string,
	type: CanvasContentElement["type"],
	attrs: Record<string, string> = {},
): CanvasContentElement => ({
	id,
	type,
	...splitAttributes(attrs),
	children: [{ id: `${id}-t`, type, text: "a sunset" }],
});

let store: ProjectStore;
let queue: GenerationQueue;

const builder = (canvas: CanvasContentElement[]) =>
	nodeBuilder(DEFAULT_CONNECTOR_REGISTRY, store.getState(), (id) =>
		canvas.find((el) => el.id === id),
	);

beforeEach(() => {
	store = createProjectStore();
	queue = new GenerationQueue();
});

describe("a clip that opens on another visual", () => {
	const image = element("img", "image");
	const clip = element("clip", "clip", { startFrame: "img" });

	it("depends on it, so it is built and ordered before the clip", () => {
		const node = builder([image, clip])(forElement(clip));
		const ids = flattenGraph([node]).map((n) => n.id);
		expect(ids.indexOf("img")).toBeLessThan(ids.indexOf("clip"));
		expect(node.dependsOn.find((dep) => dep.id === "img")?.job).not.toBeNull();
	});

	it("goes stale when the source regenerates", () => {
		const build = builder([image, clip]);
		const source = build(forElement(image));
		const node = build(forElement(clip));
		queue.commitResult(source, {
			imageUrl: "https://img/1.png",
			durationSec: 0,
		});
		queue.commitResult(node, { videoUrl: "https://vid/1.mp4", durationSec: 5 });
		expect(isNodeStale(node, queue)).toBe(false);

		queue.commitResult(source, {
			imageUrl: "https://img/2.png",
			durationSec: 0,
		});
		expect(isNodeStale(node, queue)).toBe(true);
	});

	it("keeps reading a deleted source's result as it was left", () => {
		const withSource = builder([image, clip]);
		queue.commitResult(withSource(forElement(image)), {
			imageUrl: "https://img/1.png",
			durationSec: 0,
		});
		queue.commitResult(withSource(forElement(clip)), {
			videoUrl: "https://vid/1.mp4",
			durationSec: 5,
		});

		const node = builder([clip])(forElement(clip));
		const orphan = node.dependsOn.find((dep) => dep.id === "img");
		expect(orphan?.job).toBeNull();
		expect(needsGeneration(orphan as GenerationNode, queue)).toBe(false);
		// Nothing changed from the clip's point of view: the picture it opened on is still there.
		expect(isNodeStale(node, queue)).toBe(false);
		expect(queue.getElementSnapshot("img").result?.imageUrl).toBe(
			"https://img/1.png",
		);
	});

	it("lets two clips that open on each other read what the other left", () => {
		const a = element("a", "clip", { startFrame: "b" });
		const b = element("b", "clip", { startFrame: "a" });
		const node = builder([a, b])(forElement(a));
		const back = node.dependsOn[0]?.dependsOn.find((dep) => dep.id === "a");
		expect(back?.job).toBeNull();
	});
});
