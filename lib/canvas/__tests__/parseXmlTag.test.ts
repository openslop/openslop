import { describe, expect, it } from "vitest";
import { parseXmlTag } from "../parseXmlTag";

describe("parseXmlTag", () => {
	it("parses a tag name only", () => {
		expect(parseXmlTag("image")).toEqual({ tag: "image", attributes: {} });
	});

	it("parses a tag with attributes", () => {
		expect(parseXmlTag('character name="Lyra" gender="feminine"')).toEqual({
			tag: "character",
			attributes: { name: "Lyra", gender: "feminine" },
		});
	});

	it("strips trailing slash from self-closing tags", () => {
		expect(parseXmlTag("image/")).toEqual({ tag: "image", attributes: {} });
	});

	it("decodes escaped characters in attribute values", () => {
		expect(
			parseXmlTag('image prompt="a 24&quot; monitor &amp; a &lt;box&gt;"'),
		).toEqual({
			tag: "image",
			attributes: { prompt: 'a 24" monitor & a <box>' },
		});
	});

	it("keeps a `tag` attribute separate from the tag name", () => {
		expect(parseXmlTag('image tag="hero"')).toEqual({
			tag: "image",
			attributes: { tag: "hero" },
		});
	});
});
