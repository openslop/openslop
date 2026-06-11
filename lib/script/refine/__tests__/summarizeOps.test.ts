import { describe, expect, it } from "vitest";
import type { RefineOp } from "../types";
import { summarizeRefineOps } from "../summarizeOps";

describe("summarizeRefineOps", () => {
	it("returns a no-op message for an empty op list", () => {
		expect(summarizeRefineOps([])).toBe("No changes suggested.");
	});

	it("counts inserts by element type with pluralization", () => {
		const ops: RefineOp[] = [
			{ op: "insert", type: "image", text: "a" },
			{ op: "insert", type: "image", text: "b" },
			{ op: "insert", type: "narration", text: "c" },
		];
		expect(summarizeRefineOps(ops)).toBe("Added 2 images, 1 narration.");
	});

	it("describes attribute changes by friendly name and count", () => {
		const ops: RefineOp[] = [
			{ op: "set", id: "1", attrs: { motion: "kenBurnsIn" } },
			{ op: "set", id: "2", attrs: { motion: "kenBurnsOut" } },
		];
		expect(summarizeRefineOps(ops)).toBe("Set motion on 2 elements.");
	});

	it("counts text rewrites", () => {
		const ops: RefineOp[] = [
			{ op: "set", id: "1", text: "new line" },
			{ op: "set", id: "2", text: "another" },
		];
		expect(summarizeRefineOps(ops)).toBe("Rewrote 2 lines.");
	});

	it("combines mixed ops into one sentence", () => {
		const ops: RefineOp[] = [
			{ op: "insert", type: "sound", text: "rain" },
			{ op: "set", id: "1", text: "x" },
			{ op: "remove", id: "2" },
		];
		expect(summarizeRefineOps(ops)).toBe(
			"Added 1 sound, rewrote 1 line and removed 1 element.",
		);
	});
});
