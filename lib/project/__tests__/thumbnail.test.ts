import { describe, expect, it } from "vitest";
import type { AssetConnectorType } from "@/lib/connectors/types";
import type { ElementSnapshot } from "@/lib/generation/queue";
import { stillElementId } from "@/lib/connectors/animated_image/plugins/still-frame";
import { characterAvatarElementId } from "../characterAvatar";
import { pickThumbnailUrl } from "../thumbnail";

const entry = (
	id: string,
	connectorType: AssetConnectorType | null,
	imageUrl: string | null,
	videoUrl?: string,
): [string, ElementSnapshot] => [
	id,
	{
		status: "idle",
		seconds: 0,
		result:
			imageUrl || videoUrl
				? {
						durationSec: 0,
						...(imageUrl && { imageUrl }),
						...(videoUrl && { videoUrl }),
					}
				: null,
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
				entry("1", "tts", "n.mp3"),
				entry("2", "image", "a.png"),
				entry("3", "image", "b.png"),
			]),
		).toBe("a.png");
	});

	it("ignores non-image connector types", () => {
		expect(
			pickThumbnailUrl([
				entry("1", "tts", "n.mp3"),
				entry("2", "video", "v.mp4"),
				entry("3", "sfx", "s.mp3"),
				entry("4", "music", "m.mp3"),
			]),
		).toBeNull();
	});

	it("ignores entries with no result", () => {
		expect(pickThumbnailUrl([entry("1", "image", null)])).toBeNull();
	});

	it("skips character avatar entries", () => {
		expect(
			pickThumbnailUrl([
				entry(characterAvatarElementId("Alice"), "image", "avatar.png"),
				entry("scene-1", "image", "scene.png"),
			]),
		).toBe("scene.png");
	});

	// A still node is a real frame of the scene, unlike a character portrait.
	it("allows the still behind an animated image", () => {
		expect(
			pickThumbnailUrl([
				entry(stillElementId("scene-1"), "image", "still.png"),
			]),
		).toBe("still.png");
	});

	it("uses the still imageUrl for animated_image entries", () => {
		expect(
			pickThumbnailUrl([
				entry("1", "tts", "n.mp3"),
				entry("2", "animated_image", "still.png", "video.mp4"),
			]),
		).toBe("still.png");
	});

	it("returns null for animated_image with only a videoUrl", () => {
		expect(
			pickThumbnailUrl([entry("1", "animated_image", null, "video.mp4")]),
		).toBeNull();
	});
});
