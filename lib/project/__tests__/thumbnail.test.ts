import { describe, expect, it } from "vitest";
import type { ContentElement } from "@/lib/canvas/types";
import { isVideoThumbnailUrl, pickThumbnailUrl } from "../thumbnail";
import { resultQueue } from "./_canvas";

const element = (
	id: string,
	type: ContentElement["type"] = "image",
): ContentElement => ({
	id,
	type,
	children: [{ id: `${id}-t`, type, text: "" }],
});

const SCRIPT = [element("1", "narration"), element("2", "video"), element("3")];

describe("pickThumbnailUrl", () => {
	it.each([
		["an empty script", [], {}, null],
		["no result yet", SCRIPT, {}, null],
		[
			"a video when no image has a still",
			SCRIPT,
			{ "1": { audioUrl: "n.mp3" }, "2": { videoUrl: "v.mp4" } },
			"v.mp4",
		],
		[
			"the first video in document order when no image has a still",
			SCRIPT,
			{ "2": { videoUrl: "v.mp4" }, "3": { videoUrl: "w.mp4" } },
			"v.mp4",
		],
		[
			"only a video the card can render",
			SCRIPT,
			{ "2": { videoUrl: "v.mkv" }, "3": { videoUrl: "w.mp4" } },
			"w.mp4",
		],
		[
			"null when the only video cannot be rendered by the card",
			SCRIPT,
			{ "2": { videoUrl: "v.mkv" } },
			null,
		],
		[
			"the first picture in document order, whenever it was generated",
			SCRIPT,
			{
				"3": { imageUrl: "b.png" },
				"2": { imageUrl: "a.png", videoUrl: "v.mp4" },
			},
			"a.png",
		],
		[
			"no avatar, since it belongs to no element of the script",
			SCRIPT,
			{
				avatar: { imageUrl: "avatar.png" },
				"3": { imageUrl: "b.png" },
			},
			"b.png",
		],
	])("picks from %s", (_, script, results, thumbnail) => {
		expect(pickThumbnailUrl(script, resultQueue(results))).toBe(thumbnail);
	});
});

describe("isVideoThumbnailUrl", () => {
	it.each([
		["https://cdn.example/v.mp4", true],
		["https://cdn.example/v.webm?token=1", true],
		["https://cdn.example/v.MOV#t=1", true],
		["https://cdn.example/thumb.png", false],
		["https://cdn.example/image/mp4-poster", false],
	])("%s -> %s", (url, expected) => {
		expect(isVideoThumbnailUrl(url)).toBe(expected);
	});
});
