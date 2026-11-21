// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { Editor } from "slate";
import { ZERO_WIDTH_SPACE } from "@/lib/canvas/constants";
import { TooltipProvider } from "@/components/ui/tooltip";
import { inputsFor } from "@/lib/generation/__tests__/_graph";
import { totalCostUsd, type ElementVersion } from "@/lib/generation/versions";
import type { ElementVersionHistory } from "@/app/components/canvas/hooks/use-element-history";
import { content, scene } from "@/app/components/canvas/__tests__/fixtures";
import { click, mountOnCanvas } from "@/app/components/canvas/__tests__/_mount";
import { ElementHistoryPopover } from "../element-history-popover";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const loadHistory = vi.fn();
let history: ElementVersionHistory;
vi.mock("@/app/components/canvas/hooks/use-element-history", () => ({
	useElementHistory: () => history,
	useElementHistoryCostUsd: () => totalCostUsd(history.versions),
	useLoadElementHistory: () => loadHistory,
}));
vi.mock("@/lib/components/use-peaks", () => ({
	usePeaks: () => ({ status: "ready", peaks: [] }),
}));
let element: { layoutAttributes: { volume: string } };
vi.mock("../element-generation-context", () => ({
	useElementGeneration: () => ({ element }),
}));
const restoreResult = vi.fn();
vi.mock("@/lib/generation/generation-queue-provider", () => ({
	useGenerationQueue: () => ({ restoreResult }),
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
			<ElementHistoryPopover elementId="el-1" />
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

const videoTake = (prompt: string): ElementVersion => ({
	...audioTake(prompt),
	connectorType: "video",
	elementType: "video",
	result: { videoUrl: `https://video/${prompt}.mp4`, durationSec: 5 },
});

afterEach(() => canvas.unmount());

describe("ElementHistoryPopover", () => {
	it("shows each take's cost and the total in the header", async () => {
		const costing = (prompt: string, costUsd?: number): ElementVersion => {
			const take = videoTake(prompt);
			return { ...take, result: { ...take.result, costUsd } };
		};
		history = {
			versions: [costing("a", 0.25), costing("b"), costing("c", 0.12)],
			status: "ready",
			activeIndex: 2,
		};
		renderPopover();
		await click('button[aria-label="Generation history"]');

		const badges = Array.from(
			document.body.querySelectorAll('[data-slot="badge"]'),
			(badge) => badge.textContent,
		);
		expect(badges).toEqual(["Total$0.37", "Cost$0.12", "Cost$0.25"]);
	});

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

	it("restores a take onto the queue and the element's prompt, then closes", async () => {
		canvas.unmount();
		canvas = mountOnCanvas([
			scene([content("video", "el-1", "harbor at dusk")]),
		]);
		history = {
			versions: [videoTake("harbor"), videoTake("harbor at dusk")],
			status: "ready",
			activeIndex: 1,
		};
		renderPopover();
		await click('button[aria-label="Generation history"]');

		await click('button[aria-label="Restore"]');

		const [take] = history.versions;
		expect(restoreResult).toHaveBeenCalledWith(take);
		expect(Editor.string(canvas.editor, [0, 0])).toBe(
			`${ZERO_WIDTH_SPACE}harbor`,
		);
		expect(document.body.querySelector('[role="dialog"]')).toBeNull();
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

	it("plays a take full size over the history, which stays open behind it", async () => {
		history = {
			versions: [videoTake("harbor"), videoTake("harbor at dusk")],
			status: "ready",
			activeIndex: 1,
		};
		renderPopover();
		await click('button[aria-label="Generation history"]');
		await click('button[aria-label="View version 1 larger"]');

		const [popover, viewer] = Array.from(
			document.body.querySelectorAll('[role="dialog"]'),
		);
		expect(popover?.getAttribute("aria-label")).toBe("Generation history");
		const take = viewer?.querySelector("video");
		expect(take?.getAttribute("src")).toBe("https://video/harbor.mp4");
		expect(take?.controls).toBe(true);
	});

	it("closes the viewer on Escape and keeps the history open", async () => {
		history = {
			versions: [videoTake("harbor")],
			status: "ready",
			activeIndex: 0,
		};
		renderPopover();
		await click('button[aria-label="Generation history"]');
		const view = 'button[aria-label="View version 1 larger"]';
		document.body.querySelector<HTMLElement>(view)?.focus();
		await click(view);
		await act(async () => {
			document.activeElement?.dispatchEvent(
				new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
			);
		});
		await act(() => new Promise((resolve) => setTimeout(resolve)));

		const dialogs = Array.from(
			document.body.querySelectorAll('[role="dialog"]'),
		);
		expect(dialogs.map((dialog) => dialog.getAttribute("aria-label"))).toEqual([
			"Generation history",
		]);
		expect(document.activeElement).toBe(document.body.querySelector(view));
	});
});
