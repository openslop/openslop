import { describe, expect, it } from "vitest";
import { GREETINGS, TIME_OF_DAY_GREETINGS, greetingFor } from "../greetings";

const { lateNight, morning, afternoon, evening } = TIME_OF_DAY_GREETINGS;

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

	it("falls back to a generic greeting without an hour", () => {
		expect(GREETINGS).toContain(greetingFor(crypto.randomUUID()));
	});

	it.each([
		[0, lateNight],
		[4, lateNight],
		[5, morning],
		[11, morning],
		[12, afternoon],
		[16, afternoon],
		[17, evening],
		[21, evening],
		[22, lateNight],
		[23, lateNight],
	])("picks the greeting for hour %i from its time of day", (hour, pool) => {
		expect(pool).toContain(greetingFor(crypto.randomUUID(), hour));
	});

	it("returns the same greeting for the same project and hour", () => {
		const id = crypto.randomUUID();
		expect(greetingFor(id, 3)).toBe(greetingFor(id, 3));
	});

	it("spreads projects across every greeting of a time of day", () => {
		const seen = new Set(
			Array.from({ length: 500 }, () => greetingFor(crypto.randomUUID(), 9)),
		);
		expect(seen).toEqual(new Set(morning));
	});

	it("keeps em dashes out of the copy", () => {
		const copy = [...GREETINGS, ...Object.values(TIME_OF_DAY_GREETINGS).flat()];
		expect(copy.join("")).not.toContain("—");
	});
});
