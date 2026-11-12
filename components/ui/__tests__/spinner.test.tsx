import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ICON_SIZES } from "../icon-button";
import { Spinner } from "../spinner";

describe("Spinner", () => {
	it("stays out of the name of the control it sits in, like every icon", () => {
		const html = renderToStaticMarkup(<Spinner />);
		expect(html).toContain('aria-hidden="true"');
		expect(html).not.toContain("role=");
		expect(html).not.toContain("aria-label");
	});

	it("is an icon at 16 by default", () => {
		expect(renderToStaticMarkup(<Spinner />)).toContain("font-size:16px");
	});

	it("takes an icon size with no class fighting it", () => {
		const html = renderToStaticMarkup(<Spinner size={ICON_SIZES.header} />);
		expect(html).toContain("font-size:14px");
		expect(html).not.toMatch(/\b(size|h|w)-\d/);
	});

	it("takes the color of the control it sits in, like every icon", () => {
		expect(renderToStaticMarkup(<Spinner />)).not.toMatch(/\btext-/);
	});
});
