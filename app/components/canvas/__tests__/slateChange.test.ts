import { describe, expect, it } from "vitest";
import type { Operation } from "slate";
import { affectsDocument } from "../utils/slateChange";

describe("affectsDocument", () => {
	it("ignores selection-only Slate operations", () => {
		const operations: Operation[] = [
			{
				type: "set_selection",
				properties: null,
				newProperties: {
					anchor: { path: [0, 0], offset: 0 },
					focus: { path: [0, 0], offset: 0 },
				},
			},
		];

		expect(affectsDocument(operations)).toBe(false);
	});

	it("detects document edits", () => {
		const operations: Operation[] = [
			{
				type: "set_selection",
				properties: null,
				newProperties: {
					anchor: { path: [0, 0], offset: 0 },
					focus: { path: [0, 0], offset: 0 },
				},
			},
			{ type: "insert_text", path: [0, 0], offset: 0, text: "a" },
		];

		expect(affectsDocument(operations)).toBe(true);
	});
});
