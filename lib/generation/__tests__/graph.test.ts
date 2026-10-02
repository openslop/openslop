import { describe, expect, it } from "vitest";
import { flattenGraph } from "../graph";
import { jobNode as node } from "./_graph";

describe("flattenGraph", () => {
	it("orders dependencies before dependents and visits shared nodes once", () => {
		const shared = node("shared");
		const left = node("left", [shared]);
		const right = node("right", [shared]);

		expect(flattenGraph([left, right]).map((n) => n.id)).toEqual([
			"shared",
			"left",
			"right",
		]);
	});
});
