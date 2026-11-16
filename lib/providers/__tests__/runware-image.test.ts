import { describe, expect, it, vi } from "vitest";

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

import { RunwareImage } from "../image/runware";
import { spyAssetBundle } from "./_asset-bundle";

const MODEL = "bytedance:seedream@5.0-lite";

describe("RunwareImage", () => {
	const { upload } = spyAssetBundle();

	it("generates an image with defaults", async () => {
		mockImageInference.mockResolvedValue([
			{ imageBase64Data: "abc123", cost: 0.02, seed: 1 },
		]);

		const provider = new RunwareImage("test-key");
		const result = await provider.generate({ prompt: "a cat", model: MODEL });

		expect(result.output.result.image).toBe("output.jpg");
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

	it("points each character at its avatar by position, avatars ahead of the other reference images", async () => {
		mockImageInference.mockResolvedValue([
			{ imageBase64Data: "abc", cost: 0.02 },
		]);

		await new RunwareImage("test-key").generate({
			prompt: "{{Red}} hands {{Wolf}} a cup and {{Granny}} smiles",
			model: MODEL,
			characterAssets: [
				{ name: "Red", avatarUrl: "https://img/red.png" },
				{ name: "Granny", voice: { url: "https://a/g.mp3", durationSec: 3 } },
				{ name: "Wolf", avatarUrl: "https://img/wolf.png" },
			],
			referenceImages: ["https://img/style.png"],
		});

		expect(mockImageInference).toHaveBeenCalledWith(
			expect.objectContaining({
				positivePrompt:
					"the character from Image 1 hands the character from Image 2 a cup and Granny smiles",
				inputs: {
					referenceImages: [
						"https://img/red.png",
						"https://img/wolf.png",
						"https://img/style.png",
					],
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
		expect(upload).toHaveBeenCalledWith(
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
