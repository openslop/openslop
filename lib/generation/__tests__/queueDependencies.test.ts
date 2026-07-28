import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AssetResult, ConnectorConfig } from "@/lib/connectors/types";
import { MetadataSchema } from "@/lib/project/types";
import { isNodeStale, type GenerationNode } from "../graph";
import { GenerationQueue, type GenerationJob } from "../queue";

const EMPTY_STATE = {
	metadata: MetadataSchema.parse({}),
	referenceImages: [],
};

type GenerateFn = (...args: unknown[]) => Promise<AssetResult>;
let generateMock: ReturnType<typeof vi.fn<GenerateFn>>;

vi.mock("../generateForElement", () => ({
	generateForElement: (...args: unknown[]) => generateMock(...args),
}));

const config: ConnectorConfig = {
	defaultModel: "m",
	models: ["m"],
	isDefault: true,
};

function node(id: string, dependsOn: GenerationNode[] = []): GenerationNode {
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
		inputs: { prompt: id, attributes: {} },
		dependsOn,
		buildJob: () => job,
	};
}

let queue: GenerationQueue;

beforeEach(() => {
	vi.useFakeTimers();
	generateMock = vi.fn();
	// The batch size from the issue's repro: two avatars can fill it.
	queue = new GenerationQueue({ batchSize: 2 });
});

afterEach(() => vi.useRealTimers());

const startedIds = () =>
	generateMock.mock.calls.map((call) => (call[0] as GenerationJob).elementId);

describe("dependency ordering", () => {
	it("holds a dependent until its own dependency resolves, not just any job", async () => {
		let releaseAlice: (result: AssetResult) => void = () => {};
		generateMock.mockImplementation((job) => {
			const { elementId } = job as GenerationJob;
			if (elementId === "avatar:Alice") {
				return new Promise<AssetResult>((resolve) => {
					releaseAlice = resolve;
				});
			}
			return Promise.resolve({ imageUrl: `${elementId}.png`, durationSec: 0 });
		});

		const alice = node("avatar:Alice");
		const bob = node("avatar:Bob");
		const image = node("image", [alice]);
		queue.enqueueGraph([image, bob]);
		await vi.advanceTimersByTimeAsync(0);

		// Bob finishing frees a batch slot, but the image depends on Alice.
		expect(startedIds()).toEqual(["avatar:Alice", "avatar:Bob"]);
		expect(queue.getElementSnapshot("image").status).toBe("queued");

		releaseAlice({ imageUrl: "alice.png", durationSec: 0 });
		await vi.runAllTimersAsync();

		expect(startedIds()).toContain("image");
	});

	it("passes resolved dependency results to the dependent's job", async () => {
		generateMock.mockImplementation((job) =>
			Promise.resolve({
				imageUrl: `${(job as GenerationJob).elementId}.png`,
				durationSec: 0,
			}),
		);

		const avatar = node("avatar:Alice");
		queue.enqueueGraph([node("image", [avatar])]);
		await vi.runAllTimersAsync();

		const imageCall = generateMock.mock.calls.find(
			(call) => (call[0] as GenerationJob).elementId === "image",
		);
		expect(imageCall?.[2]).toEqual({
			"avatar:Alice": { imageUrl: "avatar:Alice.png", durationSec: 0 },
		});
	});

	it("does not mark a freshly generated dependent stale", async () => {
		generateMock.mockImplementation((job) =>
			Promise.resolve({
				imageUrl: `${(job as GenerationJob).elementId}.png`,
				durationSec: 0,
			}),
		);

		const alice = node("avatar:Alice");
		const image = node("image", [alice]);
		queue.enqueueGraph([image, node("avatar:Bob")]);
		await vi.runAllTimersAsync();

		expect(queue.getElementSnapshot("image").result).not.toBeNull();
		expect(isNodeStale(image, queue)).toBe(false);
	});

	it("skips a dependency that is already current", async () => {
		generateMock.mockResolvedValue({ imageUrl: "x.png", durationSec: 0 });
		const avatar = node("avatar:Alice");
		queue.commitResult(avatar, { imageUrl: "existing.png", durationSec: 0 });

		queue.enqueueGraph([node("image", [avatar])]);
		await vi.runAllTimersAsync();

		expect(startedIds()).toEqual(["image"]);
	});

	it("keeps a dependent's existing result when a dependency fails", async () => {
		generateMock.mockImplementation((job) =>
			(job as GenerationJob).elementId === "avatar:Alice"
				? Promise.reject(new Error("avatar boom"))
				: Promise.resolve({ imageUrl: "x.png", durationSec: 0 }),
		);
		vi.spyOn(console, "error").mockImplementation(() => {});

		const image = node("image", [node("avatar:Alice")]);
		queue.commitResult(image, { imageUrl: "existing.png", durationSec: 0 });
		queue.enqueueGraph([node("avatar:Alice")]);
		await vi.runAllTimersAsync();
		queue.enqueueGraph([image]);
		await vi.runAllTimersAsync();

		// The image never ran, so the URL it already held is still good.
		const snapshot = queue.getElementSnapshot("image");
		expect(snapshot.result?.imageUrl).toBe("existing.png");
		expect(snapshot.error).toMatch(/avatar:Alice/);
	});

	it("surfaces an error on dependents when a dependency fails", async () => {
		generateMock.mockImplementation((job) =>
			(job as GenerationJob).elementId === "avatar:Alice"
				? Promise.reject(new Error("avatar boom"))
				: Promise.resolve({ imageUrl: "x.png", durationSec: 0 }),
		);
		vi.spyOn(console, "error").mockImplementation(() => {});

		queue.enqueueGraph([node("image", [node("avatar:Alice")])]);
		await vi.runAllTimersAsync();

		const snapshot = queue.getElementSnapshot("image");
		expect(snapshot.status).toBe("idle");
		expect(snapshot.error).toMatch(/avatar:Alice/);
		expect(queue.isBusy()).toBe(false);
	});
});
