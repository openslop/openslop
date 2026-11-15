import { describe, expect, it } from "vitest";
import { cn, fromKeys, keysOf, pickOther } from "../utils";

describe("cn", () => {
	it("keeps a custom text size beside a text color", () => {
		expect(cn("text-label-xs", "text-muted-foreground")).toBe(
			"text-label-xs text-muted-foreground",
		);
	});

	it("lets a later custom text size override an earlier one", () => {
		expect(cn("text-hero", "text-display")).toBe("text-display");
	});

	it("lets a later custom font weight override an earlier one", () => {
		expect(cn("font-medium", "font-book")).toBe("font-book");
	});
});

describe("keysOf / fromKeys", () => {
	it("round-trips a record by its keys", () => {
		const record = { a: 1, b: 2 };
		expect(fromKeys(keysOf(record), (key) => record[key] * 10)).toEqual({
			a: 10,
			b: 20,
		});
	});
});

describe("pickOther", () => {
	const items = ["a", "b", "c"];

	it("never returns the current item", () => {
		for (const current of items) {
			for (let attempt = 0; attempt < 50; attempt++) {
				const picked = pickOther(items, current);
				expect(items).toContain(picked);
				expect(picked).not.toBe(current);
			}
		}
	});

	it("picks from the whole list when nothing is current", () => {
		expect(items).toContain(pickOther(items, ""));
	});
});
