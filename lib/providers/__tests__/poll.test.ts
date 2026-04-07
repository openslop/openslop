import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { awaitCompletion } from "../poll";
import type { VideoJob } from "@/lib/connectors/types";

function makeJob(status: VideoJob["status"]): VideoJob {
  return {
    jobId: "job-1",
    status,
    url: status === "completed" ? "https://example.com/video.mp4" : undefined,
  };
}

describe("awaitCompletion", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns immediately when the first poll returns completed", async () => {
    const pollFn = vi.fn().mockResolvedValue(makeJob("completed"));
    const result = await awaitCompletion(pollFn, "job-1");

    expect(result.status).toBe("completed");
    expect(pollFn).toHaveBeenCalledTimes(1);
  });

  it("returns immediately when the first poll returns failed", async () => {
    const pollFn = vi.fn().mockResolvedValue(makeJob("failed"));
    const result = await awaitCompletion(pollFn, "job-1");

    expect(result.status).toBe("failed");
    expect(pollFn).toHaveBeenCalledTimes(1);
  });

  it("polls until completion", async () => {
    const pollFn = vi
      .fn()
      .mockResolvedValueOnce(makeJob("processing"))
      .mockResolvedValueOnce(makeJob("processing"))
      .mockResolvedValue(makeJob("completed"));

    const promise = awaitCompletion(pollFn, "job-1", 100);

    await vi.advanceTimersByTimeAsync(100);
    await vi.advanceTimersByTimeAsync(100);

    const result = await promise;
    expect(result.status).toBe("completed");
    expect(pollFn).toHaveBeenCalledTimes(3);
  });

  it("throws on timeout", async () => {
    const pollFn = vi.fn().mockResolvedValue(makeJob("processing"));

    const promise = awaitCompletion(pollFn, "job-1", 50, 150);
    const rejection = expect(promise).rejects.toThrow("timed out");

    await vi.advanceTimersByTimeAsync(50);
    await vi.advanceTimersByTimeAsync(50);
    await vi.advanceTimersByTimeAsync(50);

    await rejection;
  });

  it("passes jobId to the poll function", async () => {
    const pollFn = vi.fn().mockResolvedValue(makeJob("completed"));
    await awaitCompletion(pollFn, "my-job-id");

    expect(pollFn).toHaveBeenCalledWith("my-job-id");
  });
});
