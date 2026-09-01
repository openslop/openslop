import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AssetResult, ConnectorConfig } from "@/lib/connectors/types";
import { MetadataSchema } from "@/lib/project/types";
import { isNodeStale, type GenerationJob, type GenerationNode } from "../graph";
import { GenerationQueue } from "../queue";

const EMPTY_STATE = {
	hydrated: true,
	metadata: MetadataSchema.parse({}),
	referenceImages: [],
};

type GenerateFn = (...args: unknown[]) => Promise<AssetResult>;
let generateMock: ReturnType<typeof vi.fn<GenerateFn>>;

vi.mock("../generateForElement", () => ({
	generateForElement: (...args: unknown[]) => generateMock(...args),
}));

const config: ConnectorConfig = {};

function node(id: string, dependsOn: GenerationNode[] = []): GenerationNode {
	const job: GenerationJob = {
		elementId: id,
		elementType: "image",
		connectorType: "image",
		provider: "openslop",
		config,
		state: EMPTY_STATE,
	};
	return {
		id,
		inputs: { prompt: id, attributes: {} },
		dependsOn,
		job,
	};
}

let queue: GenerationQueue;

beforeEach(() => {
	vi.useFakeTimers();
	generateMock = vi.fn();
	// The batch size from the issue's repro: two avatars can fill it.
	queue = new GenerationQueue({ limits: { image: 2 } });
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

	it("queues a dependency two levels down", () => {
		generateMock.mockImplementation(() => new Promise<AssetResult>(() => {}));

		// enqueueGraph walks the graph itself, so a node reached only through
		// another dependency still gets queued.
		const avatar = node("~avatar:Alice");
		const still = node("~still:anim", [avatar]);
		queue.enqueueGraph([node("anim", [still])]);

		expect(queue.getElementSnapshot("~avatar:Alice").status).not.toBe("idle");
		expect(queue.getElementSnapshot("~still:anim").status).not.toBe("idle");
		expect(queue.getElementSnapshot("anim").status).toBe("queued");
	});

	it("visits a dependency shared by two roots once", () => {
		generateMock.mockImplementation(() => new Promise<AssetResult>(() => {}));

		const avatar = node("~avatar:Alice");
		queue.enqueueGraph([node("a", [avatar]), node("b", [avatar])]);

		expect(queue.getActiveCount()).toBe(3);
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
		expect(snapshot.status).toBe("idle");
		expect(snapshot.error).toMatch(/boom/);
	});

	it("releases a dependent that can never run instead of leaving it queued", async () => {
		generateMock.mockImplementation((job) =>
			(job as GenerationJob).elementId === "avatar:Alice"
				? Promise.reject(new Error("avatar boom"))
				: Promise.resolve({ imageUrl: "x.png", durationSec: 0 }),
		);
		vi.spyOn(console, "error").mockImplementation(() => {});

		queue.enqueueGraph([node("image", [node("avatar:Alice")])]);
		await vi.runAllTimersAsync();

		expect(queue.getElementSnapshot("image").status).toBe("idle");
		expect(queue.getElementSnapshot("avatar:Alice").error).toMatch(/boom/);
		expect(queue.isBusy()).toBe(false);
	});

	it("reports a failed dependency on the dependent that was waiting on it", async () => {
		generateMock.mockImplementation((job) =>
			(job as GenerationJob).elementId === "~still:image"
				? Promise.reject(new Error("still boom"))
				: Promise.resolve({ imageUrl: "x.png", durationSec: 0 }),
		);
		vi.spyOn(console, "error").mockImplementation(() => {});

		queue.enqueueGraph([node("image", [node("~still:image")])]);
		await vi.runAllTimersAsync();

		// A derived node has no card, so its failure has to surface on the element.
		expect(queue.getElementSnapshot("image").error).toMatch(/still boom/);
	});

	it("carries a failure across a chain of blocked dependencies", async () => {
		generateMock.mockImplementation((job) =>
			(job as GenerationJob).elementId === "c"
				? Promise.reject(new Error("root boom"))
				: Promise.resolve({ imageUrl: "x.png", durationSec: 0 }),
		);
		vi.spyOn(console, "error").mockImplementation(() => {});

		queue.enqueueGraph([node("a", [node("b", [node("c")])])]);
		await vi.runAllTimersAsync();

		expect(queue.getElementSnapshot("b").error).toMatch(/root boom/);
		expect(queue.getElementSnapshot("a").error).toMatch(/root boom/);
	});

	it("leaves no error on a dependent released for a reason other than failure", async () => {
		generateMock.mockResolvedValue({ imageUrl: "x.png", durationSec: 0 });

		queue.enqueueGraph([node("image", [node("avatar:Alice")])]);
		await vi.runAllTimersAsync();

		expect(queue.getElementSnapshot("image").error).toBeNull();
	});
});
