// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
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
vi.mock("@/lib/generation/generation-queue-provider", () => ({
	useGenerationQueue: () => ({ restoreResult: vi.fn() }),
}));

let canvas: ReturnType<typeof mountOnCanvas>;

beforeEach(() => {
	loadHistory.mockClear();
	history = { versions: [], status: "failed", activeIndex: -1 };
	canvas = mountOnCanvas();
	canvas.render(
		<TooltipProvider>
			<ElementHistoryPopover elementId="el-1" onRestore={() => {}} />
		</TooltipProvider>,
	);
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
});
