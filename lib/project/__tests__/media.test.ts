import { describe, expect, it } from "vitest";
import {
	findMedia,
	toMediaItems,
	uploadedMedia,
	type MediaItem,
} from "../media";

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

	it("preserves costUsd when provided and leaves it unset for uploads", () => {
		expect(toMediaItems([], [{ ...upload("gen.png"), costUsd: 0.05 }])).toEqual(
			[
				{
					name: "gen",
					kind: "image",
					url: "https://blob/gen.png",
					createdAt: expect.any(String),
					costUsd: 0.05,
				},
			],
		);
		expect(toMediaItems([], [upload("upload.png")])[0].costUsd).toBeUndefined();
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

describe("uploadedMedia", () => {
	const media = toMediaItems(
		[],
		[upload("theme.mp3", "audio"), upload("cover.png")],
	);

	it("refuses a library file of another kind, naming both", () => {
		expect(() =>
			uploadedMedia(media, "https://blob/theme.mp3", "image"),
		).toThrow("theme is audio, not an image.");
	});

	it("takes a library file of the kind asked for as its record", () => {
		expect(uploadedMedia(media, "https://blob/cover.png", "image")).toBe(
			media[1],
		);
	});

	it("takes a stored file outside the library as itself", () => {
		const url = "https://blob/elsewhere.mp4";
		expect(uploadedMedia(media, url, "image")).toEqual({ kind: "image", url });
	});
});
