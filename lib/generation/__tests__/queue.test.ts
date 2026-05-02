import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { ConnectorConfig } from "@/lib/connectors/types";
import { GenerationQueue, type GenerationJob } from "../queue";

type GenerateFn = (...args: unknown[]) => Promise<unknown>;
let generateMock: ReturnType<typeof vi.fn<GenerateFn>>;

vi.mock("../generateForElement", () => ({
	generateForElement: (...args: unknown[]) => generateMock(...args),
}));

function makeJob(
	id: string,
	overrides?: Partial<GenerationJob>,
): GenerationJob {
	const config: ConnectorConfig = {
		defaultModel: "test-model",
		models: ["test-model"],
		isDefault: true,
	};
	return {
		elementId: id,
		connectorType: "image",
		provider: "openslop",
		config,
		prompt: "test prompt",
		extraParams: {},
		inputs: { prompt: "test prompt", attributes: {} },
		...overrides,
	};
}

let generationQueue: GenerationQueue;

describe("GenerationQueue", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		generateMock = vi.fn();
		generationQueue = new GenerationQueue({ batchSize: 3 });
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
			});
		});
	});

	describe("subscribe", () => {
		it("calls listener on enqueue and returns unsubscribe fn", () => {
			const listener = vi.fn();
			const unsub = generationQueue.subscribe(listener);

			generateMock.mockReturnValue(new Promise(() => {}));
			generationQueue.enqueue(makeJob("sub-1"));
			expect(listener).toHaveBeenCalled();

			const callCount = listener.mock.calls.length;
			unsub();
			generationQueue.enqueue(makeJob("sub-2"));
			// After unsubscribe, listener should not be called again
			// (sub-2 is a new job so enqueue would normally notify)
			// Note: sub-1 might still be generating, but sub-2 is different
			expect(listener).toHaveBeenCalledTimes(callCount);

			generationQueue.discard("sub-1");
			generationQueue.discard("sub-2");
		});
	});

	describe("enqueue", () => {
		it("sets element status to generating when under batch limit", () => {
			generateMock.mockReturnValue(new Promise(() => {}));
			generationQueue.enqueue(makeJob("e1"));

			const snap = generationQueue.getElementSnapshot("e1");
			expect(snap.status).toBe("generating");

			generationQueue.discard("e1");
		});

		it("sets element status to queued when at batch limit", () => {
			generateMock.mockReturnValue(new Promise(() => {}));

			// Fill up the batch (size 3)
			generationQueue.enqueueAll([makeJob("b1"), makeJob("b2"), makeJob("b3")]);
			// 4th job should be queued, not generating
			generationQueue.enqueue(makeJob("b4"));

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

		it("does not re-enqueue an element already in the queue", () => {
			generateMock.mockReturnValue(new Promise(() => {}));
			const listener = vi.fn();
			generationQueue.subscribe(listener);

			generationQueue.enqueue(makeJob("dup1"));
			const firstCount = listener.mock.calls.length;

			generationQueue.enqueue(makeJob("dup1"));
			// No additional notifications because the element was skipped
			expect(listener).toHaveBeenCalledTimes(firstCount);

			generationQueue.discard("dup1");
		});
	});

	describe("enqueueAll", () => {
		it("enqueues multiple jobs at once", () => {
			generateMock.mockReturnValue(new Promise(() => {}));
			generationQueue.enqueueAll([makeJob("m1"), makeJob("m2")]);

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
			generationQueue.enqueue(makeJob("existing"));

			const listener = vi.fn();
			generationQueue.subscribe(listener);
			generationQueue.enqueueAll([makeJob("existing")]);
			expect(listener).not.toHaveBeenCalled();

			generationQueue.discard("existing");
		});
	});

	describe("successful generation", () => {
		it("stores result and resets to idle on success", async () => {
			const result = { url: "https://example.com/image.png" };
			generateMock.mockResolvedValue(result);

			generationQueue.enqueue(makeJob("ok1"));
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

			generationQueue.enqueue(makeJob("err1"));
			await vi.runAllTimersAsync();

			const snap = generationQueue.getElementSnapshot("err1");
			expect(snap.status).toBe("idle");
			expect(snap.result).toBeNull();
			expect(snap.error).toBe("generation failed");
		});

		it("converts non-Error throws to string", async () => {
			generateMock.mockRejectedValue("string error");

			generationQueue.enqueue(makeJob("err2"));
			await vi.runAllTimersAsync();

			expect(generationQueue.getElementSnapshot("err2").error).toBe(
				"string error",
			);
		});
	});

	describe("cancel", () => {
		it("cancels a generating job and resets to idle", () => {
			generateMock.mockReturnValue(new Promise(() => {}));
			generationQueue.enqueue(makeJob("c1"));
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
			generationQueue.enqueue(makeJob("c2"));
			await vi.runAllTimersAsync();
			expect(generationQueue.getElementSnapshot("c2").result).toEqual(result);

			// Re-enqueue and cancel during generation
			generateMock.mockReturnValue(new Promise(() => {}));
			generationQueue.enqueue(makeJob("c2"));
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
			generationQueue.enqueueAll([
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
			generationQueue.enqueueAll([
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
			generationQueue.enqueue(makeJob("d1"));

			generationQueue.discard("d1");
			const snap = generationQueue.getElementSnapshot("d1");
			expect(snap).toEqual({
				status: "idle",
				seconds: 0,
				result: null,
				error: null,
				resultInputs: null,
			});
		});

		it("promotes queued jobs when discarding a generating element", () => {
			generateMock.mockReturnValue(new Promise(() => {}));
			generationQueue.enqueueAll([
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

			generationQueue.enqueueAll([
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
			generationQueue.enqueue(makeJob("t1"));

			expect(generationQueue.getElementSnapshot("t1").seconds).toBe(0);

			await vi.advanceTimersByTimeAsync(3000);
			expect(generationQueue.getElementSnapshot("t1").seconds).toBeGreaterThan(
				0,
			);

			generationQueue.discard("t1");
		});
	});

	describe("before", () => {
		it("runs callback before jobs start generating", async () => {
			const order: string[] = [];
			const beforeProcess = vi.fn(async () => {
				order.push("beforeProcess");
			});
			generateMock.mockImplementation(async () => {
				order.push("generate");
				return { url: "https://example.com/img.png" };
			});

			generationQueue.before(beforeProcess).enqueue(makeJob("bp1"));
			await vi.runAllTimersAsync();

			expect(beforeProcess).toHaveBeenCalledOnce();
			expect(order).toEqual(["beforeProcess", "generate"]);
		});

		it("callback self-destructs after running", async () => {
			const beforeProcess = vi.fn(async () => {});
			generateMock.mockResolvedValue({
				url: "https://example.com/img.png",
			});

			generationQueue.before(beforeProcess).enqueue(makeJob("sd1"));
			await vi.runAllTimersAsync();

			// Enqueue another job without beforeProcess — callback should not run again
			generationQueue.enqueue(makeJob("sd2"));
			await vi.runAllTimersAsync();

			expect(beforeProcess).toHaveBeenCalledOnce();
		});

		it("is a no-op when a beforeProcess is already pending", async () => {
			const first = vi.fn(async () => {});
			const second = vi.fn(async () => {});
			generateMock.mockResolvedValue({
				url: "https://example.com/img.png",
			});

			generationQueue.before(first).before(second).enqueue(makeJob("noop1"));
			await vi.runAllTimersAsync();

			expect(first).toHaveBeenCalledOnce();
			expect(second).not.toHaveBeenCalled();
		});

		it("does not invoke callback twice on back-to-back enqueues", async () => {
			const beforeProcess = vi.fn(async () => {});
			generateMock.mockResolvedValue({
				url: "https://example.com/img.png",
			});

			// First enqueue registers and clears the before callback
			generationQueue.before(beforeProcess).enqueue(makeJob("re1"));
			// Second enqueue without .before() — should not re-trigger
			generationQueue.enqueue(makeJob("re2"));
			await vi.runAllTimersAsync();

			expect(beforeProcess).toHaveBeenCalledOnce();
		});

		it("allows a new before while a previous one is running", async () => {
			let resolveFirst: () => void = () => {};
			const firstPromise = new Promise<void>((r) => {
				resolveFirst = r;
			});
			const first = vi.fn(() => firstPromise);
			const second = vi.fn(async () => {});

			generateMock.mockResolvedValue({
				url: "https://example.com/img.png",
			});

			// Start processing with first before
			generationQueue.before(first).enqueue(makeJob("run1"));

			// While first is running, register second for the next batch
			generationQueue.before(second).enqueue(makeJob("run2"));

			// Complete the first before
			resolveFirst();
			await vi.runAllTimersAsync();

			expect(first).toHaveBeenCalledOnce();
			expect(second).toHaveBeenCalledOnce();
		});

		it("does not start jobs until before() resolves on concurrent enqueue", async () => {
			let resolveGate: () => void = () => {};
			const gate = new Promise<void>((r) => {
				resolveGate = r;
			});
			const beforeFn = vi.fn(() => gate);
			generateMock.mockResolvedValue({
				url: "https://example.com/img.png",
			});

			// First enqueue triggers before()
			generationQueue.before(beforeFn).enqueue(makeJob("g1"));

			// Second enqueue while before() is still pending — guard prevents re-entry
			generationQueue.enqueue(makeJob("g2"));

			// Nothing should be generating yet
			expect(generationQueue.getElementSnapshot("g1").status).toBe("queued");
			expect(generationQueue.getElementSnapshot("g2").status).toBe("queued");
			expect(generateMock).not.toHaveBeenCalled();

			resolveGate();
			await vi.runAllTimersAsync();

			// Both jobs should have completed after before() resolved
			expect(generateMock).toHaveBeenCalledTimes(2);
			expect(generationQueue.getElementSnapshot("g1").status).toBe("idle");
			expect(generationQueue.getElementSnapshot("g2").status).toBe("idle");
		});

		it("enqueue works normally without beforeProcess", async () => {
			generateMock.mockResolvedValue({
				url: "https://example.com/img.png",
			});

			generationQueue.enqueue(makeJob("plain1"));
			await vi.runAllTimersAsync();

			const snap = generationQueue.getElementSnapshot("plain1");
			expect(snap.status).toBe("idle");
			expect(snap.result).toEqual({
				url: "https://example.com/img.png",
			});
		});

		it("still drains the queue when before() rejects", async () => {
			const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
			const beforeFn = vi.fn().mockRejectedValue(new Error("before failed"));
			generateMock.mockResolvedValue({ url: "https://example.com/img.png" });

			generationQueue.before(beforeFn).enqueue(makeJob("after-fail"));
			await vi.runAllTimersAsync();

			expect(beforeFn).toHaveBeenCalledOnce();
			expect(generateMock).toHaveBeenCalledOnce();
			const snap = generationQueue.getElementSnapshot("after-fail");
			expect(snap.status).toBe("idle");
			expect(snap.result).toEqual({ url: "https://example.com/img.png" });
			expect(errorSpy).toHaveBeenCalled();
			errorSpy.mockRestore();
		});
	});
});
