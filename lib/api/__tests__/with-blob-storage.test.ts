import { describe, expect, it, vi } from "vitest";
import { withBlobStorage } from "../with-blob-storage";
import type { BaseProvider } from "@/lib/providers/base";
import type { BundleFile, BundleResponse } from "../asset-bundle";

vi.mock("../asset-bundle", () => ({
  AssetBundle: {
    upload: vi.fn().mockResolvedValue({
      id: "abc123",
      provider: "test",
      result: { image: "output.png" },
    } satisfies BundleResponse),
  },
}));

type TestParams = { prompt: string };
type TestResult = { data: string; format: string };

function makeProvider(
  result: TestResult,
): BaseProvider<TestParams, TestResult> {
  return {
    generate: vi.fn().mockResolvedValue(result),
  };
}

function toFiles(r: TestResult): BundleFile[] {
  return [
    {
      key: "image",
      filename: `output.${r.format}`,
      data: Buffer.from(r.data, "base64"),
      contentType: `image/${r.format}`,
    },
  ];
}

describe("withBlobStorage", () => {
  it("wraps generate to upload result files and return a BundleResponse", async () => {
    const inner = makeProvider({ data: "aGVsbG8=", format: "png" });
    const wrapped = withBlobStorage(
      inner,
      { type: "image", provider: "test" },
      toFiles,
    );

    const result = await wrapped.generate({ prompt: "a cat" });

    expect(inner.generate).toHaveBeenCalledWith({ prompt: "a cat" });
    expect(result).toEqual({
      id: "abc123",
      provider: "test",
      result: { image: "output.png" },
    });
  });

  it("calls AssetBundle.upload with correct type and provider", async () => {
    const { AssetBundle } = await import("../asset-bundle");
    const inner = makeProvider({ data: "aGVsbG8=", format: "png" });
    const wrapped = withBlobStorage(
      inner,
      { type: "video", provider: "runware" },
      toFiles,
    );

    await wrapped.generate({ prompt: "a dog" });

    expect(AssetBundle.upload).toHaveBeenCalledWith(
      "video",
      "runware",
      expect.any(Array),
    );
  });

  it("supports async toFiles function", async () => {
    const inner = makeProvider({ data: "aGVsbG8=", format: "jpg" });
    const asyncToFiles = async (r: TestResult): Promise<BundleFile[]> => {
      return toFiles(r);
    };
    const wrapped = withBlobStorage(
      inner,
      { type: "image", provider: "test" },
      asyncToFiles,
    );

    const result = await wrapped.generate({ prompt: "async test" });
    expect(result.id).toBe("abc123");
  });

  it("propagates errors from the inner provider", async () => {
    const inner: BaseProvider<TestParams, TestResult> = {
      generate: vi.fn().mockRejectedValue(new Error("provider down")),
    };
    const wrapped = withBlobStorage(
      inner,
      { type: "image", provider: "test" },
      toFiles,
    );

    await expect(wrapped.generate({ prompt: "fail" })).rejects.toThrow(
      "provider down",
    );
  });
});
