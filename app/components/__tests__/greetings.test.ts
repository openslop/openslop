import { describe, expect, it } from "vitest";
import { GREETINGS, greetingFor } from "../greetings";

describe("greetingFor", () => {
	it("returns the same greeting for the same project", () => {
		const id = crypto.randomUUID();
		expect(greetingFor(id)).toBe(greetingFor(id));
	});

	it("spreads projects across every greeting", () => {
		const seen = new Set(
			Array.from({ length: 500 }, () => greetingFor(crypto.randomUUID())),
		);
		expect(seen).toEqual(new Set(GREETINGS));
	});
});
