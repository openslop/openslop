import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import SegmentError from "../error";
import GlobalError from "../global-error";

// SegmentError logs the error via console.error on mount; silence it in SSR
// (it won't run, but keep the spy so a future effect change can't spam output).
vi.spyOn(console, "error").mockImplementation(() => {});

const renderSegment = (error: Error, retry = () => {}) =>
	renderToStaticMarkup(<SegmentError error={error} retry={retry} />);

const renderGlobal = (error: Error, retry = () => {}) =>
	renderToStaticMarkup(<GlobalError error={error} retry={retry} />);

describe("app/error.tsx (segment-level recovery)", () => {
	it("surfaces the error as durable UI with a Try again affordance", () => {
		const html = renderSegment(new Error("boom in segment"));

		expect(html).toContain("Something went wrong");
		// The cause is shown in-page, replacing the auto-dismissing toast that
		// left users with no signal after ~4s.
		expect(html).toContain("boom in segment");
		expect(html).toContain("Try again");
		expect(html).toContain("<button");
	});

	it("renders content (never a blank) even for an opaque error", () => {
		const html = renderSegment(new Error(""));
		expect(html).toContain("Something went wrong");
		expect(html).toContain("Try again");
	});
});

describe("app/global-error.tsx (root-level recovery)", () => {
	it("owns the document and shows recovery UI for root-layout errors", () => {
		// global-error replaces the root layout, so it must provide its own
		// <html>/<body> (the app's global styles/theme do not reach it).
		const html = renderGlobal(new Error("root layout exploded"));

		expect(html).toContain("<html");
		expect(html).toContain("<body");
		expect(html).toContain("OpenSlop hit a snag");
		expect(html).toContain("root layout exploded");
	});

	it("offers both retry and an explicit reload — the recovery that previously required a manual page reload", () => {
		const html = renderGlobal(new Error("boom"));

		expect(html).toContain("Try again");
		expect(html).toContain("Reload page");
		const buttons = html.match(/<button/g);
		expect(buttons?.length).toBe(2);
	});
});
