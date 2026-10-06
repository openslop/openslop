import { describe, expect, it } from "vitest";
import { DEFAULT_MODELS } from "@/lib/connectors/models";
import type { ConnectorConfig } from "@/lib/connectors/types";
import {
	type Dependency,
	type GenerationJob,
	type GenerationNode,
} from "../graph";
import { GenerationQueue } from "../queue";
import { staleReason } from "../staleReason";
import { byId } from "./_graph";

const config: ConnectorConfig = {};

function node(
	id: string,
	{
		prompt = id,
		attributes = {},
		reads = {},
		dependsOn = [],
	}: {
		prompt?: string;
		attributes?: Record<string, string>;
		reads?: Record<string, string>;
		dependsOn?: (GenerationNode | Dependency)[];
	} = {},
): GenerationNode {
	const job: GenerationJob = {
		elementId: id,
		elementType: "image",
		connectorType: "image",
		model: DEFAULT_MODELS.image,
		config,
	};
	return {
		id,
		inputs: { prompt, attributes, reads },
		dependsOn: byId(dependsOn),
		job,
	};
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
			node("a", { attributes: { model, motion: "pan" } });
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
		const avatar = node("asset_character:Red");
		const image = node("a", {
			dependsOn: [{ node: avatar, label: "Red's avatar" }],
		});
		commit(queue, avatar, "red.png");
		commit(queue, image, "a.png");

		commit(queue, avatar, "red-v2.png");
		expect(staleReason(image, queue)).toBe(
			"Red's avatar changed — regenerate to update",
		);
	});

	it("names what it read verbatim, where an attribute is lowercased", () => {
		const queue = new GenerationQueue();
		const voiced = (voice: string) =>
			node("a", {
				attributes: { voiceId: voice },
				reads: { "Red's voice": voice },
			});
		commit(queue, voiced("v1"), "a.png");

		expect(staleReason(voiced("v2"), queue)).toBe(
			"Voice id and Red's voice changed — regenerate to update",
		);
	});

	it("names a dependency that is itself stale, even though its output has not changed", () => {
		const queue = new GenerationQueue();
		const avatar = (style: string) =>
			node("asset_character:Red", { reads: { "the art style": style } });
		const image = (style: string) =>
			node("a", {
				dependsOn: [{ node: avatar(style), label: "Red's avatar" }],
			});

		commit(queue, avatar("noir"), "red.png");
		commit(queue, image("noir"), "a.png");

		expect(staleReason(image("watercolor"), queue)).toBe(
			"Red's avatar changed — regenerate to update",
		);
	});

	it("lists several causes together", () => {
		const queue = new GenerationQueue();
		const withStyle = (prompt: string, style: string) =>
			node("a", { prompt, reads: { "the art style": style } });
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
