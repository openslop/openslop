import { describe, expect, it } from "vitest";
import type { AssetConnectorType, AssetResult } from "@/lib/connectors/types";
import type { ElementSnapshot } from "@/lib/generation/snapshots";
import { characterAvatarElementId } from "../characterAvatar";
import { pickThumbnailUrl } from "../thumbnail";

const entry = (
	id: string,
	connectorType: AssetConnectorType | null,
	result: Partial<AssetResult> | null,
): [string, ElementSnapshot] => [
	id,
	{
		status: "idle",
		seconds: 0,
		result: result && { durationSec: 0, ...result },
		error: null,
		resultInputs: null,
		connectorType,
		pinned: false,
	},
];

describe("pickThumbnailUrl", () => {
	it("returns null for no entries", () => {
		expect(pickThumbnailUrl([])).toBeNull();
	});

	it("returns the first image url in iteration order", () => {
		expect(
			pickThumbnailUrl([
				entry("1", "tts", { audioUrl: "n.mp3" }),
				entry("2", "image", { imageUrl: "a.png" }),
				entry("3", "image", { imageUrl: "b.png" }),
			]),
		).toBe("a.png");
	});

	it("ignores entries without an image url, whatever their connector", () => {
		expect(
			pickThumbnailUrl([
				entry("1", "tts", { audioUrl: "n.mp3" }),
				entry("2", "video", { videoUrl: "v.mp4" }),
				entry("3", "sfx", { audioUrl: "s.mp3" }),
				entry("4", "music", { audioUrl: "m.mp3" }),
			]),
		).toBeNull();
	});

	it("ignores entries with no result", () => {
		expect(pickThumbnailUrl([entry("1", "image", null)])).toBeNull();
	});

	it("skips character avatar entries", () => {
		expect(
			pickThumbnailUrl([
				entry(characterAvatarElementId("Alice"), "image", {
					imageUrl: "avatar.png",
				}),
				entry("scene-1", "image", { imageUrl: "scene.png" }),
			]),
		).toBe("scene.png");
	});

	// A clip's frame is as much a picture of the project as a still is.
	it("takes the image url a clip carries beside its video", () => {
		expect(
			pickThumbnailUrl([
				entry("1", "tts", { audioUrl: "n.mp3" }),
				entry("2", "video", { imageUrl: "frame.png", videoUrl: "video.mp4" }),
			]),
		).toBe("frame.png");
	});

	it("returns null for a clip with only a videoUrl", () => {
		expect(
			pickThumbnailUrl([entry("1", "video", { videoUrl: "video.mp4" })]),
		).toBeNull();
	});
});
