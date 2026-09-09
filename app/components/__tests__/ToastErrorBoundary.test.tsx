import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ToastErrorBoundary } from "../ToastErrorBoundary";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

describe("ToastErrorBoundary (server render)", () => {
	it("renders its children during the initial server render and shows no fallback", () => {
		// The root layout is server-rendered; the boundary must pass children
		// through during SSR rather than collapse to a blank or its fallback.
		const html = renderToStaticMarkup(
			<ToastErrorBoundary label="Player">
				<span data-testid="child">player surface</span>
			</ToastErrorBoundary>,
		);
		expect(html).toContain("player surface");
		// No error path is reachable during SSR, so the fallback must not appear.
		expect(html).not.toContain("Something went wrong");
		expect(html).not.toContain("Player failed to render");
	});
});
