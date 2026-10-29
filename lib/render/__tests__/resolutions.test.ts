import { describe, expect, it } from "vitest";
import { ASPECT_RATIO_DIMENSIONS } from "@/lib/project/aspect-ratio";
import { renderScale } from "../resolutions";

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
