import { beforeEach, describe, expect, it, vi } from "vitest";
import { ANIMATED_IMAGE_ATTRIBUTES } from "../animated_image/attributes";
import { HttpAnimatedImageConnector } from "../animated_image/connector";
import { DEFAULT_VIDEO_MODEL } from "../video/models";
import { mockGatewaySuccess } from "./_gateway-mock";

const VIDEO_URL = "https://cdn.example.com/v.mp4";

const config = {
	model: { provider: "openslop", model: "Slop Video v1" },
} as const;

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

		const result = await new HttpAnimatedImageConnector(config).generate({
			prompt: "slow zoom in",
			frameImages: ["https://example.com/still.png"],
		});

		expect(result).toEqual({ videoUrl: VIDEO_URL, durationSec: 5 });
		expect(fetch).toHaveBeenCalled();
	});

	it("keeps its own attribute schema rather than the video one", () => {
		expect(HttpAnimatedImageConnector.attributesFor(DEFAULT_VIDEO_MODEL)).toBe(
			ANIMATED_IMAGE_ATTRIBUTES,
		);
	});
});
