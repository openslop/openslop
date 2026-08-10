import { describe, expect, it } from "vitest";
import { MetadataSchema } from "@/lib/project/types";
import { CAPTION_PRESETS } from "../captionPresets";
import {
	CaptionStyleSchema,
	DEFAULT_CAPTION_STYLE,
	resolveCaptionStyle,
} from "../captionStyle";

describe("resolveCaptionStyle", () => {
	it("defaults when unset", () => {
		expect(resolveCaptionStyle({})).toBe(DEFAULT_CAPTION_STYLE);
		expect(resolveCaptionStyle({ videoSettings: {} })).toBe(
			DEFAULT_CAPTION_STYLE,
		);
	});

	it("reads the project setting", () => {
		const captionStyle = { ...DEFAULT_CAPTION_STYLE, casing: "lower" } as const;
		expect(resolveCaptionStyle({ videoSettings: { captionStyle } })).toBe(
			captionStyle,
		);
	});
});

describe("CaptionStyleSchema", () => {
	it("accepts every preset", () => {
		for (const preset of CAPTION_PRESETS) {
			expect(CaptionStyleSchema.parse(preset.style)).toEqual(preset.style);
		}
	});

	it("drops a malformed stored style instead of failing the project", () => {
		const metadata = MetadataSchema.parse({
			videoSettings: { captionStyle: { font: "comic sans" } },
		});
		expect(metadata.videoSettings?.captionStyle).toBeUndefined();
	});
});
