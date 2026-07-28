import { describe, expect, it } from "vitest";
import { escapeXml, unescapeXml } from "../xmlEscape";

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

	it("leaves unknown entities untouched", () => {
		expect(unescapeXml("&nbsp; &#39;")).toBe("&nbsp; &#39;");
	});
});
