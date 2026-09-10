// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { toast } from "sonner";
import { ToastErrorBoundary } from "../ToastErrorBoundary";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let broken = false;
function Flaky() {
	if (broken) throw new Error("player crashed");
	return <span>fine</span>;
}

const container = document.body.appendChild(document.createElement("div"));
let root: Root;

beforeEach(() => {
	root = createRoot(container);
	vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
	act(() => root.unmount());
	vi.clearAllMocks();
});

const render = (label?: string) =>
	act(() =>
		root.render(
			<ToastErrorBoundary label={label}>
				<Flaky />
			</ToastErrorBoundary>,
		),
	);

const clickTryAgain = () =>
	act(() => container.querySelector("button")?.click());

describe("ToastErrorBoundary", () => {
	it("renders its children while nothing throws", () => {
		broken = false;
		render();
		expect(container.textContent).toBe("fine");
		expect(toast.error).not.toHaveBeenCalled();
	});

	it("toasts a render error and shows a labelled fallback with Try again", () => {
		broken = true;
		render("Player");
		expect(container.textContent).toContain("Player failed to render.");
		expect(container.querySelector("button")?.textContent).toBe("Try again");
		expect(toast.error).toHaveBeenCalledExactlyOnceWith(
			"Player: player crashed",
			undefined,
		);
	});

	it("re-renders the children on Try again, catching again while they still throw", () => {
		broken = true;
		render();
		clickTryAgain();
		expect(container.textContent).toContain("Something went wrong.");
		expect(toast.error).toHaveBeenCalledTimes(2);

		broken = false;
		clickTryAgain();
		expect(container.textContent).toBe("fine");
		expect(toast.error).toHaveBeenCalledTimes(2);
	});
});
