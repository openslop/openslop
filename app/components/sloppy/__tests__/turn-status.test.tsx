// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { StepPart } from "@/lib/agent/step-runs";
import { StepRun } from "../turn-status";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const thinking: StepPart = {
	type: "reasoning",
	text: "weighing it up",
	state: "streaming",
};

const reading = (model?: string): StepPart => ({
	type: "tool-read_model_attributes",
	toolCallId: "c1",
	state: "input-streaming",
	input: model ? { model } : {},
});

describe("StepRun while live", () => {
	const container = document.body.appendChild(document.createElement("div"));
	let root: Root;

	const render = (steps: StepPart[]) =>
		act(async () => root.render(<StepRun steps={steps} live />));
	const button = () => container.querySelector("button");
	const leaving = () =>
		container.querySelector("[aria-hidden='true'].fold-out");

	beforeEach(() => {
		vi.useFakeTimers();
		root = createRoot(container);
	});

	afterEach(() => {
		act(() => root.unmount());
		vi.useRealTimers();
	});

	it("reads the time since it appeared, even when ticks were held back", async () => {
		vi.setSystemTime(10_000);
		await render([]);
		expect(button()?.textContent).toBe("Slopping…· 0s");

		vi.setSystemTime(70_000);
		await act(() => vi.advanceTimersByTimeAsync(1_000));
		expect(button()?.textContent).toBe("Slopping…· 61s");
	});

	it("has nothing to expand before the first step", async () => {
		await render([]);

		expect(button()?.disabled).toBe(true);
	});

	it("folds the old label away when a new step starts", async () => {
		await render([]);
		await render([thinking]);

		expect(leaving()?.textContent).toBe("Slopping…");
		expect(button()?.textContent).toContain("Thinking");

		await render([thinking, reading()]);

		expect(leaving()?.textContent).toBe("Thinking");
		expect(button()?.textContent).toContain("Reading what the model allows");
	});

	it("updates a step's label in place as its input streams in", async () => {
		await render([reading()]);
		await render([reading("kling")]);

		expect(leaving()).toBeNull();
		expect(button()?.textContent).toContain("Reading what kling allows");
	});

	it("shows the steps so far when expanded", async () => {
		await render([thinking, reading()]);

		await act(async () => button()?.click());

		expect(container.textContent).toContain("Thinking…");
	});
});
