import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";
import { RelativeTime } from "../RelativeTime";

// Late-evening UTC, ~30 days old: the case where timezone shifts the calendar
// day and locale flips the format. Server render must be identical in every env
// or hydration mismatches (React #418).
const ISO = "2026-05-13T22:30:00Z";

describe("RelativeTime", () => {
	it("renders a fixed UTC/en-US date on the server regardless of env", () => {
		expect(renderToStaticMarkup(<RelativeTime iso={ISO} />)).toBe("5/13/2026");
	});
});
