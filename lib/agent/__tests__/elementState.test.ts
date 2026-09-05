import { MetadataSchema } from "@/lib/project/types";
import { describe, expect, it } from "vitest";
import { DEFAULT_MODELS } from "@/lib/connectors/models";
import type { AssetResult, ConnectorConfig } from "@/lib/connectors/types";
import {
	derivedNodeId,
	type GenerationJob,
	type GenerationNode,
} from "@/lib/generation/graph";
import type { GenerationInputs } from "@/lib/generation/inputs";
import { GenerationQueue } from "@/lib/generation/queue";
import { staleReason } from "@/lib/generation/staleReason";
import type { ElementVersion } from "@/lib/generation/versions";
import { elementState, summarizeVersions } from "../elementState";

const EMPTY_STATE = {
	hydrated: true,
	metadata: MetadataSchema.parse({}),
	referenceImages: [],
};

const config: ConnectorConfig = {};

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
		model: DEFAULT_MODELS.image,
		config,
		state: EMPTY_STATE,
	};
	return { id, inputs: { prompt, attributes }, dependsOn, label, job };
}

const image = (imageUrl: string): AssetResult => ({ imageUrl, durationSec: 0 });

const audio = (audioUrl: string, durationSec: number): AssetResult => ({
	audioUrl,
	durationSec,
});

/** Wired as the tool context wires it: the graph is only built for a stale check. */
const stateOf = (target: GenerationNode, queue: GenerationQueue) =>
	elementState(target.id, queue.getElementSnapshot(target.id), () =>
		staleReason(target, queue),
	);

describe("elementState", () => {
	it("reads an element that never ran as ungenerated, not as an error", () => {
		expect(stateOf(node("a"), new GenerationQueue())).toEqual({
			id: "a",
			state: "ungenerated",
		});
	});

	it("reads a settled result as generated, with the length of its media", () => {
		const queue = new GenerationQueue();
		queue.commitResult(node("a"), audio("a.mp3", 4.5));

		expect(stateOf(node("a"), queue)).toEqual({
			id: "a",
			state: "generated",
			durationSec: 4.5,
		});
	});

	it("gives a still no length rather than a length of zero", () => {
		const queue = new GenerationQueue();
		queue.commitResult(node("a"), image("a.png"));

		expect(stateOf(node("a"), queue)).toEqual({
			id: "a",
			state: "generated",
		});
	});

	it("reads a drifted result as stale, with the reason the badge shows", () => {
		const queue = new GenerationQueue();
		queue.commitResult(node("a", { prompt: "a knight" }), image("a.png"));

		expect(stateOf(node("a", { prompt: "a wizard" }), queue)).toEqual({
			id: "a",
			state: "stale",
			reason: "The prompt changed — regenerate to update",
		});
	});

	it("reads an upload as pinned, however far the element has drifted", () => {
		const queue = new GenerationQueue();
		queue.commitResult(node("a", { prompt: "a knight" }), image("up.png"), {
			pinned: true,
		});

		expect(stateOf(node("a", { prompt: "a wizard" }), queue)).toEqual({
			id: "a",
			state: "pinned",
		});
	});

	it("reads a failure with its error", () => {
		const queue = new GenerationQueue();
		queue.setError("a", "Provider returned 503");

		expect(stateOf(node("a"), queue)).toEqual({
			id: "a",
			state: "failed",
			error: "Provider returned 503",
		});
	});

	it("reads what the queue is working on by its status", () => {
		const queue = new GenerationQueue({ limits: { image: 1 } });
		queue.enqueueGraph([node("a"), node("b")]);

		expect(stateOf(node("a"), queue).state).toBe("generating");
		expect(stateOf(node("b"), queue).state).toBe("queued");

		queue.cancelAll();
	});
});

const inputs = (
	prompt: string,
	attributes: Record<string, string> = {},
	dependencies: Record<string, string> = {},
): GenerationInputs => ({ prompt, attributes, dependencies });

const version = (
	createdAt: string,
	versionInputs: GenerationInputs,
	result: AssetResult,
	pinned = false,
): ElementVersion => ({
	elementId: "a",
	createdAt,
	connectorType: "image",
	inputs: versionInputs,
	result,
	pinned,
});

describe("summarizeVersions", () => {
	const avatar = derivedNodeId("avatar", "Red");
	const first = version(
		"2026-01-01T00:00:00.000Z",
		inputs("a knight", { motion: "pan" }, { [avatar]: "red-v1.png" }),
		image("v1.png"),
	);
	const second = version(
		"2026-01-02T00:00:00.000Z",
		inputs("a wizard", { motion: "pan" }, { [avatar]: "red-v2.png" }),
		image("v2.png"),
	);
	const upload = version(
		"2026-01-03T00:00:00.000Z",
		inputs("a wizard", { motion: "pan" }, { [avatar]: "red-v2.png" }),
		image("up.png"),
		true,
	);
	const target = node("a", {
		dependsOn: [node(avatar, { label: "Red's avatar" })],
	});

	it("numbers the takes from one and names what changed between them", () => {
		const summaries = summarizeVersions(
			target,
			[first, second, upload],
			new GenerationQueue(),
		);

		expect(summaries.map(({ index, changed }) => [index, changed])).toEqual([
			[1, []],
			[2, ["the prompt", "Red's avatar"]],
			[3, []],
		]);
		expect(summaries[2]).toMatchObject({ pinned: true, prompt: "a wizard" });
	});

	it("marks the take whose inputs made the result on the canvas", () => {
		const queue = new GenerationQueue();
		queue.restoreResult(second);

		const summaries = summarizeVersions(target, [first, second, upload], queue);

		expect(summaries.map(({ current }) => current)).toEqual([
			false,
			true,
			false,
		]);
	});

	it("marks no take current while the element has nothing on the canvas", () => {
		const summaries = summarizeVersions(
			target,
			[first, second],
			new GenerationQueue(),
		);

		expect(summaries.some(({ current }) => current)).toBe(false);
	});

	it("exposes the text and attributes, never the urls or identities", () => {
		const [summary] = summarizeVersions(target, [first], new GenerationQueue());

		expect(summary).toEqual({
			index: 1,
			createdAt: "2026-01-01T00:00:00.000Z",
			prompt: "a knight",
			attributes: { motion: "pan" },
			pinned: false,
			current: false,
			changed: [],
		});
		expect(JSON.stringify(summary)).not.toContain("png");
	});
});
