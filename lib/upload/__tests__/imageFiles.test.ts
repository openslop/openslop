import { describe, expect, it } from "vitest";
import { MAX_IMAGE_UPLOAD_BYTES, partitionImageFiles } from "../imageFiles";

const makeFile = (name: string, type: string, size = 1) =>
	new File([new Uint8Array(size)], name, { type });

describe("partitionImageFiles", () => {
	it("accepts image files under the size cap", () => {
		const png = makeFile("a.png", "image/png");
		const webp = makeFile("b.webp", "image/webp");

		expect(partitionImageFiles([png, webp])).toEqual({
			accepted: [png, webp],
			rejected: [],
		});
	});

	it("rejects non-image files", () => {
		const pdf = makeFile("script.pdf", "application/pdf");

		expect(partitionImageFiles([pdf])).toEqual({
			accepted: [],
			rejected: [{ name: "script.pdf", reason: "is not an image" }],
		});
	});

	it("rejects images over the size cap", () => {
		const huge = makeFile("huge.png", "image/png", MAX_IMAGE_UPLOAD_BYTES + 1);

		expect(partitionImageFiles([huge])).toEqual({
			accepted: [],
			rejected: [{ name: "huge.png", reason: "is over 10 MB" }],
		});
	});

	it("keeps the accepted files when only some are rejected", () => {
		const ok = makeFile("ok.png", "image/png");
		const bad = makeFile("bad.txt", "text/plain");

		const { accepted, rejected } = partitionImageFiles([ok, bad, ok]);

		expect(accepted).toEqual([ok, ok]);
		expect(rejected).toHaveLength(1);
	});

	it("treats a file exactly at the cap as acceptable", () => {
		const exact = makeFile("exact.png", "image/png", MAX_IMAGE_UPLOAD_BYTES);

		expect(partitionImageFiles([exact]).accepted).toEqual([exact]);
	});
});
