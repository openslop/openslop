// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { inputsFor } from "@/lib/generation/__tests__/_graph";
import type { ElementVersion } from "@/lib/generation/versions";
import type { ElementVersionHistory } from "../../hooks/use-element-history";
import { click, mountOnCanvas } from "../../__tests__/_mount";
import { ElementHistoryPopover } from "../element-history-popover";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const loadHistory = vi.fn();
let history: ElementVersionHistory;
vi.mock("../../hooks/use-element-history", () => ({
	useElementHistory: () => history,
	useLoadElementHistory: () => loadHistory,
}));
vi.mock("@/lib/components/use-peaks", () => ({
	usePeaks: () => ({ status: "ready", peaks: [] }),
}));
let element: { layoutAttributes: { volume: string } };
vi.mock("../element-generation-context", () => ({
	useElementGeneration: () => ({ element }),
}));
vi.mock("@/lib/generation/generation-queue-provider", () => ({
	useGenerationQueue: () => ({ restoreResult: vi.fn() }),
}));

let canvas: ReturnType<typeof mountOnCanvas>;

beforeEach(() => {
	history = { versions: [], status: "failed", activeIndex: -1 };
	element = { layoutAttributes: { volume: "4" } };
	canvas = mountOnCanvas();
	renderPopover();
});

function renderPopover() {
	canvas.render(
		<TooltipProvider>
			<ElementHistoryPopover elementId="el-1" onRestore={() => {}} />
		</TooltipProvider>,
	);
}

const audioTake = (prompt: string): ElementVersion => ({
	elementId: "el-1",
	createdAt: "2026-01-01T00:00:00.000Z",
	connectorType: "sfx",
	elementType: "sound",
	inputs: inputsFor(prompt),
	result: { audioUrl: `https://audio/${prompt}.mp3`, durationSec: 2 },
	pinned: false,
});

afterEach(() => canvas.unmount());

describe("ElementHistoryPopover", () => {
	it("announces a failed read and offers to try again without closing", async () => {
		await click('button[aria-label="Generation history"]');
		expect(loadHistory).toHaveBeenCalledWith("el-1");
		expect(document.body.querySelector('[role="alert"]')?.textContent).toBe(
			"Could not load history.",
		);

		const retry = Array.from(document.body.querySelectorAll("button")).find(
			(button) => button.textContent === "Try again",
		);
		if (!retry) throw new Error("no Try again button");
		await act(async () => retry.click());
		expect(loadHistory).toHaveBeenCalledTimes(2);
		expect(document.body.querySelector('[role="dialog"]')).not.toBeNull();
	});

	it("plays each audio take at the element's volume, following a change", async () => {
		history = {
			versions: [audioTake("door"), audioTake("door slam")],
			status: "ready",
			activeIndex: 1,
		};
		renderPopover();
		await click('button[aria-label="Generation history"]');

		const takes = () => Array.from(document.body.querySelectorAll("audio"));
		expect(takes().map((audio) => audio.volume)).toEqual([0.4, 0.4]);

		element = { layoutAttributes: { volume: "8" } };
		renderPopover();
		expect(takes().map((audio) => audio.volume)).toEqual([0.8, 0.8]);
	});
});
