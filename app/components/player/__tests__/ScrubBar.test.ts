import { describe, expect, it } from "vitest";
import { segmentStyle } from "../ScrubBar";

type Vars = Record<string, unknown>;

describe("segmentStyle", () => {
	it("lays segments end to end by their basis", () => {
		const styles = segmentStyle([
			{ id: "a", basis: 0.25 },
			{ id: "b", basis: 0.5 },
			{ id: "c", basis: 0.25 },
		]) as Vars[];

		expect(styles.map((s) => s.flexBasis)).toEqual(["25%", "50%", "25%"]);
		expect(styles.map((s) => s["--seg-start"])).toEqual([0, 0.25, 0.75]);
		expect(styles.map((s) => s["--seg-scale"])).toEqual([4, 2, 4]);
	});

	it("keeps a zero-width segment's scale finite", () => {
		const [zero] = segmentStyle([{ id: "a", basis: 0 }]) as Vars[];

		expect(zero["--seg-scale"]).toBe(0);
	});
});
