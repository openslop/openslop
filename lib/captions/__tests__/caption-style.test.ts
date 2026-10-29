import { describe, expect, it } from "vitest";
import { ASPECT_RATIO_DIMENSIONS } from "@/lib/project/aspect-ratio";
import { VideoSettingsSchema } from "@/lib/project/video-settings";
import { CAPTION_PRESETS } from "../caption-presets";
import {
	CaptionStyleSchema,
	DEFAULT_CAPTION_STYLE,
	captionFontSizePx,
} from "../caption-style";

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

describe("captionFontSizePx", () => {
	it("is the authored size on the landscape canvas", () => {
		const { output } = ASPECT_RATIO_DIMENSIONS["16:9"];
		expect(captionFontSizePx(40, output.height)).toBe(40);
	});

	it("grows with the frame height on a portrait canvas", () => {
		const { output } = ASPECT_RATIO_DIMENSIONS["9:16"];
		expect(captionFontSizePx(40, output.height)).toBeCloseTo(40 * (16 / 9));
	});
});
