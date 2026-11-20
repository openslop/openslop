import { describe, expect, it } from "vitest";
import {
	ASPECT_RATIO_DIMENSIONS,
	ASPECT_RATIOS,
} from "@/lib/project/aspect-ratio";
import { RESOLUTIONS, renderScale } from "../resolutions";

describe("renderScale", () => {
	it("renders 1080p at the project's own canvas", () => {
		expect(renderScale("1080p")).toBe(1);
	});

	it("scales a portrait canvas by the same factor as a landscape one", () => {
		const scale = renderScale("4K");
		const { output } = ASPECT_RATIO_DIMENSIONS["9:16"];
		expect([output.width * scale, output.height * scale]).toEqual([2160, 3840]);
	});
});

describe("renderScale output dimensions", () => {
	const cases = RESOLUTIONS.flatMap((resolution) =>
		ASPECT_RATIOS.map((ratio) => [resolution, ratio] as const),
	);

	it.each(cases)(
		"%s %s renders whole, even pixel dimensions",
		(resolution, ratio) => {
			const scale = renderScale(resolution);
			const { output } = ASPECT_RATIO_DIMENSIONS[ratio];
			for (const side of [output.width * scale, output.height * scale]) {
				expect(Number.isInteger(side)).toBe(true);
				expect(side % 2).toBe(0);
			}
		},
	);
});
