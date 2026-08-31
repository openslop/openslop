import { MetadataSchema } from "@/lib/project/types";
import { describe, expect, it } from "vitest";
import type { ConnectorConfig } from "@/lib/connectors/types";
import {
	derivedNodeId,
	sourceNode,
	type GenerationJob,
	type GenerationNode,
} from "../graph";
import { GenerationQueue } from "../queue";
import { staleReason } from "../staleReason";

const EMPTY_STATE = {
	hydrated: true,
	metadata: MetadataSchema.parse({}),
	referenceImages: [],
};

const config: ConnectorConfig = {
	isDefault: true,
};

function node(
	id: string,
	{
		prompt = id,
		attributes = {},
		dependsOn = [],
		label,
	}: {
		prompt?: string;
		attributes?: Record<string, string>;
		dependsOn?: GenerationNode[];
		label?: string;
	} = {},
): GenerationNode {
	const job: GenerationJob = {
		elementId: id,
		elementType: "image",
		connectorType: "image",
		provider: "openslop",
		config,
		state: EMPTY_STATE,
	};
	return { id, inputs: { prompt, attributes }, dependsOn, label, job };
}

const commit = (queue: GenerationQueue, target: GenerationNode, url: string) =>
	queue.commitResult(target, { imageUrl: url, durationSec: 0 });

describe("staleReason", () => {
	it("is null for a node that has never generated", () => {
		expect(staleReason(node("a"), new GenerationQueue())).toBeNull();
	});

	it("is null right after a result is committed", () => {
		const queue = new GenerationQueue();
		commit(queue, node("a"), "a.png");
		expect(staleReason(node("a"), queue)).toBeNull();
	});

	it("names the prompt when only the prompt changed", () => {
		const queue = new GenerationQueue();
		commit(queue, node("a", { prompt: "a knight" }), "a.png");

		expect(staleReason(node("a", { prompt: "a wizard" }), queue)).toBe(
			"The prompt changed — regenerate to update",
		);
	});

	it("names the changed attribute rather than blaming the prompt", () => {
		const queue = new GenerationQueue();
		const withModel = (model: string) =>
			node("a", { attributes: { model, videoPrompt: "pan" } });
		commit(queue, withModel("fast"), "a.png");

		expect(staleReason(withModel("slow"), queue)).toBe(
			"Model changed — regenerate to update",
		);
	});

	it("names an attribute the element no longer carries", () => {
		const queue = new GenerationQueue();
		commit(queue, node("a", { attributes: { duration: "5" } }), "a.png");

		expect(staleReason(node("a"), queue)).toBe(
			"Duration changed — regenerate to update",
		);
	});

	it("names an upstream avatar by its character", () => {
		const queue = new GenerationQueue();
		const avatar = node(derivedNodeId("avatar", "Red"), {
			label: "Red's avatar",
		});
		const image = node("a", { dependsOn: [avatar] });
		commit(queue, avatar, "red.png");
		commit(queue, image, "a.png");

		commit(queue, avatar, "red-v2.png");
		expect(staleReason(image, queue)).toBe(
			"Red's avatar changed — regenerate to update",
		);
	});

	it("falls back to a shrug for a dependency with no label", () => {
		const queue = new GenerationQueue();
		const dep = node("dep");
		const image = node("a", { dependsOn: [dep] });
		commit(queue, dep, "dep.png");
		commit(queue, image, "a.png");

		commit(queue, dep, "dep-v2.png");
		expect(staleReason(image, queue)).toBe(
			"An upstream element changed — regenerate to update",
		);
	});

	it("names a project source node", () => {
		const queue = new GenerationQueue();
		const withStyle = (style: string) =>
			node("a", {
				dependsOn: [sourceNode("project:artStyle", { style }, "the art style")],
			});
		commit(queue, withStyle("watercolor"), "a.png");

		expect(staleReason(withStyle("noir"), queue)).toBe(
			"The art style changed — regenerate to update",
		);
	});

	it("names a dependency that is itself stale, even though its output has not changed", () => {
		const queue = new GenerationQueue();
		const refs = (urls: string) =>
			sourceNode("project:referenceImages", { urls }, "the reference images");
		const avatar = (urls: string) =>
			node(derivedNodeId("avatar", "Red"), {
				dependsOn: [refs(urls)],
				label: "Red's avatar",
			});
		const image = (urls: string) => node("a", { dependsOn: [avatar(urls)] });

		commit(queue, avatar("a.png"), "red.png");
		commit(queue, image("a.png"), "a.png");

		expect(staleReason(image("b.png"), queue)).toBe(
			"Red's avatar changed — regenerate to update",
		);
	});

	it("lists several causes together", () => {
		const queue = new GenerationQueue();
		const withStyle = (prompt: string, style: string) =>
			node("a", {
				prompt,
				dependsOn: [sourceNode("project:artStyle", { style }, "the art style")],
			});
		commit(queue, withStyle("a knight", "watercolor"), "a.png");

		expect(staleReason(withStyle("a wizard", "noir"), queue)).toBe(
			"The prompt and the art style changed — regenerate to update",
		);
	});

	it("counts off the causes past the first three", () => {
		const queue = new GenerationQueue();
		const withAttrs = (v: string) =>
			node("a", {
				prompt: v,
				attributes: { model: v, duration: v, motion: v },
			});
		commit(queue, withAttrs("1"), "a.png");

		expect(staleReason(withAttrs("2"), queue)).toBe(
			"The prompt, model, duration, and 1 more changed — regenerate to update",
		);
	});
});
