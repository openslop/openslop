import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SearchField } from "../search-field";

describe("SearchField", () => {
	it("styles the field itself with className", () => {
		const html = renderToStaticMarkup(
			<SearchField aria-label="Search fonts" className="h-8" />,
		);
		expect(html).toMatch(
			/<input[^>]*class="[^"]*\bh-8\b[^"]*"[^>]*aria-label="Search fonts"/,
		);
	});
});
