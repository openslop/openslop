import { describe, expect, it } from "vitest";
import { OpenSlopVideo } from "../video/openslop";
import type { ConnectorPlugin } from "../types";

describe("BaseVideoConnector", () => {
  it("generates a video job", async () => {
    const connector = new OpenSlopVideo({ provider: "openslop", apiKey: "" });
    const result = await connector.generate({ prompt: "a sunset" });
    expect(result.status).toBe("completed");
    expect(result.jobId).toBeTruthy();
  });

  it("polls a job", async () => {
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
    const errors: string[] = [];

    class FailingVideo extends OpenSlopVideo {
      protected async _generate(): Promise<never> {
        throw new Error("video failed");
      }
    }

    const connector = new FailingVideo({
      provider: "openslop",
      apiKey: "",
      plugins: [{ name: "err", onError: (e) => void errors.push(e.message) }],
    });

    await expect(connector.generate({ prompt: "test" })).rejects.toThrow();
    expect(errors).toEqual(["video failed"]);
  });
});
