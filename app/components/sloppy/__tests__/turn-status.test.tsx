// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { WorkingStatus } from "../turn-status";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

describe("WorkingStatus", () => {
	const container = document.body.appendChild(document.createElement("div"));
	let root: Root;

	beforeEach(() => {
		vi.useFakeTimers();
		root = createRoot(container);
	});

	afterEach(() => {
		act(() => root.unmount());
		vi.useRealTimers();
	});

	it("reads the time since the turn began, even when ticks were held back", async () => {
		vi.setSystemTime(10_000);
		await act(async () => root.render(<WorkingStatus status="Thinking" />));
		expect(container.textContent).toBe("Thinking · 0s");

		vi.setSystemTime(70_000);
		await act(() => vi.advanceTimersByTimeAsync(1_000));
		expect(container.textContent).toBe("Thinking · 61s");
	});
});
