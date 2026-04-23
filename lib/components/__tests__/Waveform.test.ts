import { describe, expect, it } from "vitest";
import { extractPeaks, drawBars, type BarStyle } from "../Waveform";

const S: BarStyle = {
	barWidth: 3,
	barGap: 3,
	barRadius: 4,
	waveColor: "gray",
	progressColor: "white",
};

/* ---------- extractPeaks ---------- */

describe("extractPeaks", () => {
	it("extracts correct number of peaks", () => {
		const data = new Float32Array(1000);
		for (let i = 0; i < data.length; i++) data[i] = Math.sin(i * 0.1);
		const peaks = extractPeaks(data, 10);
		expect(peaks).toHaveLength(10);
	});

	it("normalizes peaks to 0–1 range", () => {
		const data = new Float32Array([0.2, -0.5, 0.8, -0.3, 0.1, 0.9, -0.4, 0.6]);
		const peaks = extractPeaks(data, 2);
		expect(Math.max(...peaks)).toBe(1);
		peaks.forEach((p) => {
			expect(p).toBeGreaterThanOrEqual(0);
			expect(p).toBeLessThanOrEqual(1);
		});
	});

	it("returns all zeros for silent audio", () => {
		const data = new Float32Array(100);
		const peaks = extractPeaks(data, 5);
		expect(peaks).toHaveLength(5);
		peaks.forEach((p) => expect(p).toBe(0));
	});

	it("returns empty array when data is shorter than count", () => {
		const data = new Float32Array(3);
		const peaks = extractPeaks(data, 10);
		expect(peaks).toHaveLength(0);
	});

	it("handles single-sample-per-peak correctly", () => {
		const data = new Float32Array([0.5, -1.0, 0.25, 0.75]);
		const peaks = extractPeaks(data, 4);
		expect(peaks).toEqual([0.5, 1.0, 0.25, 0.75]);
	});

	it("takes absolute value (negative samples become positive peaks)", () => {
		const data = new Float32Array([-0.8, -0.4, 0.2, 0.1]);
		const peaks = extractPeaks(data, 2);
		// Bucket 0: max(abs(-0.8), abs(-0.4)) = 0.8
		// Bucket 1: max(abs(0.2), abs(0.1)) = 0.2
		// Normalized: [1.0, 0.25]
		expect(peaks[0]).toBe(1);
		expect(peaks[1]).toBe(0.25);
	});

	it("handles uniform amplitude", () => {
		const data = new Float32Array(20).fill(0.5);
		const peaks = extractPeaks(data, 4);
		peaks.forEach((p) => expect(p).toBe(1));
	});
});

/* ---------- drawBars ---------- */

describe("drawBars", () => {
	function mockCtx() {
		const calls: { method: string; args: unknown[] }[] = [];
		return {
			calls,
			ctx: {
				clearRect: (...args: unknown[]) =>
					calls.push({ method: "clearRect", args }),
				beginPath: () => calls.push({ method: "beginPath", args: [] }),
				roundRect: (...args: unknown[]) =>
					calls.push({ method: "roundRect", args }),
				fill: () => calls.push({ method: "fill", args: [] }),
				save: () => calls.push({ method: "save", args: [] }),
				restore: () => calls.push({ method: "restore", args: [] }),
				rect: (...args: unknown[]) => calls.push({ method: "rect", args }),
				clip: () => calls.push({ method: "clip", args: [] }),
				fillStyle: "" as string,
			} as unknown as CanvasRenderingContext2D,
		};
	}

	it("clears the canvas", () => {
		const { ctx, calls } = mockCtx();
		drawBars(ctx, 100, 40, [0.5, 1.0], 0, S);
		expect(calls[0]).toEqual({
			method: "clearRect",
			args: [0, 0, 100, 40],
		});
	});

	it("draws nothing when peaks are empty", () => {
		const { ctx, calls } = mockCtx();
		drawBars(ctx, 100, 40, [], 0, S);
		expect(calls).toHaveLength(1); // only clearRect
	});

	it("draws nothing when width is zero", () => {
		const { ctx, calls } = mockCtx();
		drawBars(ctx, 0, 40, [0.5], 0, S);
		expect(calls).toHaveLength(1); // only clearRect
	});

	it("draws correct number of bars based on width", () => {
		const { ctx, calls } = mockCtx();
		// width=30, barWidth=3, barGap=3 → total=6 → 5 bars
		drawBars(ctx, 30, 40, Array(200).fill(0.5), 0, S);
		const roundRectCalls = calls.filter((c) => c.method === "roundRect");
		expect(roundRectCalls).toHaveLength(5);
	});

	it("draws waveColor pass then clipped progressColor pass", () => {
		const { ctx, calls } = mockCtx();
		drawBars(ctx, 12, 40, Array(200).fill(0.5), 0.5, S);
		const methods = calls.map((c) => c.method);
		expect(methods).toContain("save");
		expect(methods).toContain("clip");
		expect(methods).toContain("restore");
		expect(calls.filter((c) => c.method === "fill")).toHaveLength(2);
	});

	it("skips progress pass when progress is 0", () => {
		const { ctx, calls } = mockCtx();
		drawBars(ctx, 12, 40, Array(200).fill(0.5), 0, S);
		// Only one fill call (waveColor pass), no clip
		expect(calls.filter((c) => c.method === "fill")).toHaveLength(1);
		expect(calls.filter((c) => c.method === "clip")).toHaveLength(0);
	});

	it("draws both passes when progress is 1", () => {
		const { ctx, calls } = mockCtx();
		drawBars(ctx, 12, 40, Array(200).fill(0.5), 1, S);
		expect(calls.filter((c) => c.method === "fill")).toHaveLength(2);
		expect(calls.filter((c) => c.method === "clip")).toHaveLength(1);
	});

	it("clips at exact progress pixel", () => {
		const { ctx, calls } = mockCtx();
		// width=100, progress=0.3 → px=30
		drawBars(ctx, 100, 40, Array(200).fill(0.5), 0.3, S);
		const rectCall = calls.find((c) => c.method === "rect");
		expect(rectCall).toBeDefined();
		expect(rectCall?.args).toEqual([0, 0, 30, 40]);
	});

	it("bars are vertically centered", () => {
		const { ctx, calls } = mockCtx();
		const cssH = 40;
		// Single bar, peak = 1.0 → barHeight = max(2, 1.0 * 38) = 38
		// y = (40 - 38) / 2 = 1
		drawBars(ctx, 6, cssH, [1.0], 0, S);
		const rr = calls.find((c) => c.method === "roundRect");
		expect(rr).toBeDefined();
		const [x, y, w, h] = rr?.args as number[];
		expect(x).toBe(0);
		expect(y).toBe(1); // centered
		expect(w).toBe(3); // barWidth
		expect(h).toBe(38); // cssH - 2
	});

	it("enforces minimum bar height of 2", () => {
		const { ctx, calls } = mockCtx();
		// peak = 0 → barHeight = max(2, 0 * 38) = 2
		drawBars(ctx, 6, 40, [0], 0, S);
		const rr = calls.find((c) => c.method === "roundRect");
		const [, , , h] = rr?.args as number[];
		expect(h).toBe(2);
	});

	it("clamps border radius to half bar dimensions", () => {
		const { ctx, calls } = mockCtx();
		// barWidth=2, barRadius=10 → clamped to min(10, 1, bh/2)
		// peak=0 → bh=2 → radius = min(10, 1, 1) = 1
		drawBars(ctx, 5, 40, [0], 0, { ...S, barWidth: 2, barRadius: 10 });
		const rr = calls.find((c) => c.method === "roundRect");
		const radius = (rr?.args as number[])[4];
		expect(radius).toBe(1); // min(10, 2/2=1, 2/2=1)
	});
});
