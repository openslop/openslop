import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { ConnectorConfig } from "@/lib/connectors/types";
import type { GenerationJob } from "../queue";

type GenerateFn = (...args: unknown[]) => Promise<unknown>;
let generateMock: ReturnType<typeof vi.fn<GenerateFn>>;

vi.mock("../generateForElement", () => ({
  generateForElement: (...args: unknown[]) => generateMock(...args),
}));

// Re-import after mock so the module picks up the mocked dependency.
// We construct fresh instances via the class, not the singleton, to avoid
// cross-test pollution. The class isn't exported, so we import the module
// and use the exported singleton's constructor trick — but actually the
// simplest approach is to just clear the singleton between tests.

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

// We need to create fresh queue instances. The module exports a singleton,
// but we can test it by importing the module and resetting between tests.
// Since the class isn't exported, we'll work with the singleton and reset
// its state by cancelling everything and discarding all elements.
import { generationQueue } from "../queue";

describe("GenerationQueue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    generateMock = vi.fn();
  });

  afterEach(() => {
    generationQueue.cancelAll();
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
      let resolve1: (v: { url: string }) => void;
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
      resolve1!({ url: "done" });
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
});
