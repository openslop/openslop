import { describe, expect, it } from "vitest";
import { toMediaItems, type MediaItem } from "../media";

const upload = (name: string, kind: MediaItem["kind"] = "image") => ({
	kind,
	name,
	url: `https://blob/${name}`,
});

describe("toMediaItems", () => {
	it("names each item after its file, without the extension", () => {
		expect(toMediaItems([], [upload("Beach Sunset.png")])).toEqual([
			{
				name: "beach-sunset",
				kind: "image",
				url: "https://blob/Beach Sunset.png",
				createdAt: expect.any(String),
			},
		]);
	});

	it("numbers a name already in the media", () => {
		const media = toMediaItems([], [upload("cat.png")]);

		expect(
			toMediaItems(media, [upload("cat.jpg"), upload("cat.webp")]).map(
				({ name }) => name,
			),
		).toEqual(["cat-2", "cat-3"]);
	});

	it("falls back to the kind when the file name has no words", () => {
		expect(toMediaItems([], [upload(".mp3", "audio")])[0]?.name).toBe("audio");
	});
});
