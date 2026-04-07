import { describe, expect, it, vi, beforeEach } from "vitest";
import { AssetBundle } from "../asset-bundle";
import type { AssetManifest, BundleFile } from "../asset-bundle";

const mockPut = vi.fn().mockResolvedValue({ url: "https://blob.test/file" });
vi.mock("@vercel/blob", () => ({
  put: (...args: unknown[]) => mockPut(...args),
}));

describe("AssetBundle", () => {
  beforeEach(() => {
    mockPut.mockClear();
    AssetBundle.baseUrl = "https://blob.test";
  });

  describe("resolve", () => {
    it("resolves a relative file path against the bundle URL", () => {
      const bundle = new AssetBundle("https://blob.test/assets/image/r/abc", {
        version: 1,
        type: "image",
        createdAt: "",
        result: { image: "output.png" },
      });

      expect(bundle.resolve("image")).toBe(
        "https://blob.test/assets/image/r/abc/output.png",
      );
    });

    it("returns an absolute URL as-is", () => {
      const bundle = new AssetBundle("https://blob.test/assets/image/r/abc", {
        version: 1,
        type: "image",
        createdAt: "",
        result: { video: "https://cdn.example.com/video.mp4" },
      });

      expect(bundle.resolve("video")).toBe("https://cdn.example.com/video.mp4");
    });

    it("throws for a missing key", () => {
      const bundle = new AssetBundle("https://blob.test/assets/image/r/abc", {
        version: 1,
        type: "image",
        createdAt: "",
        result: {},
      });

      expect(() => bundle.resolve("missing")).toThrow(
        'No file "missing" in asset bundle',
      );
    });
  });

  describe("buildUrl", () => {
    it("constructs the correct path", () => {
      expect(AssetBundle.buildUrl("image", "runware", "abc123")).toBe(
        "https://blob.test/assets/image/runware/abc123",
      );
    });

    it("handles empty baseUrl", () => {
      AssetBundle.baseUrl = "";
      expect(AssetBundle.buildUrl("video", "r", "x")).toBe("/assets/video/r/x");
    });
  });

  describe("fromResponse", () => {
    it("creates an AssetBundle from a BundleResponse", () => {
      const bundle = AssetBundle.fromResponse("image", {
        id: "abc",
        provider: "runware",
        result: { image: "output.png" },
      });

      expect(bundle.url).toBe("https://blob.test/assets/image/runware/abc");
      expect(bundle.manifest.type).toBe("image");
      expect(bundle.resolve("image")).toBe(
        "https://blob.test/assets/image/runware/abc/output.png",
      );
    });
  });

  describe("fromId", () => {
    it("fetches the manifest and creates a bundle", async () => {
      const manifest: AssetManifest = {
        version: 1,
        type: "image",
        createdAt: "2024-01-01",
        result: { image: "output.png" },
      };

      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(manifest),
        }),
      );

      const bundle = await AssetBundle.fromId("image", "runware", "abc");

      expect(fetch).toHaveBeenCalledWith(
        "https://blob.test/assets/image/runware/abc/manifest.json",
      );
      expect(bundle.manifest).toEqual(manifest);
      vi.unstubAllGlobals();
    });
  });

  describe("upload", () => {
    it("uploads files and returns a BundleResponse", async () => {
      const files: BundleFile[] = [
        {
          key: "image",
          filename: "output.png",
          data: Buffer.from("img"),
          contentType: "image/png",
        },
      ];

      const response = await AssetBundle.upload("image", "runware", files);

      expect(response.provider).toBe("runware");
      expect(response.result.image).toBe("output.png");
      expect(response.id).toBeTruthy();
      // 1 file + 1 manifest
      expect(mockPut).toHaveBeenCalledTimes(2);
    });

    it("handles external files by storing their URL directly", async () => {
      const files: BundleFile[] = [
        { key: "video", url: "https://cdn.example.com/video.mp4" },
      ];

      const response = await AssetBundle.upload("video", "runware", files);

      expect(response.result.video).toBe("https://cdn.example.com/video.mp4");
      // only the manifest is uploaded, not the external file
      expect(mockPut).toHaveBeenCalledTimes(1);
    });

    it("uploads manifest with correct structure", async () => {
      const files: BundleFile[] = [
        {
          key: "audio",
          filename: "output.mp3",
          data: Buffer.from("audio"),
          contentType: "audio/mpeg",
        },
      ];

      await AssetBundle.upload("music", "elevenlabs", files);

      const manifestCall = mockPut.mock.calls.find(
        (call: unknown[]) =>
          typeof call[0] === "string" && call[0].endsWith("manifest.json"),
      );
      if (!manifestCall) throw new Error("manifest upload not found");
      const manifest = JSON.parse(manifestCall[1] as string) as AssetManifest;
      expect(manifest.version).toBe(1);
      expect(manifest.type).toBe("music");
      expect(manifest.result.audio).toBe("output.mp3");
    });
  });
});
