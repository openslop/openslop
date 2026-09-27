import { describe, expect, it } from "vitest";
import { MetadataSchema } from "@/lib/project/types";
import { CAPTION_PRESETS } from "../captionPresets";
import { CaptionStyleSchema, DEFAULT_CAPTION_STYLE } from "../captionStyle";

describe("CaptionStyleSchema", () => {
	it("accepts every preset", () => {
		for (const preset of CAPTION_PRESETS) {
			expect(CaptionStyleSchema.parse(preset.style)).toEqual(preset.style);
		}
	});

	it("falls back to the default style instead of failing the project", () => {
		const metadata = MetadataSchema.parse({
			videoSettings: { captionStyle: { font: "comic sans" } },
		});
		expect(metadata.videoSettings.captionStyle).toEqual(DEFAULT_CAPTION_STYLE);
	});
});
