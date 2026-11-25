import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import type { AssetConnectorType, AssetResult } from "@/lib/connectors/types";
import type { generateForElement } from "../generate-for-element";
import type { GenerationNode } from "../graph";
import { GenerationQueue } from "../queue";
import { queuedReason } from "../queued-reason";
import { jobNode } from "./_graph";

let generateMock: Mock<typeof generateForElement>;

vi.mock("../generate-for-element", () => ({
	generateForElement: (...args: Parameters<typeof generateForElement>) =>
		generateMock(...args),
}));

/** Each job runs until the test settles it by id. */
const settle = new Map<string, () => void>();

const node = (
	id: string,
	dependsOn: Record<string, GenerationNode> = {},
	connectorType: AssetConnectorType = "image",
): GenerationNode => ({ ...jobNode(id, [], { connectorType }), dependsOn });

async function finish(id: string) {
	settle.get(id)?.();
	await vi.waitFor(() => expect(settle.has(id)).toBe(false));
	await Promise.resolve();
}

beforeEach(() => {
	settle.clear();
	generateMock = vi.fn<typeof generateForElement>(
		({ id }) =>
			new Promise<AssetResult>((resolve) =>
				settle.set(id, () => {
					settle.delete(id);
					resolve({ imageUrl: `${id}.png`, durationSec: 0 });
				}),
			),
	);
});

describe("queuedReason", () => {
	it("is null for an element that isn't queued", () => {
		const queue = new GenerationQueue();
		queue.enqueueGraph([node("running")]);

		expect(queuedReason("never-queued", queue)).toBeNull();
		expect(queuedReason("running", queue)).toBeNull();
	});

	it("names the dependency an element waits on by its label", () => {
		const queue = new GenerationQueue();
		queue.enqueueGraph([node("scene", { "Red's image": node("avatar") })]);

		expect(queuedReason("scene", queue)).toBe("Waiting for Red's image");
	});

	it("follows a queued dependency to what it is waiting on in turn", () => {
		const queue = new GenerationQueue();
		const still = node("still", { "Red's image": node("avatar") });
		queue.enqueueGraph([node("scene", { "the still frame": still })]);

		expect(queuedReason("still", queue)).toBe("Waiting for Red's image");
		expect(queuedReason("scene", queue)).toBe("Waiting for Red's image");
	});

	it("counts off dependencies past the first few", () => {
		const queue = new GenerationQueue({ limits: { image: 5 } });
		const deps = Object.fromEntries(
			["A", "B", "C", "D", "E"].map((name) => [`${name}'s image`, node(name)]),
		);
		queue.enqueueGraph([node("scene", deps)]);

		expect(queuedReason("scene", queue)).toBe(
			"Waiting for A's image, B's image, C's image, and 2 more",
		);
	});

	it("names the media type when only the concurrency limit holds it back", () => {
		const queue = new GenerationQueue();
		queue.enqueueGraph([node("line-1", {}, "tts"), node("line-2", {}, "tts")]);

		expect(queuedReason("line-2", queue)).toBe(
			"Waiting for a free speech slot (1 running)",
		);
	});

	it("moves from a dependency to a free slot to running as the queue drains", async () => {
		const queue = new GenerationQueue({ limits: { image: 1, tts: 1 } });
		queue.enqueueGraph([node("busy")]);
		queue.enqueueGraph([
			node("scene", { "Red's voice": node("voice", {}, "tts") }),
		]);
		expect(queuedReason("scene", queue)).toBe("Waiting for Red's voice");

		await finish("voice");
		expect(queuedReason("scene", queue)).toBe(
			"Waiting for a free image slot (1 running)",
		);

		await finish("busy");
		expect(queue.getElementSnapshot("scene").status).toBe("generating");
		expect(queuedReason("scene", queue)).toBeNull();
	});
});
