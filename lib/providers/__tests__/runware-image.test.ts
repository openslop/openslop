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

const MODEL = "bytedance:seedream@5.0-lite";

describe("RunwareImage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("generates an image with defaults", async () => {
		mockImageInference.mockResolvedValue([
			{ imageBase64Data: "abc123", cost: 0.02, seed: 1 },
		]);

		const provider = new RunwareImage("test-key");
		const result = await provider.generate({ prompt: "a cat", model: MODEL });

		expect(result.output.result.image).toBe("url");
		expect(mockImageInference).toHaveBeenCalledWith({
			positivePrompt: "a cat",
			model: MODEL,
			width: 2560,
			height: 1440,
			outputType: "base64Data",
			outputFormat: "JPG",
			numberResults: 1,
			includeCost: true,
		});
		expect(mockDisconnect).toHaveBeenCalled();
	});

	it("names the characters plainly, their avatars ahead of the other reference images", async () => {
		mockImageInference.mockResolvedValue([
			{ imageBase64Data: "abc", cost: 0.02 },
		]);

		await new RunwareImage("test-key").generate({
			prompt: "{{Red}} pets a cat",
			model: MODEL,
			characterAssets: [{ name: "Red", avatarUrl: "https://img/red.png" }],
			referenceImages: ["https://img/style.png"],
		});

		expect(mockImageInference).toHaveBeenCalledWith(
			expect.objectContaining({
				positivePrompt: "Red pets a cat",
				inputs: {
					referenceImages: ["https://img/red.png", "https://img/style.png"],
				},
			}),
		);
	});

	it("asks for the format it labels the bytes with", async () => {
		mockImageInference.mockResolvedValue([
			{ imageBase64Data: "abc", cost: 0.02 },
		]);

		await new RunwareImage("test-key").generate({
			prompt: "a cat",
			model: MODEL,
			format: "webp",
		});

		expect(mockImageInference).toHaveBeenCalledWith(
			expect.objectContaining({ outputFormat: "WEBP" }),
		);
		expect(AssetBundle.upload).toHaveBeenCalledWith(
			"image",
			"runware",
			[
				expect.objectContaining({
					filename: "output.webp",
					contentType: "image/webp",
				}),
			],
			undefined,
		);
	});

	it("passes custom dimensions", async () => {
		mockImageInference.mockResolvedValue([
			{ imageBase64Data: "data", cost: 0.02 },
		]);

		const provider = new RunwareImage("test-key");
		await provider.generate({
			prompt: "sunset",
			model: MODEL,
			width: 1024,
			height: 768,
		});

		expect(mockImageInference).toHaveBeenCalledWith(
			expect.objectContaining({ model: MODEL, width: 1024, height: 768 }),
		);
	});

	it("sizes a model at its own default resolution", async () => {
		mockImageInference.mockResolvedValue([
			{ imageBase64Data: "data", cost: 0.01 },
		]);

		await new RunwareImage("test-key").generate({
			prompt: "sunset",
			model: "meta:muse@image",
		});

		expect(mockImageInference).toHaveBeenCalledWith(
			expect.objectContaining({ width: 2048, height: 1152 }),
		);
	});

	it("fails on a resolution the model cannot render", async () => {
		await expect(
			new RunwareImage("test-key").generate({
				prompt: "sunset",
				model: "meta:muse@image",
				resolution: "1440p",
			}),
		).rejects.toThrow("meta:muse@image cannot render 1440p");
		expect(mockImageInference).not.toHaveBeenCalled();
	});

	it("throws when no image data returned", async () => {
		mockImageInference.mockResolvedValue([{}]);

		const provider = new RunwareImage("test-key");
		await expect(
			provider.generate({ prompt: "test", model: MODEL }),
		).rejects.toThrow("No image data returned");
		expect(mockDisconnect).toHaveBeenCalled();
	});

	it("throws and disconnects when inference fails", async () => {
		mockImageInference.mockRejectedValue(new Error("API error"));

		const provider = new RunwareImage("test-key");
		await expect(
			provider.generate({ prompt: "test", model: MODEL }),
		).rejects.toThrow("API error");
		expect(mockDisconnect).toHaveBeenCalled();
	});
});
