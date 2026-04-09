import { describe, expect, it, vi, beforeEach } from "vitest";
import { withBlobStorage } from "../with-blob-storage";
import { AssetBundle } from "../asset-bundle";
import type { BaseProvider } from "@/lib/providers/base";
import type { BundleResponse } from "../asset-bundle";

vi.mock("../asset-bundle", () => ({
  AssetBundle: {
    upload: vi.fn(),
  },
}));

type TestParams = { prompt: string };
type TestResult = { data: string; metadata?: { durationSec: number } };

function makeMockProvider(): BaseProvider<TestParams, TestResult> {
  return {
    generate: vi.fn().mockResolvedValue({
      data: "test-output",
      metadata: { durationSec: 10 },
    }),
  } as unknown as BaseProvider<TestParams, TestResult>;
}

const mockUploadResponse: BundleResponse = {
  id: "abc",
  provider: "test",
  result: { audio: "output.mp3" },
  metadata: { durationSec: 10 },
};

describe("withBlobStorage", () => {
  beforeEach(() => {
    vi.mocked(AssetBundle.upload).mockResolvedValue(mockUploadResponse);
  });

  it("calls the original provider generate and uploads files", async () => {
    const provider = makeMockProvider();
    const toFiles = vi
      .fn()
      .mockReturnValue([
        { key: "audio", filename: "output.mp3", data: Buffer.from("audio") },
      ]);

    const wrapped = withBlobStorage(
      provider,
      { type: "tts", provider: "test" },
      toFiles,
    );
    const result = await wrapped.generate({ prompt: "hello" });

    expect(provider.generate).toHaveBeenCalledWith({ prompt: "hello" });
    expect(toFiles).toHaveBeenCalledWith({
      data: "test-output",
      metadata: { durationSec: 10 },
    });
    expect(AssetBundle.upload).toHaveBeenCalledWith(
      "tts",
      "test",
      [{ key: "audio", filename: "output.mp3", data: Buffer.from("audio") }],
      { durationSec: 10 },
    );
    expect(result).toEqual(mockUploadResponse);
  });

  it("handles results without metadata", async () => {
    const provider = makeMockProvider();
    vi.mocked(provider.generate).mockResolvedValue({
      data: "no-meta",
    } as TestResult);
    const toFiles = vi.fn().mockReturnValue([]);

    const wrapped = withBlobStorage(
      provider,
      { type: "image", provider: "mock" },
      toFiles,
    );
    await wrapped.generate({ prompt: "test" });

    expect(AssetBundle.upload).toHaveBeenCalledWith(
      "image",
      "mock",
      [],
      undefined,
    );
  });

  it("supports async toFiles", async () => {
    const provider = makeMockProvider();
    const toFiles = vi
      .fn()
      .mockResolvedValue([
        { key: "image", filename: "out.png", data: Buffer.from("img") },
      ]);

    const wrapped = withBlobStorage(
      provider,
      { type: "image", provider: "runware" },
      toFiles,
    );
    await wrapped.generate({ prompt: "draw" });

    expect(toFiles).toHaveBeenCalled();
    expect(AssetBundle.upload).toHaveBeenCalled();
  });
});
