import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import ErrorPage from "../error";
import GlobalError from "../global-error";

const props = { error: new Error("boom"), retry: () => {} };

describe("error pages", () => {
	it("error.tsx shows the message and a Try again button", () => {
		const html = renderToStaticMarkup(<ErrorPage {...props} />);
		expect(html).toContain("boom");
		expect(html).toMatch(/<button[^>]*>Try again<\/button>/);
	});

	it("global-error.tsx wraps the same page in its own document", () => {
		const html = renderToStaticMarkup(<GlobalError {...props} />);
		expect(html).toMatch(/^<html/);
		expect(html).toContain("Try again");
	});
});
