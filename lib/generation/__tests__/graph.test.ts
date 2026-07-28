import { MetadataSchema } from "@/lib/project/types";
import { describe, expect, it } from "vitest";
import type { ConnectorConfig } from "@/lib/connectors/types";
import {
	flattenGraph,
	isNodeStale,
	needsGeneration,
	nodeInputs,
	sourceNode,
	type GenerationNode,
} from "../graph";
import { GenerationQueue, type GenerationJob } from "../queue";

const EMPTY_STATE = {
	metadata: MetadataSchema.parse({}),
	referenceImages: [],
};

const config: ConnectorConfig = {
	defaultModel: "m",
	models: ["m"],
	isDefault: true,
};

function node(
	id: string,
	dependsOn: GenerationNode[] = [],
	attributes: Record<string, string> = {},
): GenerationNode {
	const job: GenerationJob = {
		elementId: id,
		connectorType: "image",
		provider: "openslop",
		config,
		projectId: "p",
		state: EMPTY_STATE,
		element: {
			id,
			type: "image",
			children: [{ id: `${id}-t`, type: "image", text: id }],
		},
	};
	return {
		id,
		inputs: { prompt: id, attributes },
		dependsOn,
		buildJob: () => job,
	};
}

const commit = (queue: GenerationQueue, target: GenerationNode, url: string) =>
	queue.commitResult(target, { imageUrl: url, durationSec: 0 });

describe("nodeInputs", () => {
	it("records what each dependency resolved to", () => {
		const queue = new GenerationQueue({ batchSize: 1 });
		const avatar = node("avatar");
		const image = node("image", [
			avatar,
			sourceNode("project:refs", { urls: "a.png" }),
		]);
		commit(queue, avatar, "avatar.png");

		expect(nodeInputs(image, queue).dependencies).toEqual({
			avatar: "avatar.png",
			"project:refs": JSON.stringify({
				prompt: "",
				attributes: { urls: "a.png" },
			}),
		});
	});
});

describe("isNodeStale", () => {
	it("is false for a node with no result yet", () => {
		const queue = new GenerationQueue({ batchSize: 1 });
		expect(isNodeStale(node("a"), queue)).toBe(false);
	});

	it("is false right after a result is committed", () => {
		const queue = new GenerationQueue({ batchSize: 1 });
		const avatar = node("avatar");
		const image = node("image", [avatar]);
		commit(queue, avatar, "avatar.png");
		commit(queue, image, "image.png");

		expect(isNodeStale(image, queue)).toBe(false);
	});

	it("is true once a dependency resolves to a different output", () => {
		const queue = new GenerationQueue({ batchSize: 1 });
		const avatar = node("avatar");
		const image = node("image", [avatar]);
		commit(queue, avatar, "avatar.png");
		commit(queue, image, "image.png");

		commit(queue, avatar, "avatar-v2.png");
		expect(isNodeStale(image, queue)).toBe(true);
	});

	it("is true when a source node's inputs change, without regenerating anything", () => {
		const queue = new GenerationQueue({ batchSize: 1 });
		const withRefs = (urls: string) =>
			node("image", [sourceNode("project:refs", { urls })]);
		commit(queue, withRefs("a.png"), "image.png");

		expect(isNodeStale(withRefs("a.png"), queue)).toBe(false);
		expect(isNodeStale(withRefs("a.png,b.png"), queue)).toBe(true);
	});

	it("propagates through a dependency that itself needs regenerating", () => {
		const queue = new GenerationQueue({ batchSize: 1 });
		const refs = (urls: string) => sourceNode("project:refs", { urls });
		const avatar = (urls: string) => node("avatar", [refs(urls)]);
		const image = (urls: string) => node("image", [avatar(urls)]);

		commit(queue, avatar("a.png"), "avatar.png");
		commit(queue, image("a.png"), "image.png");
		expect(isNodeStale(image("a.png"), queue)).toBe(false);

		// Changing refs makes the avatar stale, which makes the image stale too.
		expect(needsGeneration(avatar("b.png"), queue)).toBe(true);
		expect(isNodeStale(image("b.png"), queue)).toBe(true);
	});

	// commitResult is the "the queue did not generate this" path: uploads and
	// template seeds. It pins, so project state drifting cannot overwrite them.
	it("never marks a committed upload stale, however far its inputs drift", () => {
		const queue = new GenerationQueue({ batchSize: 1 });
		const uploaded = (style: string) =>
			node("el", [sourceNode("project:artStyle", { style })]);
		queue.commitResult(
			uploaded("noir"),
			{ imageUrl: "uploaded.png", durationSec: 0 },
			{ pinned: true },
		);

		expect(isNodeStale(uploaded("watercolor"), queue)).toBe(false);
		expect(needsGeneration(uploaded("watercolor"), queue)).toBe(false);
	});

	it("still generates a pinned node that has no result yet", () => {
		const queue = new GenerationQueue({ batchSize: 1 });
		queue.discard("el");
		expect(needsGeneration(node("el"), queue)).toBe(true);
	});

	it("never marks a source node stale", () => {
		const queue = new GenerationQueue({ batchSize: 1 });
		expect(isNodeStale(sourceNode("project:refs", { urls: "a" }), queue)).toBe(
			false,
		);
	});
});

describe("flattenGraph", () => {
	it("orders dependencies before dependents and visits shared nodes once", () => {
		const shared = node("shared");
		const left = node("left", [shared]);
		const right = node("right", [shared]);

		expect(flattenGraph([left, right]).map((n) => n.id)).toEqual([
			"shared",
			"left",
			"right",
		]);
	});
});
