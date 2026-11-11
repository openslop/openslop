import { describe, expect, it } from "vitest";
import { findMedia, toMediaItems, type MediaItem } from "../media";

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

describe("findMedia", () => {
	const item = (name: string, kind: MediaItem["kind"] = "image") => ({
		name,
		kind,
		url: `https://blob/${name}`,
	});
	const media = [
		item("old-sky"),
		item("sky-blue"),
		item("sky-song", "audio"),
		item("blue-sky"),
	];
	const names = (query: string) =>
		findMedia(media, "image", query).map(({ name }) => name);

	it("lists every item of the kind, newest first, for an empty query", () => {
		expect(names(" ")).toEqual(["blue-sky", "sky-blue", "old-sky"]);
	});

	it("ranks a name starting with the query above one merely holding it", () => {
		expect(names("sky")).toEqual(["sky-blue", "blue-sky", "old-sky"]);
	});

	it("matches letters in order", () => {
		expect(names("blsk")).toEqual(["blue-sky"]);
	});
});
