import { beforeEach, describe, expect, it } from "vitest";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { DEFAULT_CONNECTOR_REGISTRY } from "@/lib/connectors/registry";
import { createProjectStore, type ProjectStore } from "@/lib/project/store";
import { splitAttributes } from "@/lib/canvas/elementAttributes";
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
	nodeBuilder(DEFAULT_CONNECTOR_REGISTRY, store.getState(), () => canvas);

beforeEach(() => {
	store = createProjectStore();
	queue = new GenerationQueue();
});

describe("a video that opens on the visual before it", () => {
	const image = element("img", "image");
	const video = element("vid-1", "video", { startFrame: "previous" });

	it("depends on it, found by document order", () => {
		const node = builder([image, video])(forElement(video));
		expect(node.dependsOn.find((dep) => dep.id === "img")?.job).not.toBeNull();
	});

	it("goes stale when what comes before it changes", () => {
		const other = element("other", "image");
		const node = builder([image, video])(forElement(video));
		queue.commitResult(builder([image, video])(forElement(image)), {
			imageUrl: "https://img/1.png",
			durationSec: 0,
		});
		queue.commitResult(node, { videoUrl: "https://vid/1.mp4", durationSec: 5 });
		expect(isNodeStale(node, queue)).toBe(false);

		const moved = builder([image, other, video])(forElement(video));
		expect(isNodeStale(moved, queue)).toBe(true);
	});

	it("reads no source when nothing comes before it", () => {
		const node = builder([video, image])(forElement(video));
		expect(node.dependsOn.every((dep) => dep.job === null)).toBe(true);
	});
});

describe("a video that opens on another visual", () => {
	const image = element("img", "image");
	const video = element("vid-1", "video", { startFrame: "img" });

	it("depends on it, so it is built and ordered before the video", () => {
		const node = builder([image, video])(forElement(video));
		const ids = flattenGraph([node]).map((n) => n.id);
		expect(ids.indexOf("img")).toBeLessThan(ids.indexOf("vid-1"));
		expect(node.dependsOn.find((dep) => dep.id === "img")?.job).not.toBeNull();
	});

	it("goes stale when the source regenerates", () => {
		const build = builder([image, video]);
		const source = build(forElement(image));
		const node = build(forElement(video));
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
		const withSource = builder([image, video]);
		queue.commitResult(withSource(forElement(image)), {
			imageUrl: "https://img/1.png",
			durationSec: 0,
		});
		queue.commitResult(withSource(forElement(video)), {
			videoUrl: "https://vid/1.mp4",
			durationSec: 5,
		});

		const node = builder([video])(forElement(video));
		const orphan = node.dependsOn.find((dep) => dep.id === "img");
		expect(orphan?.job).toBeNull();
		expect(needsGeneration(orphan as GenerationNode, queue)).toBe(false);
		// Nothing changed from the video's point of view: the picture it opened on is still there.
		expect(isNodeStale(node, queue)).toBe(false);
		expect(queue.getElementSnapshot("img").result?.imageUrl).toBe(
			"https://img/1.png",
		);
	});

	it("lets two videos that open on each other read what the other left", () => {
		const a = element("a", "video", { startFrame: "b" });
		const b = element("b", "video", { startFrame: "a" });
		const node = builder([a, b])(forElement(a));
		const back = node.dependsOn[0]?.dependsOn.find((dep) => dep.id === "a");
		expect(back?.job).toBeNull();
	});
});
