import { describe, expect, it, vi, beforeEach } from "vitest";

const mockDisconnect = vi.fn();
const mockVideoInference = vi.fn();
const mockGetResponse = vi.fn();

vi.mock("@runware/sdk-js", () => ({
  Runware: class {
    constructor() {
      return {
        videoInference: mockVideoInference,
        getResponse: mockGetResponse,
        disconnect: mockDisconnect,
      };
    }
  },
}));

import { RunwareVideo } from "../video/runware";

describe("RunwareVideo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("submit", () => {
    it("submits a video job with defaults", async () => {
      mockVideoInference.mockResolvedValue({
        taskUUID: "job-1",
        status: "processing",
        videoURL: undefined,
      });

      const provider = new RunwareVideo("test-key");
      const result = await provider.submit({ prompt: "a sunset" });

      expect(result).toEqual({
        jobId: "job-1",
        status: "processing",
        resultUrl: undefined,
      });
      expect(mockVideoInference).toHaveBeenCalledWith({
        positivePrompt: "a sunset",
        model: "bytedance:2@2",
        width: 512,
        height: 512,
        duration: 5,
        outputType: "URL",
        inputImage: undefined,
      });
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it("passes referenceImage as inputImage", async () => {
      mockVideoInference.mockResolvedValue({
        taskUUID: "job-2",
        status: "processing",
      });

      const provider = new RunwareVideo("test-key");
      await provider.submit({
        prompt: "animate this",
        referenceImage: "data:image/png;base64,abc123",
      });

      expect(mockVideoInference).toHaveBeenCalledWith(
        expect.objectContaining({
          inputImage: "data:image/png;base64,abc123",
        }),
      );
    });

    it("handles array response from videoInference", async () => {
      mockVideoInference.mockResolvedValue([
        {
          taskUUID: "job-arr",
          status: "completed",
          videoURL: "https://v.mp4",
        },
      ]);

      const provider = new RunwareVideo("test-key");
      const result = await provider.submit({ prompt: "test" });

      expect(result.jobId).toBe("job-arr");
      expect(result.resultUrl).toBe("https://v.mp4");
    });

    it("disconnects on error", async () => {
      mockVideoInference.mockRejectedValue(new Error("fail"));

      const provider = new RunwareVideo("test-key");
      await expect(provider.submit({ prompt: "test" })).rejects.toThrow("fail");
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  describe("poll", () => {
    it("returns job status", async () => {
      mockGetResponse.mockResolvedValue([
        {
          taskUUID: "job-1",
          status: "completed",
          videoURL: "https://result.mp4",
        },
      ]);

      const provider = new RunwareVideo("test-key");
      const result = await provider.poll("job-1");

      expect(result).toEqual({
        jobId: "job-1",
        status: "completed",
        resultUrl: "https://result.mp4",
      });
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it("throws when job not found", async () => {
      mockGetResponse.mockResolvedValue([]);

      const provider = new RunwareVideo("test-key");
      await expect(provider.poll("missing")).rejects.toThrow("Job not found");
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });
});
