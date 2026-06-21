import { describe, expect, it } from "vitest";
import {
	clampRestoredFrame,
	rememberPlayerFrame,
	restorePlayerFrame,
} from "../playerFrameRestore";

describe("clampRestoredFrame", () => {
	it("keeps an in-range frame", () => {
		expect(clampRestoredFrame(42, 100)).toBe(42);
	});

	it("clamps to the last available frame when a layout gets shorter", () => {
		expect(clampRestoredFrame(120, 80)).toBe(79);
	});

	it("clamps negative and empty layouts to frame 0", () => {
		expect(clampRestoredFrame(-4, 80)).toBe(0);
		expect(clampRestoredFrame(12, 0)).toBe(0);
	});
});

describe("player frame restore", () => {
	it("remembers the outgoing player's current frame", () => {
		const frameRef = { current: null as number | null };

		rememberPlayerFrame({ getCurrentFrame: () => 37 }, frameRef);

		expect(frameRef.current).toBe(37);
	});

	it("restores the next player to the remembered clamped frame", () => {
		const seekCalls: number[] = [];
		const frameRef = { current: 120 };

		restorePlayerFrame(
			{ seekTo: (frame) => seekCalls.push(frame) },
			frameRef,
			80,
		);

		expect(seekCalls).toEqual([79]);
	});

	it("does not seek a fresh player when there is no remembered frame", () => {
		const seekCalls: number[] = [];

		restorePlayerFrame(
			{ seekTo: (frame) => seekCalls.push(frame) },
			{ current: null },
			80,
		);

		expect(seekCalls).toEqual([]);
	});
});
