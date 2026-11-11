import { describe, expect, it } from "vitest";
import { escapeXml, unescapeXml } from "../xml-escape";

describe("xmlEscape", () => {
	it("round-trips the characters that would break an OSML tag", () => {
		const raw = 'a 24" monitor & a <box> for R&D';
		expect(escapeXml(raw)).toBe(
			"a 24&quot; monitor &amp; a &lt;box&gt; for R&amp;D",
		);
		expect(unescapeXml(escapeXml(raw))).toBe(raw);
	});

	it("does not decode an entity the user typed literally", () => {
		expect(unescapeXml(escapeXml("&amp; means and"))).toBe("&amp; means and");
	});

	it("decodes the apostrophe and numeric character references", () => {
		expect(unescapeXml("it&apos;s &#39;ok&#x27; &#8212; &#x1F600;")).toBe(
			"it's 'ok' \u2014 \u{1F600}",
		);
	});

	it("does not decode a numeric reference the user typed literally", () => {
		expect(unescapeXml(escapeXml("&#39; is an apostrophe"))).toBe(
			"&#39; is an apostrophe",
		);
	});

	it("leaves unknown entities and impossible code points untouched", () => {
		expect(unescapeXml("&nbsp; &#x110000; &#xD800; &#0;")).toBe(
			"&nbsp; &#x110000; &#xD800; &#0;",
		);
	});
});
