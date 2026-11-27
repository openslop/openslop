// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { SloppyMessage } from "@/lib/agent/types";
import { AgentTurn } from "../sloppy-message";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const read = {
	type: "tool-read_script",
	toolCallId: "c1",
	state: "output-available",
	input: {},
	output: "the script",
} as const;

const failed = {
	type: "tool-read_script",
	toolCallId: "c2",
	state: "output-error",
	input: {},
	errorText: "no script yet",
} as const;

const turn = (
	parts: SloppyMessage["parts"],
	metadata?: SloppyMessage["metadata"],
): SloppyMessage => ({ id: "a1", role: "assistant", parts, metadata });

describe("AgentTurn", () => {
	const container = document.body.appendChild(document.createElement("div"));
	let root: Root;

	const render = (message: SloppyMessage, streaming: boolean) =>
		act(async () =>
			root.render(
				<TooltipProvider>
					<AgentTurn message={message} streaming={streaming} />
				</TooltipProvider>,
			),
		);
	const rows = () =>
		[...container.querySelectorAll("button[aria-expanded]")].map(
			(button) => button.textContent,
		);

	beforeEach(() => {
		root = createRoot(container);
	});

	afterEach(() => {
		act(() => root.unmount());
	});

	it("folds each run of steps into one collapsed row named for its latest step", async () => {
		await render(
			turn(
				[
					{ type: "reasoning", text: "weighing", state: "done" },
					read,
					{ type: "text", text: "Done.", state: "done" },
				],
				{
					startedAt: 0,
					endedAt: 14_000,
					runs: [{ startedAt: 500, endedAt: 11_200 }],
				},
			),
			false,
		);

		expect(rows()).toEqual(["Reading script · 2 steps · 12s"]);
		expect(container.textContent).not.toContain("weighing");
		expect(container.textContent).toContain("Worked for 14s");
	});

	it("gives each run between replies its own row", async () => {
		await render(
			turn(
				[
					read,
					{ type: "text", text: "Reading more.", state: "done" },
					{ type: "reasoning", text: "hmm", state: "done" },
					{ type: "text", text: "Done.", state: "done" },
				],
				{
					startedAt: 0,
					endedAt: 9000,
					runs: [
						{ startedAt: 0, endedAt: 1000 },
						{ startedAt: 5000, endedAt: 7000 },
					],
				},
			),
			false,
		);

		expect(rows()).toEqual([
			"Reading script · 1 step · 1s",
			"Thinking · 1 step · 2s",
		]);
	});

	it("shows the steps when a row is expanded", async () => {
		await render(
			turn([
				{ type: "reasoning", text: "weighing", state: "done" },
				{ type: "text", text: "Done.", state: "done" },
			]),
			false,
		);

		await act(async () =>
			container.querySelector<HTMLButtonElement>("button")?.click(),
		);

		expect(rows()).toContain("Done thinking");
	});

	it("says so when a step failed", async () => {
		await render(turn([read, failed]), false);

		expect(rows()).toEqual(["Reading script · 2 steps · failed"]);
	});

	it("shows the run Sloppy is still on as the working status", async () => {
		await render(turn([read]), true);

		expect(rows()).toEqual(["Reading script…· 0s"]);
	});

	it("shows the working status before anything has streamed", async () => {
		await render(turn([{ type: "step-start" }]), true);

		expect(rows()).toEqual(["Slopping…· 0s"]);
	});

	it("settles the working status in place, keeping a reader's toggle", async () => {
		await render(turn([read]), true);
		await act(async () =>
			container.querySelector<HTMLButtonElement>("button")?.click(),
		);

		await render(
			turn([read, { type: "text", text: "Done.", state: "done" }]),
			false,
		);

		const row = container.querySelector("button[aria-expanded]");
		expect(row?.textContent).toBe("Reading script · 1 step");
		expect(row?.getAttribute("aria-expanded")).toBe("true");
	});

	it("settles a turn that was stopped mid-thought", async () => {
		await render(
			turn([{ type: "reasoning", text: "half a thought", state: "streaming" }]),
			false,
		);

		expect(rows()).toEqual(["Thinking · 1 step"]);
	});
});
