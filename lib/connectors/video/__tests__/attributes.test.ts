import { describe, expect, it } from "vitest";
import { TOGGLE_OFF } from "@/lib/canvas/types";
import { videoAttributesFor } from "../attributes";

describe("videoAttributesFor", () => {
	it.each([
		{ model: "Seedance 2.5", resolution: "720p" },
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

	it("defaults continuity off for new videos", () => {
		expect(
			videoAttributesFor({ provider: "runware", model: "Kling 3 Omni" })
				.defaultAttributes.continuity,
		).toBe(TOGGLE_OFF);
	});
});
