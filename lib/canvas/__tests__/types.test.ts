import { describe, expect, it } from "vitest";
import { isKindCaptionable, ownsModel, snapDurationUp } from "../types";

describe("snapDurationUp", () => {
	it("takes the shortest option that still covers the seconds asked for", () => {
		expect(snapDurationUp(4, 15)).toBe(4);
		expect(snapDurationUp(4.1, 15)).toBe(5);
	});

	it("holds the model's longest option rather than inventing one", () => {
		expect(snapDurationUp(25, 15)).toBe(15);
		expect(snapDurationUp(25, 30)).toBe(25);
	});

	it("holds the shortest option for anything under it", () => {
		expect(snapDurationUp(0, 15)).toBe(4);
	});
});

describe("isKindCaptionable", () => {
	it("captions video and audio files, never images", () => {
		expect(isKindCaptionable("video")).toBe(true);
		expect(isKindCaptionable("audio")).toBe(true);
		expect(isKindCaptionable("image")).toBe(false);
	});
});

describe("ownsModel", () => {
	it("is false only for speech, which speaks on its voice's model", () => {
		expect(ownsModel("speech")).toBe(false);
		expect(ownsModel("image")).toBe(true);
		expect(ownsModel("asset_voice")).toBe(true);
		expect(ownsModel("asset_media_music")).toBe(true);
	});
});
