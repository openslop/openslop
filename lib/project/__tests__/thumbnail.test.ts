import { describe, expect, it } from "vitest";
import type { ContentElement } from "@/lib/canvas/types";
import { pickThumbnailUrl } from "../thumbnail";
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
			"results without a picture",
			SCRIPT,
			{ "1": { audioUrl: "n.mp3" }, "2": { videoUrl: "v.mp4" } },
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
				"asset_avatar:Alice": { imageUrl: "avatar.png" },
				"3": { imageUrl: "b.png" },
			},
			"b.png",
		],
	])("picks from %s", (_, script, results, thumbnail) => {
		expect(pickThumbnailUrl(script, resultQueue(results))).toBe(thumbnail);
	});
});
