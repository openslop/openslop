import { describe, expect, it } from "vitest";
import {
	checkMediaKind,
	findMedia,
	MediaItemSchema,
	toMediaItems,
	type MediaItem,
} from "../media";
import { toCaption } from "@/lib/captions/word-captions";

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

describe("MediaItemSchema", () => {
	it("keeps timed captions on a file and accepts older rows without them", () => {
		const item = upload("interview.mp4", "video");
		const captions = [toCaption("hello", 0, 0.4)];

		expect(MediaItemSchema.parse({ ...item, captions }).captions).toEqual(
			captions,
		);
		expect(MediaItemSchema.parse(item).captions).toBeUndefined();
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

describe("checkMediaKind", () => {
	const media = toMediaItems(
		[],
		[upload("theme.mp3", "audio"), upload("cover.png")],
	);

	it("refuses a library file of another kind, naming both", () => {
		expect(() =>
			checkMediaKind(media, "https://blob/theme.mp3", "image"),
		).toThrow("theme is audio, not an image.");
	});

	it.each([
		["a library file of the kind asked for", "https://blob/cover.png"],
		["a stored file outside the library", "https://blob/elsewhere.mp4"],
	])("takes %s", (_, url) => {
		expect(() => checkMediaKind(media, url, "image")).not.toThrow();
	});
});
