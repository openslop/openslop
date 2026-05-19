import { describe, expect, it } from "vitest";
import type { ConnectorType } from "@/lib/connectors/types";
import type { ElementSnapshot } from "@/lib/generation/queue";
import { characterAvatarElementId } from "../ensureCharacterAvatars";
import { pickThumbnailUrl } from "../thumbnail";

const entry = (
	id: string,
	connectorType: ConnectorType | null,
	url: string | null,
	previewUrl?: string,
): [string, ElementSnapshot] => [
	id,
	{
		status: "idle",
		seconds: 0,
		result: url
			? { url, durationSec: 0, ...(previewUrl && { previewUrl }) }
			: null,
		error: null,
		resultInputs: null,
		connectorType,
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

	it("accepts animated_image and prefers previewUrl over the video url", () => {
		expect(
			pickThumbnailUrl([
				entry("1", "tts", "n.mp3"),
				entry("2", "animated_image", "video.mp4", "still.png"),
			]),
		).toBe("still.png");
	});

	it("falls back to animated_image url when no previewUrl is present", () => {
		expect(pickThumbnailUrl([entry("1", "animated_image", "video.mp4")])).toBe(
			"video.mp4",
		);
	});
});
