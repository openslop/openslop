import { describe, expect, it } from "vitest";
import { videoAttributesFor } from "../attributes";

describe("videoAttributesFor", () => {
	it.each([
		{ model: "Kling 3 Turbo", resolution: "720p" },
		{ model: "Kling 3 Omni Pro", resolution: "1080p" },
	])(
		"defaults $model to $resolution, the first it renders",
		({ model, resolution }) => {
			expect(
				videoAttributesFor({ provider: "runware", model }).defaultAttributes
					.resolution,
			).toBe(resolution);
		},
	);
});
