import { beforeEach, describe, expect, it, vi } from "vitest";
import { OpenSlopAnimatedImage } from "../animated_image/openslop";

const config = {
	defaultModel: "test-model",
	models: ["test-model"],
	isDefault: true,
	apiKey: "",
};

describe("BaseAnimatedImageConnector", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("forwards the still frame from its dependency without calling the gateway", async () => {
		const fetch = vi.spyOn(globalThis, "fetch");
		const result = await new OpenSlopAnimatedImage(config).generate({
			prompt: "a dark forest",
			frameImages: ["https://example.com/still.png"],
		});
		expect(result).toEqual({
			imageUrl: "https://example.com/still.png",
			durationSec: 0,
		});
		expect(fetch).not.toHaveBeenCalled();
	});

	it("throws when the still dependency produced no frame", async () => {
		await expect(
			new OpenSlopAnimatedImage(config).generate({ prompt: "a dark forest" }),
		).rejects.toThrow(/still frame/);
	});
});
