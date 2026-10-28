// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { onPageHidden } from "../on-page-hidden";

describe("onPageHidden", () => {
	const listener = vi.fn();
	let stop: () => void;

	const hide = () => {
		vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
		document.dispatchEvent(new Event("visibilitychange"));
	};

	beforeEach(() => {
		listener.mockReset();
		stop = onPageHidden(listener);
	});

	afterEach(() => {
		stop();
	});

	it("fires when the tab is hidden", () => {
		hide();

		expect(listener).toHaveBeenCalledTimes(1);
	});

	it("fires as the page unloads", () => {
		window.dispatchEvent(new Event("pagehide"));

		expect(listener).toHaveBeenCalledTimes(1);
	});

	it("stays quiet while the tab is visible", () => {
		document.dispatchEvent(new Event("visibilitychange"));

		expect(listener).not.toHaveBeenCalled();
	});

	it("stops once unsubscribed", () => {
		stop();

		hide();
		window.dispatchEvent(new Event("pagehide"));

		expect(listener).not.toHaveBeenCalled();
	});
});
