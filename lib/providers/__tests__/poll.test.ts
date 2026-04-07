import { describe, expect, it, vi } from "vitest";
import { awaitCompletion } from "../poll";
import type { VideoJob, VideoJobStatus } from "@/lib/connectors/types";

function makeJob(status: VideoJobStatus, url?: string): VideoJob {
  return { jobId: "j1", status, url };
}

describe("awaitCompletion", () => {
  it("returns immediately when job is already completed", async () => {
    const poll = vi
      .fn()
      .mockResolvedValue(makeJob("completed", "https://x.com/v.mp4"));
    const result = await awaitCompletion(poll, "j1");
    expect(result.status).toBe("completed");
    expect(result.url).toBe("https://x.com/v.mp4");
    expect(poll).toHaveBeenCalledTimes(1);
  });

  it("returns immediately when job has failed", async () => {
    const poll = vi.fn().mockResolvedValue(makeJob("failed"));
    const result = await awaitCompletion(poll, "j1");
    expect(result.status).toBe("failed");
    expect(poll).toHaveBeenCalledTimes(1);
  });

  it("polls until job completes", async () => {
    const poll = vi
      .fn()
      .mockResolvedValueOnce(makeJob("processing"))
      .mockResolvedValueOnce(makeJob("processing"))
      .mockResolvedValueOnce(makeJob("completed", "https://x.com/done.mp4"));

    const result = await awaitCompletion(poll, "j1", 10, 5000);
    expect(result.status).toBe("completed");
    expect(poll).toHaveBeenCalledTimes(3);
  });

  it("throws on timeout", async () => {
    const poll = vi.fn().mockResolvedValue(makeJob("processing"));
    await expect(awaitCompletion(poll, "j1", 10, 50)).rejects.toThrow(
      "timed out",
    );
  });

  it("passes jobId to pollFn", async () => {
    const poll = vi.fn().mockResolvedValue(makeJob("completed"));
    await awaitCompletion(poll, "my-job-id");
    expect(poll).toHaveBeenCalledWith("my-job-id");
  });

  it("propagates pollFn errors", async () => {
    const poll = vi.fn().mockRejectedValue(new Error("network error"));
    await expect(awaitCompletion(poll, "j1")).rejects.toThrow("network error");
  });
});
