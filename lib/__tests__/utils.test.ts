import { describe, expect, it } from "vitest";
import { cn, fromKeys, keysOf } from "../utils";

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
