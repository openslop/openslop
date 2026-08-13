import { describe, expect, it } from "vitest";
import { DEFAULT_ASPECT_RATIO } from "../aspectRatio";
import { DEFAULT_CAPTION_STYLE } from "../captionStyle";
import { DEFAULT_TRANSITION } from "../transitions";
import { DEFAULT_VIDEO_LENGTH } from "../videoLength";
import { VideoSettingsSchema } from "../videoSettings";

describe("VideoSettingsSchema", () => {
	it("completes an absent or partial setting block", () => {
		const defaults = {
			transitionType: DEFAULT_TRANSITION,
			aspectRatio: DEFAULT_ASPECT_RATIO,
			length: DEFAULT_VIDEO_LENGTH,
			captions: true,
			captionStyle: DEFAULT_CAPTION_STYLE,
		};

		expect(VideoSettingsSchema.parse(undefined)).toEqual(defaults);
		expect(VideoSettingsSchema.parse({ aspectRatio: "9:16" })).toEqual({
			...defaults,
			aspectRatio: "9:16",
		});
	});

	it("keeps every stored setting", () => {
		const stored = {
			transitionType: "fade" as const,
			aspectRatio: "9:16" as const,
			length: "10-15m" as const,
			captions: false,
			captionStyle: { ...DEFAULT_CAPTION_STYLE, casing: "upper" as const },
		};
		expect(VideoSettingsSchema.parse(stored)).toEqual(stored);
	});

	it("rejects an unknown value rather than silently defaulting it", () => {
		expect(() => VideoSettingsSchema.parse({ aspectRatio: "4:3" })).toThrow();
	});
});
