import { describe, expect, it } from "vitest";
import { VideoSettingsSchema } from "@/lib/project/videoSettings";
import { CAPTION_PRESETS } from "../captionPresets";
import { CaptionStyleSchema, DEFAULT_CAPTION_STYLE } from "../captionStyle";

describe("CaptionStyleSchema", () => {
	it("accepts every preset", () => {
		for (const preset of CAPTION_PRESETS) {
			expect(CaptionStyleSchema.parse(preset.style)).toEqual(preset.style);
		}
	});

	it("falls back to the default style instead of failing the project", () => {
		const settings = VideoSettingsSchema.parse({
			captionStyle: { font: "comic sans" },
		});
		expect(settings.captionStyle).toEqual(DEFAULT_CAPTION_STYLE);
	});
});
