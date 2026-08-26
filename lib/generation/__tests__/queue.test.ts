import { MetadataSchema } from "@/lib/project/types";
import {
	describe,
	expect,
	it,
	vi,
	beforeEach,
	afterEach,
	type Mock,
} from "vitest";
import type { ConnectorConfig } from "@/lib/connectors/types";
import { pickThumbnailUrl } from "@/lib/project/thumbnail";
import type { GenerationInputs } from "../inputs";
import type { GenerationJob, GenerationNode } from "../graph";
import { GenerationQueue } from "../queue";
import type { CommittedVersion } from "../versions";

const EMPTY_STATE = {
	hydrated: true,
	metadata: MetadataSchema.parse({}),
	referenceImages: [],
};

type GenerateFn = (...args: unknown[]) => Promise<unknown>;
let generateMock: ReturnType<typeof vi.fn<GenerateFn>>;

vi.mock("../generateForElement", () => ({
	generateForElement: (...args: unknown[]) => generateMock(...args),
}));

type JobOverrides = Partial<GenerationJob> & {
	inputs?: GenerationInputs;
	dependsOn?: GenerationNode[];
};

function makeJob(id: string, overrides: JobOverrides = {}): GenerationNode {
	const config: ConnectorConfig = {
		defaultModel: "test-model",
		models: ["test-model"],
		isDefault: true,
	};
	const {
		inputs = { prompt: "test prompt", attributes: {}, dependencies: {} },
		dependsOn = [],
		...rest
	} = overrides;
	const job: GenerationJob = {
		elementId: id,
		elementType: "image",
		connectorType: "image",
		provider: "openslop",
		config,
		state: EMPTY_STATE,
		...rest,
	};
	return {
		id,
		inputs: { prompt: inputs.prompt, attributes: inputs.attributes },
		dependsOn,
		job,
	};
}

let generationQueue: GenerationQueue;
let committed: Mock<(version: CommittedVersion) => void> = vi.fn();

describe("GenerationQueue", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		generateMock = vi.fn();
		committed = vi.fn();
		generationQueue = new GenerationQueue({ limits: { image: 3 } });
		generationQueue.onCommitted(committed);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("getElementSnapshot", () => {
		it("returns idle snapshot for unknown element", () => {
			const snap = generationQueue.getElementSnapshot("unknown-id");
			expect(snap).toEqual({
				status: "idle",
				seconds: 0,
				result: null,
				error: null,
				resultInputs: null,
				connectorType: null,
				pinned: false,
			});
		});
	});

	describe("subscribe", () => {
		it("calls listener on enqueue and returns unsubscribe fn", () => {
			const listener = vi.fn();
			const unsub = generationQueue.subscribe(listener);

			generateMock.mockReturnValue(new Promise(() => {}));
			generationQueue.enqueueGraph([makeJob("sub-1")]);
			expect(listener).toHaveBeenCalled();

			const callCount = listener.mock.calls.length;
			unsub();
			generationQueue.enqueueGraph([makeJob("sub-2")]);
			// After unsubscribe, listener should not be called again
			// (sub-2 is a new job so enqueue would normally notify)
			// Note: sub-1 might still be generating, but sub-2 is different
			expect(listener).toHaveBeenCalledTimes(callCount);

			generationQueue.discard("sub-1");
			generationQueue.discard("sub-2");
		});
	});

	describe("enqueue", () => {
		it("sets element status to generating when under the concurrency limit", () => {
			generateMock.mockReturnValue(new Promise(() => {}));
			generationQueue.enqueueGraph([makeJob("e1")]);

			const snap = generationQueue.getElementSnapshot("e1");
			expect(snap.status).toBe("generating");

			generationQueue.discard("e1");
		});

		it("sets element status to queued when at the concurrency limit", () => {
			generateMock.mockReturnValue(new Promise(() => {}));

			// Fill the image limit (3)
			generationQueue.enqueueGraph([
				makeJob("b1"),
				makeJob("b2"),
				makeJob("b3"),
			]);
			// 4th job should be queued, not generating
			generationQueue.enqueueGraph([makeJob("b4")]);

			expect(generationQueue.getElementSnapshot("b1").status).toBe(
				"generating",
			);
			expect(generationQueue.getElementSnapshot("b2").status).toBe(
				"generating",
			);
			expect(generationQueue.getElementSnapshot("b3").status).toBe(
				"generating",
			);
			expect(generationQueue.getElementSnapshot("b4").status).toBe("queued");

			generationQueue.discard("b1");
			generationQueue.discard("b2");
			generationQueue.discard("b3");
			generationQueue.discard("b4");
		});

		it("limits each connector type independently", () => {
			generateMock.mockReturnValue(new Promise(() => {}));
			const queue = new GenerationQueue({ limits: { image: 1, tts: 2 } });

			queue.enqueueGraph([
				makeJob("i1"),
				makeJob("i2"),
				makeJob("t1", { connectorType: "tts" }),
				makeJob("t2", { connectorType: "tts" }),
			]);

			expect(queue.getElementSnapshot("i1").status).toBe("generating");
			expect(queue.getElementSnapshot("i2").status).toBe("queued");
			expect(queue.getElementSnapshot("t1").status).toBe("generating");
			expect(queue.getElementSnapshot("t2").status).toBe("generating");

			queue.cancelAll();
		});

		it("does not re-enqueue an element already in the queue", () => {
			generateMock.mockReturnValue(new Promise(() => {}));
			const listener = vi.fn();
			generationQueue.subscribe(listener);

			generationQueue.enqueueGraph([makeJob("dup1")]);
			const firstCount = listener.mock.calls.length;

			generationQueue.enqueueGraph([makeJob("dup1")]);
			// No additional notifications because the element was skipped
			expect(listener).toHaveBeenCalledTimes(firstCount);

			generationQueue.discard("dup1");
		});
	});

	describe("enqueueGraph", () => {
		it("enqueues multiple roots at once", () => {
			generateMock.mockReturnValue(new Promise(() => {}));
			generationQueue.enqueueGraph([makeJob("m1"), makeJob("m2")]);

			expect(generationQueue.getElementSnapshot("m1").status).toBe(
				"generating",
			);
			expect(generationQueue.getElementSnapshot("m2").status).toBe(
				"generating",
			);

			generationQueue.discard("m1");
			generationQueue.discard("m2");
		});

		it("does not notify if no new jobs were added", () => {
			generateMock.mockReturnValue(new Promise(() => {}));
			generationQueue.enqueueGraph([makeJob("existing")]);

			const listener = vi.fn();
			generationQueue.subscribe(listener);
			generationQueue.enqueueGraph([makeJob("existing")]);
			expect(listener).not.toHaveBeenCalled();

			generationQueue.discard("existing");
		});
	});

	describe("successful generation", () => {
		it("stores result and resets to idle on success", async () => {
			const result = { url: "https://example.com/image.png" };
			generateMock.mockResolvedValue(result);

			generationQueue.enqueueGraph([makeJob("ok1")]);
			await vi.runAllTimersAsync();

			const snap = generationQueue.getElementSnapshot("ok1");
			expect(snap.status).toBe("idle");
			expect(snap.result).toEqual(result);
			expect(snap.error).toBeNull();
		});
	});

	describe("failed generation", () => {
		it("stores error message on failure", async () => {
			generateMock.mockRejectedValue(new Error("generation failed"));

			generationQueue.enqueueGraph([makeJob("err1")]);
			await vi.runAllTimersAsync();

			const snap = generationQueue.getElementSnapshot("err1");
			expect(snap.status).toBe("idle");
			expect(snap.result).toBeNull();
			expect(snap.error).toBe("generation failed");
		});

		it("converts non-Error throws to string", async () => {
			generateMock.mockRejectedValue("string error");

			generationQueue.enqueueGraph([makeJob("err2")]);
			await vi.runAllTimersAsync();

			expect(generationQueue.getElementSnapshot("err2").error).toBe(
				"string error",
			);
		});

		it("clears the previous failure when the element is queued again", async () => {
			generateMock.mockRejectedValue(new Error("boom"));
			generationQueue.enqueueGraph([makeJob("retry1")]);
			await vi.runAllTimersAsync();
			expect(generationQueue.getElementSnapshot("retry1").error).toBe("boom");

			generateMock.mockReturnValue(new Promise(() => {}));
			generationQueue.enqueueGraph([makeJob("retry1")]);

			const snap = generationQueue.getElementSnapshot("retry1");
			expect(snap.status).toBe("generating");
			expect(snap.error).toBeNull();

			generationQueue.discard("retry1");
		});

		it("notifies subscribers when a job fails", async () => {
			generateMock.mockRejectedValue(new Error("boom"));
			generationQueue.enqueueGraph([makeJob("err3")]);
			const listener = vi.fn();
			generationQueue.subscribe(listener);

			await vi.runAllTimersAsync();

			// handleJobError owns the failure notify (finalizeJob no longer
			// notifies), so the error must still reach subscribers.
			expect(listener).toHaveBeenCalled();
			expect(generationQueue.getElementSnapshot("err3").error).toBe("boom");
		});
	});

	describe("cancel", () => {
		it("cancels a generating job and resets to idle", () => {
			generateMock.mockReturnValue(new Promise(() => {}));
			generationQueue.enqueueGraph([makeJob("c1")]);
			expect(generationQueue.getElementSnapshot("c1").status).toBe(
				"generating",
			);

			generationQueue.cancel("c1");
			const snap = generationQueue.getElementSnapshot("c1");
			// No previous result or error, so state is fully deleted
			expect(snap.status).toBe("idle");
			expect(snap.result).toBeNull();
		});

		it("preserves previous result after cancellation", async () => {
			const result = { url: "https://example.com/prev.png" };
			generateMock.mockResolvedValue(result);
			generationQueue.enqueueGraph([makeJob("c2")]);
			await vi.runAllTimersAsync();
			expect(generationQueue.getElementSnapshot("c2").result).toEqual(result);

			// Re-enqueue and cancel during generation
			generateMock.mockReturnValue(new Promise(() => {}));
			generationQueue.enqueueGraph([makeJob("c2")]);
			generationQueue.cancel("c2");

			const snap = generationQueue.getElementSnapshot("c2");
			expect(snap.status).toBe("idle");
			expect(snap.result).toEqual(result);
		});

		it("is a no-op for elements not in the queue", () => {
			const listener = vi.fn();
			generationQueue.subscribe(listener);
			generationQueue.cancel("nonexistent");
			expect(listener).not.toHaveBeenCalled();
		});

		it("promotes queued jobs when a generating job is cancelled", () => {
			generateMock.mockReturnValue(new Promise(() => {}));
			generationQueue.enqueueGraph([
				makeJob("p1"),
				makeJob("p2"),
				makeJob("p3"),
				makeJob("p4"),
			]);
			expect(generationQueue.getElementSnapshot("p4").status).toBe("queued");

			generationQueue.cancel("p1");
			expect(generationQueue.getElementSnapshot("p4").status).toBe(
				"generating",
			);

			generationQueue.discard("p1");
			generationQueue.discard("p2");
			generationQueue.discard("p3");
			generationQueue.discard("p4");
		});
	});

	describe("cancelAll", () => {
		it("cancels all jobs and clears the queue", () => {
			generateMock.mockReturnValue(new Promise(() => {}));
			generationQueue.enqueueGraph([
				makeJob("a1"),
				makeJob("a2"),
				makeJob("a3"),
				makeJob("a4"),
			]);

			generationQueue.cancelAll();

			expect(generationQueue.getElementSnapshot("a1").status).toBe("idle");
			expect(generationQueue.getElementSnapshot("a2").status).toBe("idle");
			expect(generationQueue.getElementSnapshot("a3").status).toBe("idle");
			// a4 was queued (not generating), so it had no result/error — state deleted
			expect(generationQueue.getElementSnapshot("a4").status).toBe("idle");
		});
	});

	describe("discard", () => {
		it("removes element state entirely", () => {
			generateMock.mockReturnValue(new Promise(() => {}));
			generationQueue.enqueueGraph([makeJob("d1")]);

			generationQueue.discard("d1");
			const snap = generationQueue.getElementSnapshot("d1");
			expect(snap).toEqual({
				status: "idle",
				seconds: 0,
				result: null,
				error: null,
				resultInputs: null,
				connectorType: null,
				pinned: false,
			});
		});

		it("promotes queued jobs when discarding a generating element", () => {
			generateMock.mockReturnValue(new Promise(() => {}));
			generationQueue.enqueueGraph([
				makeJob("d2"),
				makeJob("d3"),
				makeJob("d4"),
				makeJob("d5"),
			]);
			expect(generationQueue.getElementSnapshot("d5").status).toBe("queued");

			generationQueue.discard("d2");
			expect(generationQueue.getElementSnapshot("d5").status).toBe(
				"generating",
			);

			generationQueue.discard("d3");
			generationQueue.discard("d4");
			generationQueue.discard("d5");
		});
	});

	describe("setError", () => {
		it("sets an error on an element", () => {
			generationQueue.setError("se1", "something went wrong");
			const snap = generationQueue.getElementSnapshot("se1");
			expect(snap.error).toBe("something went wrong");
			expect(snap.result).toBeNull();

			generationQueue.discard("se1");
		});
	});

	describe("commitResult", () => {
		it("sets result, connectorType, clears error, and moves status to idle", () => {
			const result = {
				imageUrl: "https://example.com/upload.png",
				durationSec: 0,
			};
			const node = makeJob("sm1", {
				inputs: { prompt: "p", attributes: {}, dependencies: {} },
			});
			generationQueue.commitResult(node, result);

			const snap = generationQueue.getElementSnapshot("sm1");
			expect(snap.status).toBe("idle");
			expect(snap.result).toEqual(result);
			expect(snap.error).toBeNull();
			expect(snap.resultInputs).toEqual({
				prompt: "p",
				attributes: {},
				dependencies: {},
			});
			// Without this, pickThumbnailUrl skips the upload and the project card
			// stays blank (no job ran to set connectorType).
			expect(snap.connectorType).toBe("image");

			generationQueue.discard("sm1");
		});

		it("makes an uploaded-only image project's thumbnail resolve via pickThumbnailUrl", () => {
			// The exact repro: new project, drop an image element, upload without
			// ever hitting generate — pickThumbnailUrl must still find the image.
			generationQueue.commitResult(
				makeJob("scene-1", {
					inputs: { prompt: "", attributes: {}, dependencies: {} },
				}),
				{ imageUrl: "https://example.com/upload.png", durationSec: 0 },
			);

			const thumbnail = pickThumbnailUrl(
				Object.entries(generationQueue.snapshot()),
			);
			expect(thumbnail).toBe("https://example.com/upload.png");

			generationQueue.discard("scene-1");
		});

		it("overwrites an existing generated result", async () => {
			const generated = {
				url: "https://example.com/generated.png",
				durationSec: 0,
			};
			generateMock.mockResolvedValue(generated);
			const inputs = { prompt: "p", attributes: {}, dependencies: {} };
			generationQueue.enqueueGraph([makeJob("sm2", { inputs })]);
			await vi.runAllTimersAsync();
			expect(generationQueue.getElementSnapshot("sm2").result).toEqual(
				generated,
			);

			const uploaded = {
				imageUrl: "https://example.com/upload.png",
				durationSec: 0,
			};
			generationQueue.commitResult(makeJob("sm2"), uploaded);
			expect(generationQueue.getElementSnapshot("sm2").result).toEqual(
				uploaded,
			);

			generationQueue.discard("sm2");
		});

		it("overwrites an existing error", () => {
			generationQueue.setError("sm3", "something went wrong");
			expect(generationQueue.getElementSnapshot("sm3").error).toBe(
				"something went wrong",
			);

			const uploaded = {
				imageUrl: "https://example.com/upload.png",
				durationSec: 0,
			};
			generationQueue.commitResult(makeJob("sm3"), uploaded);
			const snap = generationQueue.getElementSnapshot("sm3");
			expect(snap.error).toBeNull();
			expect(snap.result).toEqual(uploaded);

			generationQueue.discard("sm3");
		});

		it("notifies subscribers", () => {
			const listener = vi.fn();
			generationQueue.subscribe(listener);
			generationQueue.commitResult(makeJob("sm5"), {
				imageUrl: "https://example.com/upload.png",
				durationSec: 0,
			});
			expect(listener).toHaveBeenCalled();

			generationQueue.discard("sm5");
		});

		it("does not let a cancelled in-flight job clobber a result committed after it", async () => {
			let resolveGenerate: (value: unknown) => void = () => {};
			generateMock.mockReturnValue(
				new Promise((resolve) => {
					resolveGenerate = resolve;
				}),
			);
			const inputs = { prompt: "p", attributes: {}, dependencies: {} };
			generationQueue.enqueueGraph([makeJob("sm6", { inputs })]);
			expect(generationQueue.getElementSnapshot("sm6").status).toBe(
				"generating",
			);

			// commitResult cancels the in-flight job so it cannot clobber the upload.
			const uploaded = {
				imageUrl: "https://example.com/upload.png",
				durationSec: 0,
			};
			generationQueue.commitResult(makeJob("sm6", { inputs }), uploaded);
			expect(generationQueue.getElementSnapshot("sm6").result).toEqual(
				uploaded,
			);

			// The cancelled job resolves afterwards — it must not overwrite the
			// committed result.
			resolveGenerate({
				url: "https://example.com/generated.png",
				durationSec: 0,
			});
			await vi.runAllTimersAsync();
			expect(generationQueue.getElementSnapshot("sm6").result).toEqual(
				uploaded,
			);

			generationQueue.discard("sm6");
		});
	});

	describe("restoreResult", () => {
		it("shows a result supplied for inputs the element has drifted from", async () => {
			const result = {
				imageUrl: "https://example.com/asset.png",
				durationSec: 0,
			};
			generateMock.mockResolvedValue(result);
			const inputs = {
				prompt: "p",
				attributes: { a: "1", b: "2" },
				dependencies: {},
			};
			generationQueue.enqueueGraph([makeJob("rr1", { inputs })]);
			await vi.runAllTimersAsync();
			generationQueue.setError("rr1", "stale");
			expect(generationQueue.getElementSnapshot("rr1").result).toBeNull();

			generationQueue.restoreResult({
				elementId: "rr1",
				connectorType: "image",
				inputs,
				result,
				pinned: false,
			});
			expect(generationQueue.getElementSnapshot("rr1")).toMatchObject({
				result,
				resultInputs: inputs,
				error: null,
			});
		});

		it("leaves an in-flight generation running", async () => {
			const first = {
				imageUrl: "https://example.com/first.png",
				durationSec: 0,
			};
			generateMock.mockResolvedValue(first);
			const inputs = { prompt: "p", attributes: {}, dependencies: {} };
			generationQueue.enqueueGraph([makeJob("rr2", { inputs })]);
			await vi.runAllTimersAsync();

			generateMock.mockReturnValue(new Promise(() => {}));
			generationQueue.enqueueGraph([
				makeJob("rr2", { inputs: { ...inputs, prompt: "next" } }),
			]);
			await vi.advanceTimersByTimeAsync(0);

			generationQueue.restoreResult({
				elementId: "rr2",
				connectorType: "image",
				inputs,
				result: first,
				pinned: false,
			});

			expect(generationQueue.getElementSnapshot("rr2")).toMatchObject({
				status: "generating",
				result: first,
			});
			generationQueue.discard("rr2");
		});

		it("carries the version's provenance, so a restored upload stays pinned", async () => {
			const uploaded = {
				imageUrl: "https://example.com/up.png",
				durationSec: 0,
			};
			const shared = { prompt: "p", attributes: {}, dependencies: {} };
			generateMock.mockResolvedValue({ imageUrl: "gen.png", durationSec: 0 });
			generationQueue.enqueueGraph([makeJob("rr3", { inputs: shared })]);
			await vi.runAllTimersAsync();
			expect(generationQueue.getElementSnapshot("rr3").pinned).toBe(false);

			generationQueue.restoreResult({
				elementId: "rr3",
				connectorType: "image",
				inputs: shared,
				result: uploaded,
				pinned: true,
			});

			expect(generationQueue.getElementSnapshot("rr3")).toMatchObject({
				result: uploaded,
				pinned: true,
			});
		});

		it("unpins the element when the restored version was generated", async () => {
			const generated = {
				imageUrl: "https://example.com/gen.png",
				durationSec: 0,
			};
			const shared = { prompt: "p", attributes: {}, dependencies: {} };
			generationQueue.commitResult(
				makeJob("rr4", { inputs: shared }),
				{ imageUrl: "https://example.com/up.png", durationSec: 0 },
				{ pinned: true },
			);
			expect(generationQueue.getElementSnapshot("rr4").pinned).toBe(true);

			generationQueue.restoreResult({
				elementId: "rr4",
				connectorType: "image",
				inputs: shared,
				result: generated,
				pinned: false,
			});

			expect(generationQueue.getElementSnapshot("rr4")).toMatchObject({
				result: generated,
				pinned: false,
			});
		});
	});

	describe("batch processing", () => {
		it("processes queued jobs after generating ones complete", async () => {
			let resolve1: (v: { url: string }) => void = () => {};
			const p1 = new Promise<{ url: string }>((r) => {
				resolve1 = r;
			});
			generateMock
				.mockReturnValueOnce(p1)
				.mockReturnValueOnce(new Promise(() => {}))
				.mockReturnValueOnce(new Promise(() => {}))
				.mockReturnValueOnce(new Promise(() => {}));

			generationQueue.enqueueGraph([
				makeJob("q1"),
				makeJob("q2"),
				makeJob("q3"),
				makeJob("q4"),
			]);

			expect(generationQueue.getElementSnapshot("q4").status).toBe("queued");

			// Complete the first job and flush microtasks
			resolve1({ url: "done" });
			await vi.advanceTimersByTimeAsync(0);

			expect(generationQueue.getElementSnapshot("q1").status).toBe("idle");
			expect(generationQueue.getElementSnapshot("q4").status).toBe(
				"generating",
			);

			generationQueue.discard("q1");
			generationQueue.discard("q2");
			generationQueue.discard("q3");
			generationQueue.discard("q4");
		});
	});

	describe("timer", () => {
		it("increments seconds while generating", async () => {
			generateMock.mockReturnValue(new Promise(() => {}));
			generationQueue.enqueueGraph([makeJob("t1")]);

			expect(generationQueue.getElementSnapshot("t1").seconds).toBe(0);

			await vi.advanceTimersByTimeAsync(3000);
			expect(generationQueue.getElementSnapshot("t1").seconds).toBeGreaterThan(
				0,
			);

			generationQueue.discard("t1");
		});
	});

	describe("committed versions", () => {
		const generate = async (id: string, url: string) => {
			generateMock.mockResolvedValue({ url, durationSec: 0 });
			generationQueue.enqueueGraph([makeJob(id)]);
			await vi.advanceTimersByTimeAsync(0);
		};

		it("announces each finished version to its listeners", async () => {
			await generate("v1", "first.png");

			expect(committed).toHaveBeenCalledWith(
				expect.objectContaining({
					elementId: "v1",
					connectorType: "image",
					pinned: false,
					result: { url: "first.png", durationSec: 0 },
				}),
			);
		});

		// A version is restored onto the element, so it has to remember the type it
		// was generated as, not just the connector that ran it.
		it("announces the element type the version was generated as", async () => {
			await generate("v3", "third.png");

			expect(committed).toHaveBeenCalledWith(
				expect.objectContaining({ elementId: "v3", elementType: "image" }),
			);
		});

		it("announces an upload as a version of its own", () => {
			const node = makeJob("v2");
			generationQueue.commitResult(
				node,
				{ imageUrl: "up.png", durationSec: 0 },
				{ pinned: true },
			);

			expect(committed).toHaveBeenCalledWith(
				expect.objectContaining({ elementId: "v2", pinned: true }),
			);
		});
	});

	describe("snapshot", () => {
		const idleEntry = {
			status: "idle" as const,
			seconds: 0,
			result: { url: "u", durationSec: 2 },
			error: null,
			resultInputs: { prompt: "p", attributes: {}, dependencies: {} },
			connectorType: "image" as const,
			pinned: false,
		};

		it("dumps every entry verbatim", async () => {
			generateMock.mockResolvedValue(idleEntry.result);
			generationQueue.enqueueGraph([
				makeJob("s1", { inputs: idleEntry.resultInputs }),
			]);
			await vi.advanceTimersByTimeAsync(0);

			expect(generationQueue.snapshot()).toEqual({
				s1: idleEntry,
			});
		});

		it("includes errored entries", () => {
			generationQueue.setError("s2", "boom");
			expect(generationQueue.snapshot()).toEqual({
				s2: {
					status: "idle",
					seconds: 0,
					result: null,
					error: "boom",
					resultInputs: null,
					connectorType: null,
					pinned: false,
				},
			});
		});
	});

	describe("initialState", () => {
		const idleEntry = {
			status: "idle" as const,
			seconds: 0,
			result: { url: "u", durationSec: 2 },
			error: null,
			resultInputs: { prompt: "p", attributes: {}, dependencies: {} },
			connectorType: "image" as const,
			pinned: false,
		};

		it("populates entries from the constructor", () => {
			const q = new GenerationQueue({
				initialState: { h1: idleEntry },
			});
			expect(q.getElementSnapshot("h1")).toEqual(idleEntry);
		});

		it("normalizes stale 'generating' status back to idle", () => {
			const q = new GenerationQueue({
				initialState: {
					h2: { ...idleEntry, status: "generating", seconds: 42 },
				},
			});
			const snap = q.getElementSnapshot("h2");
			expect(snap.status).toBe("idle");
			expect(snap.seconds).toBe(0);
		});

		it("keeps staleness correct after rehydration", async () => {
			const { isNodeStale } = await import("../graph");
			const q = new GenerationQueue({
				initialState: { h3: idleEntry },
			});

			expect(
				isNodeStale(makeJob("h3", { inputs: idleEntry.resultInputs }), q),
			).toBe(false);
			expect(
				isNodeStale(
					makeJob("h3", {
						inputs: { prompt: "different", attributes: {}, dependencies: {} },
					}),
					q,
				),
			).toBe(true);
		});
	});

	// Regression coverage for #427: the progress label reads these counters, so
	// they have to survive membership changes rather than being reconstructed
	// from the concurrently-active count.
	describe("progress counters", () => {
		const pending = () => new Promise<{ url: string }>(() => {});

		// The progress bar composes total as active + generated, so these assert on
		// the two derived counters the queue exposes.
		const total = () =>
			generationQueue.getActiveCount() + generationQueue.getGeneratedCount();

		it("counts every newly enqueued item as active", () => {
			generateMock.mockReturnValue(pending());
			generationQueue.enqueueGraph([makeJob("a"), makeJob("b"), makeJob("c")]);

			expect(total()).toBe(3);
			expect(generationQueue.getGeneratedCount()).toBe(0);

			generationQueue.cancelAll();
		});

		it("does not count an already-queued item twice", () => {
			generateMock.mockReturnValue(pending());
			generationQueue.enqueueGraph([makeJob("a"), makeJob("b")]);
			generationQueue.enqueueGraph([makeJob("a"), makeJob("c")]);

			expect(total()).toBe(3);

			generationQueue.cancelAll();
		});

		it("drops a cancelled item from the total instead of counting it generated", () => {
			generateMock.mockReturnValue(pending());
			generationQueue.enqueueGraph([makeJob("a"), makeJob("b"), makeJob("c")]);
			generationQueue.cancel("b");

			expect(total()).toBe(2);
			expect(generationQueue.getGeneratedCount()).toBe(0);

			generationQueue.cancelAll();
		});

		it("drops a discarded item from the total", () => {
			generateMock.mockReturnValue(pending());
			generationQueue.enqueueGraph([makeJob("a"), makeJob("b"), makeJob("c")]);
			generationQueue.discard("b");

			expect(total()).toBe(2);

			generationQueue.cancelAll();
		});

		it("drops a failed item from the total so the run can still finish", async () => {
			let rejectA: (error: Error) => void = () => {};
			let resolveB: (value: { url: string }) => void = () => {};
			generateMock
				.mockReturnValueOnce(
					new Promise<{ url: string }>((_resolve, reject) => {
						rejectA = reject;
					}),
				)
				.mockReturnValueOnce(
					new Promise<{ url: string }>((resolve) => {
						resolveB = resolve;
					}),
				)
				.mockReturnValue(pending());

			generationQueue.enqueueGraph([makeJob("a"), makeJob("b"), makeJob("c")]);
			rejectA(new Error("boom"));
			await vi.advanceTimersByTimeAsync(0);

			// The failure has no result and is no longer active, so it drops out of
			// both counters rather than stranding the bar below 100%.
			expect(total()).toBe(2);
			expect(generationQueue.getGeneratedCount()).toBe(0);

			resolveB({ url: "b" });
			await vi.advanceTimersByTimeAsync(0);

			expect(total()).toBe(2);
			expect(generationQueue.getGeneratedCount()).toBe(1);

			generationQueue.cancelAll();
		});

		it("keeps earlier completions counted when items are added mid-run", async () => {
			let resolveA: (v: { url: string }) => void = () => {};
			let resolveB: (v: { url: string }) => void = () => {};
			generateMock
				.mockReturnValueOnce(
					new Promise<{ url: string }>((r) => {
						resolveA = r;
					}),
				)
				.mockReturnValueOnce(
					new Promise<{ url: string }>((r) => {
						resolveB = r;
					}),
				)
				.mockReturnValue(pending());

			generationQueue.enqueueGraph([makeJob("a"), makeJob("b"), makeJob("c")]);
			resolveA({ url: "a" });
			resolveB({ url: "b" });
			await vi.advanceTimersByTimeAsync(0);

			expect(generationQueue.getGeneratedCount()).toBe(2);
			expect(total()).toBe(3);

			// Adding work mid-run grows the denominator without losing the two
			// already-finished items.
			generationQueue.enqueueGraph([makeJob("d"), makeJob("e"), makeJob("f")]);

			expect(generationQueue.getGeneratedCount()).toBe(2);
			expect(total()).toBe(6);

			generationQueue.cancelAll();
		});

		it("keeps a completed item counted after the queue drains, and later work grows the total", async () => {
			let resolveA: (v: { url: string }) => void = () => {};
			generateMock
				.mockReturnValueOnce(
					new Promise<{ url: string }>((r) => {
						resolveA = r;
					}),
				)
				.mockReturnValue(pending());

			generationQueue.enqueueGraph([makeJob("a")]);
			resolveA({ url: "a" });
			await vi.advanceTimersByTimeAsync(0);

			// Nothing resets on drain: the finished item stays counted as generated.
			expect(generationQueue.getActiveCount()).toBe(0);
			expect(generationQueue.getGeneratedCount()).toBe(1);
			expect(total()).toBe(1);

			// A fresh job joins the still-counted completion instead of replacing it.
			generationQueue.enqueueGraph([makeJob("b")]);

			expect(generationQueue.getGeneratedCount()).toBe(1);
			expect(total()).toBe(2);

			generationQueue.cancelAll();
		});
	});
});
