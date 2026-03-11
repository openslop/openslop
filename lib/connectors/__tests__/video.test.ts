import { describe, expect, it, vi, beforeEach } from "vitest";
import { OpenSlopVideo } from "../video/openslop";
import type { ConnectorPlugin } from "../types";

function mockJsonResponse(data: unknown) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

const jobResponse = {
  jobId: "j1",
  status: "completed",
  resultUrl: "https://v.mp4",
};

describe("BaseVideoConnector", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockJsonResponse(jobResponse),
    );
  });

  it("generates a video job", async () => {
    const connector = new OpenSlopVideo({ provider: "openslop", apiKey: "" });
    const result = await connector.generate({ prompt: "a sunset" });
    expect(result.status).toBe("completed");
    expect(result.jobId).toBeTruthy();
  });

  it("polls a job", async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockJsonResponse({ jobId: "job-123", status: "completed" }),
    );
    const connector = new OpenSlopVideo({ provider: "openslop", apiKey: "" });
    const result = await connector.poll("job-123");
    expect(result.jobId).toBe("job-123");
    expect(result.status).toBe("completed");
  });

  it("runs plugins in order", async () => {
    const order: string[] = [];
    const plugin: ConnectorPlugin = {
      name: "tracker",
      transformPrompt: (p) => {
        order.push("transform");
        return p;
      },
      beforeGenerate: (p) => {
        order.push("before");
        return p;
      },
      afterGenerate: (r) => {
        order.push("after");
        return r;
      },
    };
    const connector = new OpenSlopVideo({
      provider: "openslop",
      apiKey: "",
      plugins: [plugin],
    });
    await connector.generate({ prompt: "test" });
    expect(order).toEqual(["transform", "before", "after"]);
  });

  it("runs onError plugin on failure", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("video failed"));
    const errors: string[] = [];

    const connector = new OpenSlopVideo({
      provider: "openslop",
      apiKey: "",
      plugins: [
        { name: "err", onError: (e: Error) => void errors.push(e.message) },
      ],
    });

    await expect(connector.generate({ prompt: "test" })).rejects.toThrow();
    expect(errors).toEqual(["video failed"]);
  });
});
