import { beforeEach, describe, expect, it, vi } from "vitest";
import { ANIMATED_IMAGE_ATTRIBUTES } from "../animated_image/attributes";
import { OpenSlopAnimatedImage } from "../animated_image/openslop";
import { mockGatewaySuccess } from "./_gateway-mock";

const VIDEO_URL = "https://cdn.example.com/v.mp4";

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

	// The animation is a video generation, so the connector resolves a video
	// bundle itself rather than chaining a second connector.
	it("generates the animation through its own video gateway", async () => {
		const fetch = mockGatewaySuccess({
			id: "test-id",
			type: "video",
			provider: "openslop",
			result: { video: VIDEO_URL },
			metadata: { durationSec: 5 },
		});

		const result = await new OpenSlopAnimatedImage(config).generate({
			prompt: "slow zoom in",
			frameImages: ["https://example.com/still.png"],
		});

		expect(result).toEqual({ videoUrl: VIDEO_URL, durationSec: 5 });
		expect(fetch).toHaveBeenCalled();
	});

	it("keeps its own attribute schema rather than the video one", () => {
		expect(OpenSlopAnimatedImage.attributesFor()).toBe(
			ANIMATED_IMAGE_ATTRIBUTES,
		);
	});
});
