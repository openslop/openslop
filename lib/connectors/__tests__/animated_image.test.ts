import { beforeEach, describe, expect, it, vi } from "vitest";
import { OpenSlopAnimatedImage } from "../animated_image/openslop";
import { mockGatewaySuccess } from "./_gateway-mock";

const TEST_ID = "test-id";
const STILL_URL = `/assets/image/openslop/${TEST_ID}/output.png`;

const config = {
	defaultModel: "test-model",
	models: ["test-model"],
	isDefault: true,
	apiKey: "",
};

describe("BaseAnimatedImageConnector still reuse", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	const mockStill = () =>
		mockGatewaySuccess({
			id: TEST_ID,
			type: "image",
			provider: "openslop",
			result: { image: "output.png" },
		});

	const priorStill = (imageUrl: string, prompt: string) => ({
		result: { imageUrl, durationSec: 0 },
		resultInputs: { prompt, attributes: { videoPrompt: "slow zoom" } },
	});

	it("generates the still via the gateway when there is no prior", async () => {
		const fetch = mockStill();
		const result = await new OpenSlopAnimatedImage(config).generate({
			prompt: "a dark forest",
		});
		expect(result.imageUrl).toBe(STILL_URL);
		expect(fetch).toHaveBeenCalled();
	});

	it("reuses the prior still and skips the gateway when still inputs are unchanged", async () => {
		const fetch = vi.spyOn(globalThis, "fetch");
		const result = await new OpenSlopAnimatedImage(config).generate(
			{ prompt: "a dark forest", videoPrompt: "slow pan" },
			priorStill("https://example.com/prior.png", "a dark forest"),
		);
		expect(result).toEqual({
			imageUrl: "https://example.com/prior.png",
			durationSec: 0,
		});
		expect(fetch).not.toHaveBeenCalled();
	});

	it("regenerates the still when a still input changed", async () => {
		const fetch = mockStill();
		const result = await new OpenSlopAnimatedImage(config).generate(
			{ prompt: "a bright meadow", videoPrompt: "slow pan" },
			priorStill("https://example.com/prior.png", "a dark forest"),
		);
		expect(result.imageUrl).toBe(STILL_URL);
		expect(fetch).toHaveBeenCalled();
	});
});
