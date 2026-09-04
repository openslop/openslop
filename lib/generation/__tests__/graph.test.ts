import { MetadataSchema } from "@/lib/project/types";
import { describe, expect, it } from "vitest";
import { DEFAULT_MODELS } from "@/lib/connectors/models";
import type { ConnectorConfig } from "@/lib/connectors/types";
import {
	derivedFrom,
	derivedNodeId,
	flattenGraph,
	isNodeStale,
	needsGeneration,
	nodeInputs,
	sourceNode,
	type GenerationJob,
	type GenerationNode,
} from "../graph";
import { GenerationQueue } from "../queue";

const EMPTY_STATE = {
	hydrated: true,
	metadata: MetadataSchema.parse({}),
	referenceImages: [],
};

const config: ConnectorConfig = {};

function node(
	id: string,
	dependsOn: GenerationNode[] = [],
	attributes: Record<string, string> = {},
): GenerationNode {
	const job: GenerationJob = {
		elementId: id,
		elementType: "image",
		connectorType: "image",
		model: DEFAULT_MODELS.image,
		config,
		state: EMPTY_STATE,
	};
	return {
		id,
		inputs: { prompt: id, attributes },
		dependsOn,
		job,
	};
}

const commit = (queue: GenerationQueue, target: GenerationNode, url: string) =>
	queue.commitResult(target, { imageUrl: url, durationSec: 0 });

describe("nodeInputs", () => {
	it("records what each dependency resolved to", () => {
		const queue = new GenerationQueue();
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
				dependencies: {},
			}),
		});
	});
});

describe("isNodeStale", () => {
	it("is false for a node with no result yet", () => {
		const queue = new GenerationQueue();
		expect(isNodeStale(node("a"), queue)).toBe(false);
	});

	it("is false right after a result is committed", () => {
		const queue = new GenerationQueue();
		const avatar = node("avatar");
		const image = node("image", [avatar]);
		commit(queue, avatar, "avatar.png");
		commit(queue, image, "image.png");

		expect(isNodeStale(image, queue)).toBe(false);
	});

	it("is true once a dependency resolves to a different output", () => {
		const queue = new GenerationQueue();
		const avatar = node("avatar");
		const image = node("image", [avatar]);
		commit(queue, avatar, "avatar.png");
		commit(queue, image, "image.png");

		commit(queue, avatar, "avatar-v2.png");
		expect(isNodeStale(image, queue)).toBe(true);
	});

	it("is true when a source node's inputs change, without regenerating anything", () => {
		const queue = new GenerationQueue();
		const withRefs = (urls: string) =>
			node("image", [sourceNode("project:refs", { urls })]);
		commit(queue, withRefs("a.png"), "image.png");

		expect(isNodeStale(withRefs("a.png"), queue)).toBe(false);
		expect(isNodeStale(withRefs("a.png,b.png"), queue)).toBe(true);
	});

	it("propagates through a dependency that itself needs regenerating", () => {
		const queue = new GenerationQueue();
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
		const queue = new GenerationQueue();
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
		const queue = new GenerationQueue();
		queue.discard("el");
		expect(needsGeneration(node("el"), queue)).toBe(true);
	});

	it("never marks a source node stale", () => {
		const queue = new GenerationQueue();
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

describe("derivedFrom", () => {
	it("names the node a derived id was minted from", () => {
		expect(derivedFrom(derivedNodeId("still", "el-1"))).toBe("el-1");
		expect(derivedFrom(derivedNodeId("avatar", "Jane"))).toBe("Jane");
	});

	it("has no answer for an id the graph did not derive", () => {
		expect(derivedFrom("el-1")).toBeNull();
		expect(derivedFrom("project:artStyle")).toBeNull();
	});
});
