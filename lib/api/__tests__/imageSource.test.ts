import { describe, expect, it } from "vitest";
import { parseImageSource } from "../imageSource";

describe("parseImageSource", () => {
	it("parses http(s) urls", () => {
		expect(parseImageSource("https://example.com/a.png")).toEqual({
			kind: "url",
			url: "https://example.com/a.png",
		});
		expect(parseImageSource("HTTP://example.com/a.png")).toEqual({
			kind: "url",
			url: "HTTP://example.com/a.png",
		});
	});

	it("splits a base64 data uri into media type and data", () => {
		expect(parseImageSource("data:image/png;base64,AAAA")).toEqual({
			kind: "base64",
			mediaType: "image/png",
			data: "AAAA",
		});
	});

	it("lowercases the media type", () => {
		expect(parseImageSource("data:IMAGE/PNG;base64,AAAA")).toMatchObject({
			mediaType: "image/png",
		});
	});

	it("accepts media subtypes containing digits or punctuation", () => {
		expect(parseImageSource("data:image/jp2;base64,AAAA")).toMatchObject({
			mediaType: "image/jp2",
		});
		expect(parseImageSource("data:image/svg+xml;base64,AAAA")).toMatchObject({
			mediaType: "image/svg+xml",
		});
	});

	it("rejects anything that is neither shape", () => {
		expect(parseImageSource("")).toBeNull();
		expect(parseImageSource("ftp://example.com/a.png")).toBeNull();
		expect(parseImageSource("/local/a.png")).toBeNull();
		expect(parseImageSource("data:image/png;base64,")).toBeNull();
		expect(parseImageSource("data:image/png,AAAA")).toBeNull();
	});
});
