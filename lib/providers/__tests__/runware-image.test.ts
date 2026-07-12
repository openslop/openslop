import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/api/asset-bundle");

const mockDisconnect = vi.fn();
const mockImageInference = vi.fn();

vi.mock("@runware/sdk-js", () => ({
	Runware: class {
		constructor() {
			return {
				imageInference: mockImageInference,
				disconnect: mockDisconnect,
			};
		}
	},
}));

import { AssetBundle } from "@/lib/api/asset-bundle";
import { RunwareImage } from "../image/runware";

describe("RunwareImage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("generates an image with defaults", async () => {
		mockImageInference.mockResolvedValue([
			{ imageBase64Data: "abc123", seed: 1 },
		]);

		const provider = new RunwareImage("test-key");
		const result = await provider.generate({ prompt: "a cat" });

		expect(result.result.image).toBe("url");
		expect(mockImageInference).toHaveBeenCalledWith({
			positivePrompt: "a cat",
			model: "bytedance:seedream@5.0-lite",
			width: 2848,
			height: 1600,
			outputType: "base64Data",
			outputFormat: "PNG",
			numberResults: 1,
			referenceImages: undefined,
		});
		expect(mockDisconnect).toHaveBeenCalled();
	});

	it("requests PNG output so bytes match the png filename and mime type", async () => {
		mockImageInference.mockResolvedValue([{ imageBase64Data: "abc123" }]);

		const provider = new RunwareImage("test-key");
		await provider.generate({ prompt: "a cat" });

		// Runware defaults to JPG when outputFormat is omitted, but the bundle
		// labels the asset image/png. The request must pin PNG so the persisted
		// bytes actually match the declared filename and content type.
		expect(mockImageInference).toHaveBeenCalledWith(
			expect.objectContaining({ outputFormat: "PNG" }),
		);

		const files = vi.mocked(AssetBundle.upload).mock.calls[0][2];
		expect(files).toEqual([
			expect.objectContaining({
				key: "image",
				filename: "output.png",
				contentType: "image/png",
			}),
		]);
	});

	it("passes custom dimensions and model", async () => {
		mockImageInference.mockResolvedValue([{ imageBase64Data: "data" }]);

		const provider = new RunwareImage("test-key");
		await provider.generate({
			prompt: "sunset",
			model: "custom-model",
			width: 1024,
			height: 768,
		});

		expect(mockImageInference).toHaveBeenCalledWith(
			expect.objectContaining({
				model: "custom-model",
				width: 1024,
				height: 768,
			}),
		);
	});

	it("throws when no image data returned", async () => {
		mockImageInference.mockResolvedValue([{}]);

		const provider = new RunwareImage("test-key");
		await expect(provider.generate({ prompt: "test" })).rejects.toThrow(
			"No image data returned",
		);
		expect(mockDisconnect).toHaveBeenCalled();
	});

	it("throws and disconnects when inference fails", async () => {
		mockImageInference.mockRejectedValue(new Error("API error"));

		const provider = new RunwareImage("test-key");
		await expect(provider.generate({ prompt: "test" })).rejects.toThrow(
			"API error",
		);
		expect(mockDisconnect).toHaveBeenCalled();
	});
});
