import { describe, expect, it } from "vitest";
import type { ConnectorType } from "@/lib/connectors/types";
import type { ElementSnapshot } from "@/lib/generation/queue";
import { pickThumbnailUrl } from "../thumbnail";

const entry = (
	connectorType: ConnectorType | null,
	url: string | null,
): ElementSnapshot => ({
	status: "idle",
	seconds: 0,
	result: url ? { url, durationSec: 0 } : null,
	error: null,
	resultInputs: null,
	connectorType,
});

describe("pickThumbnailUrl", () => {
	it("returns null for no entries", () => {
		expect(pickThumbnailUrl([])).toBeNull();
	});

	it("returns the first image url", () => {
		expect(
			pickThumbnailUrl([
				entry("tts", "n.mp3"),
				entry("image", "a.png"),
				entry("image", "b.png"),
			]),
		).toBe("a.png");
	});

	it("ignores non-image connector types", () => {
		expect(
			pickThumbnailUrl([
				entry("tts", "n.mp3"),
				entry("video", "v.mp4"),
				entry("sfx", "s.mp3"),
				entry("music", "m.mp3"),
			]),
		).toBeNull();
	});

	it("ignores entries with no result", () => {
		expect(pickThumbnailUrl([entry("image", null)])).toBeNull();
	});
});
