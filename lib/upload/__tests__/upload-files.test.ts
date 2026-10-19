import { describe, expect, it } from "vitest";
import {
	partitionFiles,
	UPLOAD_KINDS,
	UPLOAD_PATHNAME,
	uploadPathname,
} from "../upload-files";

const MAX_IMAGE_UPLOAD_BYTES = UPLOAD_KINDS.image.maxBytes;

const makeFile = (name: string, type: string, size = 1) =>
	new File([new Uint8Array(size)], name, { type });

describe("partitionFiles", () => {
	it("accepts image files under the size cap", () => {
		const png = makeFile("a.png", "image/png");
		const webp = makeFile("b.webp", "image/webp");

		expect(partitionFiles([png, webp], "image")).toEqual({
			accepted: [png, webp],
			rejected: [],
		});
	});

	it("rejects non-image files", () => {
		const pdf = makeFile("script.pdf", "application/pdf");

		expect(partitionFiles([pdf], "image")).toEqual({
			accepted: [],
			rejected: [{ name: "script.pdf", reason: "is not an image" }],
		});
	});

	it("rejects images over the size cap", () => {
		const huge = makeFile("huge.png", "image/png", MAX_IMAGE_UPLOAD_BYTES + 1);

		expect(partitionFiles([huge], "image")).toEqual({
			accepted: [],
			rejected: [{ name: "huge.png", reason: "is over 10 MB" }],
		});
	});

	it("keeps the accepted files when only some are rejected", () => {
		const ok = makeFile("ok.png", "image/png");
		const bad = makeFile("bad.txt", "text/plain");

		const { accepted, rejected } = partitionFiles([ok, bad, ok], "image");

		expect(accepted).toEqual([ok, ok]);
		expect(rejected).toHaveLength(1);
	});

	it("treats a file exactly at the cap as acceptable", () => {
		const exact = makeFile("exact.png", "image/png", MAX_IMAGE_UPLOAD_BYTES);

		expect(partitionFiles([exact], "image").accepted).toEqual([exact]);
	});

	it("takes videos only as videos", () => {
		const clip = makeFile("clip.mp4", "video/mp4");
		const still = makeFile("still.png", "image/png");

		expect(partitionFiles([clip, still], "video")).toEqual({
			accepted: [clip],
			rejected: [{ name: "still.png", reason: "is not a video" }],
		});
	});

	it("holds videos to their own size cap", () => {
		const big = makeFile("big.mp4", "video/mp4", MAX_IMAGE_UPLOAD_BYTES + 1);
		const huge = makeFile(
			"huge.mp4",
			"video/mp4",
			UPLOAD_KINDS.video.maxBytes + 1,
		);

		expect(partitionFiles([big, huge], "video")).toEqual({
			accepted: [big],
			rejected: [{ name: "huge.mp4", reason: "is over 50 MB" }],
		});
	});

	it("takes audio only as audio", () => {
		const song = makeFile("song.mp3", "audio/mpeg");
		const clip = makeFile("clip.mp4", "video/mp4");

		expect(partitionFiles([song, clip], "audio")).toEqual({
			accepted: [song],
			rejected: [{ name: "clip.mp4", reason: "is not audio" }],
		});
	});

	it("holds audio to its own size cap", () => {
		const huge = makeFile(
			"huge.mp3",
			"audio/mpeg",
			UPLOAD_KINDS.audio.maxBytes + 1,
		);

		expect(partitionFiles([huge], "audio")).toEqual({
			accepted: [],
			rejected: [{ name: "huge.mp3", reason: "is over 20 MB" }],
		});
	});
});

describe("uploadPathname", () => {
	it("puts each file in its own folder under the upload path", () => {
		const first = uploadPathname("photo.png");

		expect(first).toMatch(UPLOAD_PATHNAME);
		expect(first).not.toBe(uploadPathname("photo.png"));
	});

	it.each([
		["../../etc/passwd", "passwd"],
		["C:\\Users\\me\\cat pic.png", "cat_pic.png"],
		["...hidden", "hidden"],
		["", "upload"],
	])("sanitizes %j to %j", (name, expected) => {
		const pathname = uploadPathname(name);

		expect(pathname).toMatch(UPLOAD_PATHNAME);
		expect(pathname.endsWith(`/${expected}`)).toBe(true);
	});
});
