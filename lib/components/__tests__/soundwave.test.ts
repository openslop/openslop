import { describe, expect, it } from "vitest";
import { buildSoundwaveMask } from "../soundwave";

describe("buildSoundwaveMask", () => {
	it("emits one rect per bar", () => {
		const mask = decodeURIComponent(buildSoundwaveMask([10, 20, 30]));
		expect(mask.match(/<rect/g)).toHaveLength(3);
	});

	it("spreads bars evenly across the 0–100 viewBox", () => {
		const mask = decodeURIComponent(buildSoundwaveMask([50, 50, 50, 50]));
		// barW = 100 / 4 = 25, gap = 7.5 → first x = 3.75, second = 28.75
		expect(mask).toContain('x="3.75"');
		expect(mask).toContain('x="28.75"');
	});

	it("vertically centers each bar by its height", () => {
		const mask = decodeURIComponent(buildSoundwaveMask([40]));
		// y = (100 - 40) / 2 = 30
		expect(mask).toContain('y="30"');
		expect(mask).toContain('height="40"');
	});

	it("produces a data URL mask", () => {
		const mask = buildSoundwaveMask([10]);
		expect(mask.startsWith('url("data:image/svg+xml,')).toBe(true);
	});
});
