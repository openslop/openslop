// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { toast } from "sonner";
import { ToastErrorBoundary } from "../ToastErrorBoundary";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const errorToast = vi.mocked(toast.error);

// React only enables its act-aware scheduler when this flag is on.
beforeEach(() => {
	(
		globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
	).IS_REACT_ACT_ENVIRONMENT = true;
});

let container: HTMLDivElement;
let root: Root;
let consoleError: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
	container = document.createElement("div");
	document.body.replaceChildren(container);
	root = createRoot(container);
	errorToast.mockReset();
	// React 19 logs a (recoverable) concurrent-render warning whenever a child
	// throws during a test mount; it is expected here, not a failure signal.
	consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
	act(() => {
		root.unmount();
	});
	consoleError.mockRestore();
});

// Whether the child throws on render. Mutated from the test body (not during
// render) to model a transient cause that later clears.
let broken = false;

/**
 * Throws while `broken` is true, then renders `recoveredText`. Mutating the
 * module-level flag outside render avoids touching refs/props during render.
 */
function Flaky({ recoveredText }: { recoveredText: string }) {
	if (broken) throw new Error("player crashed");
	return <span data-testid="recovered">{recoveredText}</span>;
}

function mount(node: React.ReactNode) {
	act(() => {
		root.render(node);
	});
}

function text(): string {
	return container.textContent ?? "";
}

function getButton(name: string): HTMLButtonElement {
	const buttons = Array.from(container.querySelectorAll("button"));
	const match = buttons.find(
		(b) => (b.textContent ?? "").trim().toLowerCase() === name.toLowerCase(),
	);
	if (!match) throw new Error(`no button labelled ${name}; got ${text()}`);
	return match;
}

describe("ToastErrorBoundary", () => {
	it("renders its children while there is no error", () => {
		broken = false;
		mount(
			<ToastErrorBoundary>
				<Flaky recoveredText="fine" />
			</ToastErrorBoundary>,
		);
		expect(text()).toBe("fine");
		expect(errorToast).not.toHaveBeenCalled();
	});

	it("catches a render error, toasts it, and shows a recoverable fallback instead of a blank", () => {
		broken = true;
		mount(
			<ToastErrorBoundary>
				<Flaky recoveredText="back" />
			</ToastErrorBoundary>,
		);

		// The thrown render error becomes durable UI — never `null` for the
		// lifetime of the instance, which was the bug.
		expect(container.hasChildNodes()).toBe(true);
		expect(text()).toContain("Something went wrong.");
		expect(text()).toContain("Try again");
		expect(container.querySelector("button")).not.toBeNull();

		// The pre-existing signal — surfacing the cause via sonner — is preserved.
		expect(errorToast).toHaveBeenCalledTimes(1);
		expect(errorToast).toHaveBeenCalledWith("player crashed", undefined);
	});

	it("prefixes the fallback message and the toast with the label", () => {
		broken = true;
		mount(
			<ToastErrorBoundary label="Player">
				<Flaky recoveredText="back" />
			</ToastErrorBoundary>,
		);

		expect(text()).toContain("Player failed to render.");
		expect(errorToast).toHaveBeenCalledTimes(1);
		expect(errorToast).toHaveBeenCalledWith(
			"Player: player crashed",
			undefined,
		);
	});

	it("recovers by re-rendering children on Try again once the cause clears — no manual page reload needed", () => {
		broken = true;
		mount(
			<ToastErrorBoundary>
				<Flaky recoveredText="back online" />
			</ToastErrorBoundary>,
		);

		expect(text()).toContain("Something went wrong.");
		expect(errorToast).toHaveBeenCalledTimes(1);

		// Simulate the transient cause resolving, then exercise the recovery
		// affordance that did not exist before the fix.
		broken = false;
		act(() => {
			getButton("Try again").click();
		});

		expect(text()).toBe("back online");
		// Recovery does not double-toast.
		expect(errorToast).toHaveBeenCalledTimes(1);
	});

	it("re-catches (does not latch to a dead fallback) when Try again still fails", () => {
		broken = true;
		mount(
			<ToastErrorBoundary>
				<Flaky recoveredText="back online" />
			</ToastErrorBoundary>,
		);
		expect(errorToast).toHaveBeenCalledTimes(1);

		// The cause persists, so retry re-renders the children and they fail
		// again — proving the button is wired to a real reset, not a no-op.
		act(() => {
			getButton("Try again").click();
		});

		expect(text()).toContain("Something went wrong.");
		expect(container.querySelector("button")).not.toBeNull();
		// A fresh catch surfaces a fresh toast.
		expect(errorToast).toHaveBeenCalledTimes(2);
	});

	it("never collapses to a `null` subtree while its child keeps failing", () => {
		broken = true;
		mount(
			<ToastErrorBoundary>
				<Flaky recoveredText="never" />
			</ToastErrorBoundary>,
		);

		// A persistently-failing child keeps the durable fallback on screen.
		expect(container.hasChildNodes()).toBe(true);
		expect(text()).toContain("Something went wrong.");
		expect(container.querySelector("button")).not.toBeNull();
	});
});
