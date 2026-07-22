import { describe, expect, it } from "vitest";
import { assetUrlField, getPrimaryUrl } from "../assetUrl";
import type { AssetResult } from "../types";

const result: AssetResult = {
	durationSec: 3,
	imageUrl: "https://blob.example.com/a.png",
	audioUrl: "https://blob.example.com/a.mp3",
	videoUrl: "https://blob.example.com/a.mp4",
};

describe("assetUrlField", () => {
	it("maps each asset kind to its result field", () => {
		expect(assetUrlField("image")).toBe("imageUrl");
		expect(assetUrlField("audio")).toBe("audioUrl");
		expect(assetUrlField("video")).toBe("videoUrl");
	});
});

describe("getPrimaryUrl", () => {
	it("reads the url for the requested kind", () => {
		expect(getPrimaryUrl(result, "image")).toBe(result.imageUrl);
		expect(getPrimaryUrl(result, "audio")).toBe(result.audioUrl);
		expect(getPrimaryUrl(result, "video")).toBe(result.videoUrl);
	});

	it("returns undefined without a result", () => {
		expect(getPrimaryUrl(null, "image")).toBeUndefined();
		expect(getPrimaryUrl(undefined, "video")).toBeUndefined();
	});

	it("returns undefined when the requested kind is absent, rather than another kind's url", () => {
		expect(getPrimaryUrl({ durationSec: 0 }, "audio")).toBeUndefined();
		expect(
			getPrimaryUrl({ durationSec: 0, imageUrl: result.imageUrl }, "video"),
		).toBeUndefined();
	});
});
