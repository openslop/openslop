import {
	describe,
	expect,
	it,
	vi,
	beforeEach,
	afterEach,
	type Mock,
} from "vitest";
import { pickThumbnailUrl } from "@/lib/project/thumbnail";
import type { AssetResult } from "@/lib/connectors/types";
import type { generateForElement } from "../generate-for-element";
import { GenerationQueue } from "../queue";
import { isNodeStale } from "../staleness";
import type { CommittedVersion } from "../versions";
import { inputsFor, jobNode as makeJob } from "./_graph";
import { toCaption } from "@/lib/captions/word-captions";

let generateMock: Mock<typeof generateForElement>;
const pending = () => new Promise<AssetResult>(() => {});

vi.mock("../generate-for-element", () => ({
	generateForElement: (...args: Parameters<typeof generateForElement>) =>
		generateMock(...args),
}));

let generationQueue: GenerationQueue;
let committed: Mock<(version: CommittedVersion) => void> = vi.fn();

describe("GenerationQueue", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		generateMock = vi.fn<typeof generateForElement>();
		committed = vi.fn();
		generationQueue = new GenerationQueue({ limits: { image: 3 } });
		generationQueue.onCommitted(committed);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("getElementSnapshot", () => {
		it("returns idle snapshot for unknown element", () => {
			const snapshot = generationQueue.getElementSnapshot("unknown-id");
			expect(snapshot).toEqual({
				status: "idle",
				startedAt: null,
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
			const unsubscribe = generationQueue.subscribe(listener);

			generateMock.mockReturnValue(pending());
			generationQueue.enqueueGraph([makeJob("sub-1")]);
			expect(listener).toHaveBeenCalled();

			const callCount = listener.mock.calls.length;
			unsubscribe();
			generationQueue.enqueueGraph([makeJob("sub-2")]);
			expect(listener).toHaveBeenCalledTimes(callCount);

			generationQueue.discard("sub-1");
			generationQueue.discard("sub-2");
		});
	});

	describe("enqueue", () => {
		it("sets element status to generating when under the concurrency limit", () => {
			generateMock.mockReturnValue(pending());
			generationQueue.enqueueGraph([makeJob("e1")]);

			const snapshot = generationQueue.getElementSnapshot("e1");
			expect(snapshot.status).toBe("generating");

			generationQueue.discard("e1");
		});

		it("sets element status to queued when at the concurrency limit", () => {
			generateMock.mockReturnValue(pending());

			generationQueue.enqueueGraph([
				makeJob("b1"),
				makeJob("b2"),
				makeJob("b3"),
			]);
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
			generateMock.mockReturnValue(pending());
			const queue = new GenerationQueue({ limits: { image: 1, tts: 2 } });

			queue.enqueueGraph([
				makeJob("i1"),
				makeJob("i2"),
				makeJob("t1", [], { connectorType: "tts" }),
				makeJob("t2", [], { connectorType: "tts" }),
			]);

			expect(queue.getElementSnapshot("i1").status).toBe("generating");
			expect(queue.getElementSnapshot("i2").status).toBe("queued");
			expect(queue.getElementSnapshot("t1").status).toBe("generating");
			expect(queue.getElementSnapshot("t2").status).toBe("generating");

			queue.cancelAll();
		});

		it("does not re-enqueue an element already in the queue", () => {
			generateMock.mockReturnValue(pending());
			const listener = vi.fn();
			generationQueue.subscribe(listener);

			generationQueue.enqueueGraph([makeJob("dup1")]);
			const firstCount = listener.mock.calls.length;

			generationQueue.enqueueGraph([makeJob("dup1")]);
			expect(listener).toHaveBeenCalledTimes(firstCount);

			generationQueue.discard("dup1");
		});
	});

	describe("enqueueGraph", () => {
		it("enqueues multiple roots at once", () => {
			generateMock.mockReturnValue(pending());
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
			generateMock.mockReturnValue(pending());
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
			const result = {
				imageUrl: "https://example.com/image.png",
				durationSec: 0,
			};
			generateMock.mockResolvedValue(result);

			generationQueue.enqueueGraph([makeJob("ok1")]);
			await vi.runAllTimersAsync();

			const snapshot = generationQueue.getElementSnapshot("ok1");
			expect(snapshot.status).toBe("idle");
			expect(snapshot.result).toEqual(result);
			expect(snapshot.error).toBeNull();
		});
	});

	describe("failed generation", () => {
		it("stores error message on failure", async () => {
			generateMock.mockRejectedValue(new Error("generation failed"));

			generationQueue.enqueueGraph([makeJob("err1")]);
			await vi.runAllTimersAsync();

			const snapshot = generationQueue.getElementSnapshot("err1");
			expect(snapshot.status).toBe("idle");
			expect(snapshot.result).toBeNull();
			expect(snapshot.error).toBe("generation failed");
		});

		it("converts non-Error throws to string", async () => {
			generateMock.mockRejectedValue("string error");

			generationQueue.enqueueGraph([makeJob("err2")]);
			await vi.runAllTimersAsync();

			expect(generationQueue.getElementSnapshot("err2").error).toBe(
				"string error",
			);
		});

		it("notifies subscribers when a job fails", async () => {
			generateMock.mockRejectedValue(new Error("boom"));
			generationQueue.enqueueGraph([makeJob("err3")]);
			const listener = vi.fn();
			generationQueue.subscribe(listener);

			await vi.runAllTimersAsync();

			expect(listener).toHaveBeenCalled();
			expect(generationQueue.getElementSnapshot("err3").error).toBe("boom");
		});
	});

	describe("cancel", () => {
		it("cancels a generating job and resets to idle", () => {
			generateMock.mockReturnValue(pending());
			generationQueue.enqueueGraph([makeJob("c1")]);
			expect(generationQueue.getElementSnapshot("c1").status).toBe(
				"generating",
			);

			generationQueue.cancel("c1");
			const snapshot = generationQueue.getElementSnapshot("c1");
			expect(snapshot.status).toBe("idle");
			expect(snapshot.result).toBeNull();
		});

		it("preserves previous result after cancellation", async () => {
			const result = {
				imageUrl: "https://example.com/prev.png",
				durationSec: 0,
			};
			generateMock.mockResolvedValue(result);
			generationQueue.enqueueGraph([makeJob("c2")]);
			await vi.runAllTimersAsync();
			expect(generationQueue.getElementSnapshot("c2").result).toEqual(result);

			generateMock.mockReturnValue(pending());
			generationQueue.enqueueGraph([makeJob("c2")]);
			generationQueue.cancel("c2");

			const snapshot = generationQueue.getElementSnapshot("c2");
			expect(snapshot.status).toBe("idle");
			expect(snapshot.result).toEqual(result);
		});

		it("is a no-op for elements not in the queue", () => {
			const listener = vi.fn();
			generationQueue.subscribe(listener);
			generationQueue.cancel("nonexistent");
			expect(listener).not.toHaveBeenCalled();
		});

		it("aborts the signal handed to the job so its poll stops", async () => {
			generateMock.mockReturnValue(pending());
			generationQueue.enqueueGraph([makeJob("c3")]);
			await vi.advanceTimersByTimeAsync(0);
			const signal = generateMock.mock.calls[0]?.[2];
			expect(signal?.aborted).toBe(false);

			generationQueue.cancel("c3");
			expect(signal?.aborted).toBe(true);
		});

		it("promotes queued jobs when a generating job is cancelled", () => {
			generateMock.mockReturnValue(pending());
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
			generateMock.mockReturnValue(pending());
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
			expect(generationQueue.getElementSnapshot("a4").status).toBe("idle");
		});

		it("aborts every in-flight job's signal", async () => {
			generateMock.mockReturnValue(pending());
			generationQueue.enqueueGraph([makeJob("a5"), makeJob("a6")]);
			await vi.advanceTimersByTimeAsync(0);
			const signals = generateMock.mock.calls.map((call) => call[2]);
			expect(signals).toHaveLength(2);

			generationQueue.cancelAll();
			expect(signals.every((signal) => signal?.aborted)).toBe(true);
		});
	});

	describe("discard", () => {
		it("removes element state entirely", () => {
			generateMock.mockReturnValue(pending());
			generationQueue.enqueueGraph([makeJob("d1")]);

			generationQueue.discard("d1");
			const snapshot = generationQueue.getElementSnapshot("d1");
			expect(snapshot).toEqual({
				status: "idle",
				startedAt: null,
				result: null,
				error: null,
				resultInputs: null,
				connectorType: null,
				pinned: false,
			});
		});

		it("promotes queued jobs when discarding a generating element", () => {
			generateMock.mockReturnValue(pending());
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

	describe("duplicate", () => {
		it("hands the copy the source's result, current against its dependencies", async () => {
			const still = makeJob("still");
			generateMock.mockImplementation(({ id }) =>
				Promise.resolve({ imageUrl: `${id}.png`, durationSec: 0 }),
			);
			generationQueue.enqueueGraph([makeJob("d1", [still])]);
			await vi.runAllTimersAsync();

			generationQueue.duplicate("d1", "d2");

			expect(generationQueue.getElementSnapshot("d2")).toEqual(
				generationQueue.getElementSnapshot("d1"),
			);
			expect(
				isNodeStale(makeJob("d2", [still], { prompt: "d1" }), generationQueue),
			).toBe(false);
		});

		it("keeps an upload pinned on the copy", () => {
			generationQueue.commitResult(
				makeJob("d3"),
				{ imageUrl: "up.png", durationSec: 0 },
				{ pinned: true },
			);

			generationQueue.duplicate("d3", "d4");

			expect(generationQueue.getElementSnapshot("d4").pinned).toBe(true);
		});

		it("lands the copy of an in-flight element idle", () => {
			generateMock.mockReturnValue(pending());
			generationQueue.enqueueGraph([makeJob("d5")]);

			generationQueue.duplicate("d5", "d6");

			expect(generationQueue.getElementSnapshot("d6").status).toBe("idle");
			expect(generationQueue.getActiveCount()).toBe(1);
			generationQueue.discard("d5");
		});

		it("announces the copy to its listeners", () => {
			const duplicated = vi.fn();
			generationQueue.onDuplicated(duplicated);

			generationQueue.duplicate("d7", "d8");

			expect(duplicated).toHaveBeenCalledWith({ fromId: "d7", toId: "d8" });
		});
	});

	describe("setError", () => {
		it("sets an error on an element", () => {
			generationQueue.setError("se1", "something went wrong");
			const snapshot = generationQueue.getElementSnapshot("se1");
			expect(snapshot.error).toBe("something went wrong");
			expect(snapshot.result).toBeNull();

			generationQueue.discard("se1");
		});
	});

	describe("commitResult", () => {
		it("sets result, connectorType, clears error, and moves status to idle", () => {
			const result = {
				imageUrl: "https://example.com/upload.png",
				durationSec: 0,
			};
			const node = makeJob("sm1", [], inputsFor());
			generationQueue.commitResult(node, result);

			const snapshot = generationQueue.getElementSnapshot("sm1");
			expect(snapshot.status).toBe("idle");
			expect(snapshot.result).toEqual(result);
			expect(snapshot.error).toBeNull();
			expect(snapshot.resultInputs).toEqual(inputsFor());
			// Without this, pickThumbnailUrl skips the upload and the project card
			// stays blank (no job ran to set connectorType).
			expect(snapshot.connectorType).toBe("image");

			generationQueue.discard("sm1");
		});

		it("makes an uploaded-only image project's thumbnail resolve via pickThumbnailUrl", () => {
			generationQueue.commitResult(makeJob("scene-1", [], inputsFor("")), {
				imageUrl: "https://example.com/upload.png",
				durationSec: 0,
			});

			const thumbnail = pickThumbnailUrl(
				[
					{
						id: "scene-1",
						type: "image",
						children: [{ id: "scene-1-t", text: "" }],
					},
				],
				generationQueue,
			);
			expect(thumbnail).toBe("https://example.com/upload.png");

			generationQueue.discard("scene-1");
		});

		it("overwrites an existing generated result", async () => {
			const generated = {
				imageUrl: "https://example.com/generated.png",
				durationSec: 0,
			};
			generateMock.mockResolvedValue(generated);
			const inputs = inputsFor();
			generationQueue.enqueueGraph([makeJob("sm2", [], inputs)]);
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
			const snapshot = generationQueue.getElementSnapshot("sm3");
			expect(snapshot.error).toBeNull();
			expect(snapshot.result).toEqual(uploaded);

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
			const generated = Promise.withResolvers<AssetResult>();
			generateMock.mockReturnValue(generated.promise);
			const inputs = inputsFor();
			generationQueue.enqueueGraph([makeJob("sm6", [], inputs)]);
			expect(generationQueue.getElementSnapshot("sm6").status).toBe(
				"generating",
			);

			const uploaded = {
				imageUrl: "https://example.com/upload.png",
				durationSec: 0,
			};
			generationQueue.commitResult(makeJob("sm6", [], inputs), uploaded);
			expect(generationQueue.getElementSnapshot("sm6").result).toEqual(
				uploaded,
			);

			generated.resolve({
				imageUrl: "https://example.com/generated.png",
				durationSec: 0,
			});
			await vi.runAllTimersAsync();
			expect(generationQueue.getElementSnapshot("sm6").result).toEqual(
				uploaded,
			);

			generationQueue.discard("sm6");
		});
	});

	describe("reviseResult", () => {
		const spoken = {
			audioUrl: "https://example.com/line.wav",
			durationSec: 1,
			textTimestamps: [toCaption("hi", 0, 1)],
		};
		const edited = {
			...spoken,
			textTimestamps: [toCaption("hey", 0, 1)],
		};

		it("swaps in the edit under the inputs the result was made from, so it is no fresher than it", async () => {
			generateMock.mockResolvedValue(spoken);
			const made = inputsFor("hi");
			generationQueue.enqueueGraph([makeJob("rv1", [], made)]);
			await vi.runAllTimersAsync();

			generationQueue.reviseResult(
				{ id: "rv1", type: "narration" },
				() => edited,
			);

			expect(generationQueue.getElementSnapshot("rv1")).toMatchObject({
				result: edited,
				resultInputs: made,
				pinned: false,
			});
			expect(isNodeStale(makeJob("rv1", [], made), generationQueue)).toBe(
				false,
			);
			expect(committed).toHaveBeenLastCalledWith(
				expect.objectContaining({
					elementId: "rv1",
					result: edited,
					inputs: made,
				}),
			);
			generationQueue.discard("rv1");
		});

		it("refuses an element while a run would land over the edit", async () => {
			generateMock.mockResolvedValue(spoken);
			generationQueue.enqueueGraph([makeJob("rv3", [], inputsFor("hi"))]);
			await vi.runAllTimersAsync();
			generateMock.mockReturnValue(pending());
			generationQueue.enqueueGraph([makeJob("rv3", [], inputsFor("hi"))]);

			expect(() =>
				generationQueue.reviseResult(
					{ id: "rv3", type: "narration" },
					() => edited,
				),
			).toThrow(/generating/);
			generationQueue.discard("rv3");
		});

		it("refuses an element with no result to edit", () => {
			expect(() =>
				generationQueue.reviseResult(
					{ id: "rv2", type: "narration" },
					() => edited,
				),
			).toThrow(/nothing here to edit/);
		});
	});

	describe("a node that lands", () => {
		const landing = (revise: (current: AssetResult) => AssetResult) => ({
			...makeJob("pass"),
			lands: { on: { id: "lr1", type: "image" as const }, revise },
		});

		beforeEach(async () => {
			generateMock.mockResolvedValue({ imageUrl: "a.png", durationSec: 0 });
			generationQueue.enqueueGraph([makeJob("lr1")]);
			await vi.runAllTimersAsync();
			committed.mockClear();
		});

		it("revises its target under the target's inputs and keeps nothing of its own", async () => {
			const made = generationQueue.getElementSnapshot("lr1").resultInputs;
			generateMock.mockResolvedValue({ imageUrl: "b.png", durationSec: 0 });
			generationQueue.enqueueGraph([
				landing((current) => ({ ...current, imageUrl: "c.png" })),
			]);
			await vi.runAllTimersAsync();

			expect(generationQueue.getElementSnapshot("lr1")).toMatchObject({
				result: { imageUrl: "c.png" },
				resultInputs: made,
			});
			expect(generationQueue.getElementSnapshot("pass").status).toBe("idle");
			expect(committed.mock.calls.map(([v]) => v.elementId)).toEqual(["lr1"]);
		});

		it("puts a revise that throws on itself, leaving the target alone", async () => {
			generationQueue.enqueueGraph([
				landing(() => {
					throw new Error("moved on");
				}),
			]);
			await vi.runAllTimersAsync();

			expect(generationQueue.getElementSnapshot("lr1").result).toMatchObject({
				imageUrl: "a.png",
			});
			expect(generationQueue.getElementSnapshot("pass").error).toBe("moved on");
			expect(committed).not.toHaveBeenCalled();
		});
	});

	describe("restoreResult", () => {
		it("shows a result supplied for inputs the element has drifted from", async () => {
			const result = {
				imageUrl: "https://example.com/asset.png",
				durationSec: 0,
			};
			generateMock.mockResolvedValue(result);
			const inputs = inputsFor("p", { a: "1", b: "2" });
			generationQueue.enqueueGraph([makeJob("rr1", [], inputs)]);
			await vi.runAllTimersAsync();
			generationQueue.setError("rr1", "stale");
			expect(generationQueue.getElementSnapshot("rr1").result).toBeNull();

			generationQueue.restoreResult({
				elementId: "rr1",
				elementType: "image",
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
			const inputs = inputsFor();
			generationQueue.enqueueGraph([makeJob("rr2", [], inputs)]);
			await vi.runAllTimersAsync();

			generateMock.mockReturnValue(pending());
			generationQueue.enqueueGraph([
				makeJob("rr2", [], { ...inputs, prompt: "next" }),
			]);
			await vi.advanceTimersByTimeAsync(0);

			generationQueue.restoreResult({
				elementId: "rr2",
				elementType: "image",
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
			const shared = inputsFor();
			generateMock.mockResolvedValue({ imageUrl: "gen.png", durationSec: 0 });
			generationQueue.enqueueGraph([makeJob("rr3", [], shared)]);
			await vi.runAllTimersAsync();
			expect(generationQueue.getElementSnapshot("rr3").pinned).toBe(false);

			generationQueue.restoreResult({
				elementId: "rr3",
				elementType: "image",
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
			const shared = inputsFor();
			generationQueue.commitResult(
				makeJob("rr4", [], shared),
				{ imageUrl: "https://example.com/up.png", durationSec: 0 },
				{ pinned: true },
			);
			expect(generationQueue.getElementSnapshot("rr4").pinned).toBe(true);

			generationQueue.restoreResult({
				elementId: "rr4",
				elementType: "image",
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
			const first = Promise.withResolvers<AssetResult>();
			generateMock
				.mockReturnValueOnce(first.promise)
				.mockReturnValueOnce(pending())
				.mockReturnValueOnce(pending())
				.mockReturnValueOnce(pending());

			generationQueue.enqueueGraph([
				makeJob("q1"),
				makeJob("q2"),
				makeJob("q3"),
				makeJob("q4"),
			]);

			expect(generationQueue.getElementSnapshot("q4").status).toBe("queued");

			first.resolve({ imageUrl: "done", durationSec: 0 });
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

	describe("startedAt", () => {
		it("is stamped when the job starts", () => {
			vi.setSystemTime(1_000);
			generateMock.mockReturnValue(pending());
			generationQueue.enqueueGraph([makeJob("t1")]);

			expect(generationQueue.getElementSnapshot("t1").startedAt).toBe(1_000);

			generationQueue.discard("t1");
		});
	});

	describe("committed versions", () => {
		const generate = async (id: string, imageUrl: string) => {
			generateMock.mockResolvedValue({ imageUrl, durationSec: 0 });
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
					result: { imageUrl: "first.png", durationSec: 0 },
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

	describe("new results", () => {
		let newResult: Mock<(elementId: string) => void>;
		const image = { imageUrl: "a.png", durationSec: 0 };

		beforeEach(() => {
			newResult = vi.fn();
			generationQueue.onNewResult(newResult);
		});

		it("announces a generated, uploaded or restored result", async () => {
			generateMock.mockResolvedValue(image);
			generationQueue.enqueueGraph([makeJob("r1")]);
			await vi.runAllTimersAsync();
			generationQueue.commitResult(makeJob("r2"), image, { pinned: true });
			generationQueue.restoreResult({
				elementId: "r3",
				elementType: "image",
				connectorType: "image",
				inputs: inputsFor("p"),
				result: image,
				pinned: false,
			});

			expect(newResult.mock.calls.flat()).toEqual(["r1", "r2", "r3"]);
		});

		it("stays quiet when a result is only revised", async () => {
			generateMock.mockResolvedValue(image);
			generationQueue.enqueueGraph([makeJob("r1")]);
			await vi.runAllTimersAsync();
			newResult.mockClear();

			generationQueue.reviseResult({ id: "r1", type: "image" }, (current) => ({
				...current,
				imageUrl: "b.png",
			}));

			expect(newResult).not.toHaveBeenCalled();
		});
	});

	describe("snapshot", () => {
		const idleEntry = {
			status: "idle" as const,
			startedAt: null,
			result: { imageUrl: "u", durationSec: 2 },
			error: null,
			resultInputs: inputsFor(),
			connectorType: "image" as const,
			pinned: false,
		};

		it("dumps every entry verbatim", async () => {
			generateMock.mockResolvedValue(idleEntry.result);
			generationQueue.enqueueGraph([makeJob("s1", [], idleEntry.resultInputs)]);
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
					startedAt: null,
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
			startedAt: null,
			result: { imageUrl: "u", durationSec: 2 },
			error: null,
			resultInputs: inputsFor(),
			connectorType: "image" as const,
			pinned: false,
		};

		it("populates entries from the constructor", () => {
			const queue = new GenerationQueue({
				initialState: { h1: idleEntry },
			});
			expect(queue.getElementSnapshot("h1")).toEqual(idleEntry);
		});

		it("normalizes stale 'generating' status back to idle", () => {
			const queue = new GenerationQueue({
				initialState: {
					h2: { ...idleEntry, status: "generating" },
				},
			});
			const snapshot = queue.getElementSnapshot("h2");
			expect(snapshot.status).toBe("idle");
			expect(snapshot.startedAt).toBeNull();
		});

		it("keeps staleness correct after rehydration", () => {
			const queue = new GenerationQueue({
				initialState: { h3: idleEntry },
			});

			expect(
				isNodeStale(makeJob("h3", [], idleEntry.resultInputs), queue),
			).toBe(false);
			expect(
				isNodeStale(makeJob("h3", [], inputsFor("different")), queue),
			).toBe(true);
		});
	});

	describe("progress counters", () => {
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
			const a = Promise.withResolvers<AssetResult>();
			const b = Promise.withResolvers<AssetResult>();
			generateMock
				.mockReturnValueOnce(a.promise)
				.mockReturnValueOnce(b.promise)
				.mockReturnValue(pending());

			generationQueue.enqueueGraph([makeJob("a"), makeJob("b"), makeJob("c")]);
			a.reject(new Error("boom"));
			await vi.advanceTimersByTimeAsync(0);

			// The failure has no result and is no longer active, so it drops out of
			// both counters rather than stranding the bar below 100%.
			expect(total()).toBe(2);
			expect(generationQueue.getGeneratedCount()).toBe(0);

			b.resolve({ imageUrl: "b", durationSec: 0 });
			await vi.advanceTimersByTimeAsync(0);

			expect(total()).toBe(2);
			expect(generationQueue.getGeneratedCount()).toBe(1);

			generationQueue.cancelAll();
		});

		it("keeps earlier completions counted when items are added mid-run", async () => {
			const a = Promise.withResolvers<AssetResult>();
			const b = Promise.withResolvers<AssetResult>();
			generateMock
				.mockReturnValueOnce(a.promise)
				.mockReturnValueOnce(b.promise)
				.mockReturnValue(pending());

			generationQueue.enqueueGraph([makeJob("a"), makeJob("b"), makeJob("c")]);
			a.resolve({ imageUrl: "a", durationSec: 0 });
			b.resolve({ imageUrl: "b", durationSec: 0 });
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
			const a = Promise.withResolvers<AssetResult>();
			generateMock.mockReturnValueOnce(a.promise).mockReturnValue(pending());

			generationQueue.enqueueGraph([makeJob("a")]);
			a.resolve({ imageUrl: "a", durationSec: 0 });
			await vi.advanceTimersByTimeAsync(0);

			expect(generationQueue.getActiveCount()).toBe(0);
			expect(generationQueue.getGeneratedCount()).toBe(1);
			expect(total()).toBe(1);

			generationQueue.enqueueGraph([makeJob("b")]);

			expect(generationQueue.getGeneratedCount()).toBe(1);
			expect(total()).toBe(2);

			generationQueue.cancelAll();
		});
	});

	describe("dependency ordering", () => {
		beforeEach(() => {
			generationQueue = new GenerationQueue({ limits: { image: 2 } });
		});

		const startedIds = () => generateMock.mock.calls.map(([node]) => node.id);

		it("holds a dependent until its own dependency resolves, not just any job", async () => {
			const aliceResult = Promise.withResolvers<AssetResult>();
			generateMock.mockImplementation(({ id }) => {
				if (id === "alice") return aliceResult.promise;
				return Promise.resolve({ imageUrl: `${id}.png`, durationSec: 0 });
			});

			const alice = makeJob("alice");
			const bob = makeJob("bob");
			const image = makeJob("image", [alice]);
			generationQueue.enqueueGraph([image, bob]);
			await vi.advanceTimersByTimeAsync(0);

			// Bob finishing frees a batch slot, but the image depends on Alice.
			expect(startedIds()).toEqual(["alice", "bob"]);
			expect(generationQueue.getElementSnapshot("image").status).toBe("queued");

			aliceResult.resolve({ imageUrl: "alice.png", durationSec: 0 });
			await vi.runAllTimersAsync();

			expect(startedIds()).toContain("image");
		});

		it("queues a dependency two levels down", () => {
			generateMock.mockImplementation(pending);

			const avatar = makeJob("alice");
			const frame = makeJob("img", [avatar]);
			generationQueue.enqueueGraph([makeJob("vid-1", [frame])]);

			expect(generationQueue.getElementSnapshot("alice").status).not.toBe(
				"idle",
			);
			expect(generationQueue.getElementSnapshot("img").status).not.toBe("idle");
			expect(generationQueue.getElementSnapshot("vid-1").status).toBe("queued");
		});

		it("visits a dependency shared by two roots once", () => {
			generateMock.mockImplementation(pending);

			const avatar = makeJob("alice");
			generationQueue.enqueueGraph([
				makeJob("a", [avatar]),
				makeJob("b", [avatar]),
			]);

			expect(generationQueue.getActiveCount()).toBe(3);
		});

		it("passes resolved dependency results to the dependent's job", async () => {
			generateMock.mockImplementation(({ id }) =>
				Promise.resolve({
					imageUrl: `${id}.png`,
					durationSec: 0,
				}),
			);

			const avatar = makeJob("alice");
			generationQueue.enqueueGraph([makeJob("image", [avatar])]);
			await vi.runAllTimersAsync();

			const imageCall = generateMock.mock.calls.find(
				([node]) => node.id === "image",
			);
			expect(imageCall?.[1]).toEqual({
				alice: { imageUrl: "alice.png", durationSec: 0 },
			});
		});

		it("does not mark a freshly generated dependent stale", async () => {
			generateMock.mockImplementation(({ id }) =>
				Promise.resolve({
					imageUrl: `${id}.png`,
					durationSec: 0,
				}),
			);

			const alice = makeJob("alice");
			const image = makeJob("image", [alice]);
			generationQueue.enqueueGraph([image, makeJob("bob")]);
			await vi.runAllTimersAsync();

			expect(generationQueue.getElementSnapshot("image").result).not.toBeNull();
			expect(isNodeStale(image, generationQueue)).toBe(false);
		});

		it("skips a dependency that is already current", async () => {
			generateMock.mockResolvedValue({ imageUrl: "x.png", durationSec: 0 });
			const avatar = makeJob("alice");
			generationQueue.commitResult(avatar, {
				imageUrl: "existing.png",
				durationSec: 0,
			});

			generationQueue.enqueueGraph([makeJob("image", [avatar])]);
			await vi.runAllTimersAsync();

			expect(startedIds()).toEqual(["image"]);
		});

		it("keeps a dependent's existing result when a dependency fails", async () => {
			generateMock.mockImplementation(({ id }) =>
				id === "alice"
					? Promise.reject(new Error("avatar boom"))
					: Promise.resolve({ imageUrl: "x.png", durationSec: 0 }),
			);
			vi.spyOn(console, "error").mockImplementation(() => {});

			const image = makeJob("image", [makeJob("alice")]);
			generationQueue.commitResult(image, {
				imageUrl: "existing.png",
				durationSec: 0,
			});
			generationQueue.enqueueGraph([makeJob("alice")]);
			await vi.runAllTimersAsync();
			generationQueue.enqueueGraph([image]);
			await vi.runAllTimersAsync();

			// The image never ran, so the URL it already held is still good.
			const snapshot = generationQueue.getElementSnapshot("image");
			expect(snapshot.result?.imageUrl).toBe("existing.png");
			expect(snapshot.status).toBe("idle");
			expect(snapshot.error).toMatch(/boom/);
		});

		it("releases a dependent that can never run instead of leaving it queued", async () => {
			generateMock.mockImplementation(({ id }) =>
				id === "alice"
					? Promise.reject(new Error("avatar boom"))
					: Promise.resolve({ imageUrl: "x.png", durationSec: 0 }),
			);
			vi.spyOn(console, "error").mockImplementation(() => {});

			generationQueue.enqueueGraph([makeJob("image", [makeJob("alice")])]);
			await vi.runAllTimersAsync();

			expect(generationQueue.getElementSnapshot("image").status).toBe("idle");
			expect(generationQueue.getElementSnapshot("alice").error).toMatch(/boom/);
			expect(generationQueue.isBusy()).toBe(false);
		});

		it("reports a failed dependency on the dependent that was waiting on it", async () => {
			generateMock.mockImplementation(({ id }) =>
				id === "alice"
					? Promise.reject(new Error("avatar boom"))
					: Promise.resolve({ imageUrl: "x.png", durationSec: 0 }),
			);
			vi.spyOn(console, "error").mockImplementation(() => {});

			generationQueue.enqueueGraph([makeJob("image", [makeJob("alice")])]);
			await vi.runAllTimersAsync();

			expect(generationQueue.getElementSnapshot("image").error).toMatch(
				/avatar boom/,
			);
		});

		it("carries a failure across a chain of blocked dependencies", async () => {
			generateMock.mockImplementation(({ id }) =>
				id === "c"
					? Promise.reject(new Error("root boom"))
					: Promise.resolve({ imageUrl: "x.png", durationSec: 0 }),
			);
			vi.spyOn(console, "error").mockImplementation(() => {});

			generationQueue.enqueueGraph([
				makeJob("a", [makeJob("b", [makeJob("c")])]),
			]);
			await vi.runAllTimersAsync();

			expect(generationQueue.getElementSnapshot("b").error).toMatch(
				/root boom/,
			);
			expect(generationQueue.getElementSnapshot("a").error).toMatch(
				/root boom/,
			);
		});

		it("names the dependency a dependent is blocked by when it fails", async () => {
			generateMock.mockImplementation(({ id }) =>
				id === "alice"
					? Promise.reject(new Error("avatar boom"))
					: Promise.resolve({ imageUrl: "x.png", durationSec: 0 }),
			);
			vi.spyOn(console, "error").mockImplementation(() => {});

			generationQueue.enqueueGraph([makeJob("image", [makeJob("alice")])]);
			await vi.runAllTimersAsync();

			expect(generationQueue.getElementSnapshot("image").error).toBe(
				"alice failed: avatar boom",
			);
			expect(generationQueue.getElementSnapshot("alice").error).toBe(
				"avatar boom",
			);
		});

		it("names each dependency a failure passes through, outermost first", async () => {
			generateMock.mockImplementation(({ id }) =>
				id === "c"
					? Promise.reject(new Error("root boom"))
					: Promise.resolve({ imageUrl: "x.png", durationSec: 0 }),
			);
			vi.spyOn(console, "error").mockImplementation(() => {});

			generationQueue.enqueueGraph([
				makeJob("a", [makeJob("b", [makeJob("c")])]),
			]);
			await vi.runAllTimersAsync();

			expect(generationQueue.getElementSnapshot("a").error).toBe(
				"b failed: c failed: root boom",
			);
		});

		it("releases a dependent the moment its dependency fails, while unrelated jobs still run", async () => {
			const bob = Promise.withResolvers<AssetResult>();
			generateMock.mockImplementation(({ id }) => {
				if (id === "alice") return Promise.reject(new Error("avatar boom"));
				if (id === "bob") return bob.promise;
				return Promise.resolve({ imageUrl: `${id}.png`, durationSec: 0 });
			});
			vi.spyOn(console, "error").mockImplementation(() => {});

			generationQueue.enqueueGraph([
				makeJob("image", [makeJob("alice")]),
				makeJob("bob"),
			]);
			await vi.advanceTimersByTimeAsync(0);

			expect(generationQueue.getElementSnapshot("bob").status).toBe(
				"generating",
			);
			expect(generationQueue.getElementSnapshot("image")).toMatchObject({
				status: "idle",
				error: "alice failed: avatar boom",
			});

			bob.resolve({ imageUrl: "bob.png", durationSec: 0 });
			await vi.runAllTimersAsync();
			expect(generationQueue.isBusy()).toBe(false);
		});

		it("keeps a dependent queued while its dependency waits for a slot", async () => {
			generationQueue = new GenerationQueue({ limits: { image: 1 } });
			generateMock.mockImplementation(pending);

			generationQueue.enqueueGraph([
				makeJob("bob"),
				makeJob("image", [makeJob("alice")]),
			]);
			await vi.advanceTimersByTimeAsync(0);

			expect(startedIds()).toEqual(["bob"]);
			expect(generationQueue.getElementSnapshot("alice").status).toBe("queued");
			expect(generationQueue.getElementSnapshot("image").status).toBe("queued");
		});

		it("leaves no error on a dependent released for a reason other than failure", async () => {
			generateMock.mockResolvedValue({ imageUrl: "x.png", durationSec: 0 });

			generationQueue.enqueueGraph([makeJob("image", [makeJob("alice")])]);
			await vi.runAllTimersAsync();

			expect(generationQueue.getElementSnapshot("image").error).toBeNull();
		});
	});
});
