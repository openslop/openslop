import { describe, expect, it } from "vitest";
import { parseXmlTag } from "../parseXmlTag";

describe("parseXmlTag", () => {
	it("parses a tag name only", () => {
		expect(parseXmlTag("image")).toEqual({ tag: "image" });
	});

	it("parses a tag with attributes", () => {
		expect(parseXmlTag('character name="Lyra" gender="feminine"')).toEqual({
			tag: "character",
			name: "Lyra",
			gender: "feminine",
		});
	});

	it("strips trailing slash from self-closing tags", () => {
		expect(parseXmlTag("image/")).toEqual({ tag: "image" });
	});

	it("returns just { tag } when there are no attributes", () => {
		const result = parseXmlTag("music");
		expect(Object.keys(result)).toEqual(["tag"]);
		expect(result.tag).toBe("music");
	});

	it("preserves whitespace runs and newlines inside a value", () => {
		expect(parseXmlTag('image style="oil  paint\nand ink"')).toEqual({
			tag: "image",
			style: "oil  paint\nand ink",
		});
	});

	it("decodes escaped entities in values", () => {
		expect(
			parseXmlTag('image style="&quot;noir&quot; &lt;b&gt; &amp; grit"'),
		).toEqual({ tag: "image", style: '"noir" <b> & grit' });
	});

	it("leaves unknown entity-shaped text alone", () => {
		expect(parseXmlTag('image style="AT&T &frac12;"')).toEqual({
			tag: "image",
			style: "AT&T &frac12;",
		});
	});
});
