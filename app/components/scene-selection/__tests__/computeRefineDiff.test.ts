import { describe, expect, it } from "vitest";
import type { RefineOp } from "@/lib/script/refine/types";
import { computeRefineDiff } from "../computeRefineDiff";

describe("computeRefineDiff", () => {
	it("marks ids that are new since `before` as added", () => {
		const ops: RefineOp[] = [{ op: "insert", type: "image", text: "x" }];
		expect(computeRefineDiff(new Set(["a"]), ["a", "b"], ops)).toEqual({
			b: "added",
		});
	});

	it("marks surviving set-op targets as modified", () => {
		const ops: RefineOp[] = [{ op: "set", id: "a", text: "y" }];
		expect(computeRefineDiff(new Set(["a", "b"]), ["a", "b"], ops)).toEqual({
			a: "modified",
		});
	});

	it("marks remove-op targets as removed (still present during preview)", () => {
		const ops: RefineOp[] = [{ op: "remove", id: "b" }];
		expect(computeRefineDiff(new Set(["a", "b"]), ["a", "b"], ops)).toEqual({
			b: "removed",
		});
	});

	it("handles a mixed add + edit + remove diff", () => {
		const ops: RefineOp[] = [
			{ op: "insert", type: "sound", text: "rain" },
			{ op: "set", id: "a", text: "y" },
			{ op: "remove", id: "b" },
		];
		expect(
			computeRefineDiff(new Set(["a", "b"]), ["a", "b", "c"], ops),
		).toEqual({ c: "added", a: "modified", b: "removed" });
	});

	it("lets removed win over a same-id edit and tolerates already-gone ids", () => {
		const ops: RefineOp[] = [
			{ op: "set", id: "a", text: "y" },
			{ op: "remove", id: "a" },
			{ op: "remove", id: "b" },
		];
		expect(computeRefineDiff(new Set(["a"]), ["a"], ops)).toEqual({
			a: "removed",
			b: "removed",
		});
	});
});
