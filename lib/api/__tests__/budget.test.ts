import { describe, expect, it } from "vitest";
import type { User } from "@supabase/supabase-js";
import { monthlyBudget } from "../budget";

const user = (app_metadata: Record<string, unknown> = {}) =>
	({ id: "u1", app_metadata }) as unknown as User;

describe("monthlyBudget", () => {
	it("runs from the start of this UTC month to the start of the next", () => {
		const budget = monthlyBudget(user(), new Date("2026-10-12T15:00:00Z"));

		expect(budget).toEqual({
			usd: 10,
			since: new Date("2026-10-01T00:00:00Z"),
			until: new Date("2026-11-01T00:00:00Z"),
		});
	});

	it("rolls December over into the next year", () => {
		const budget = monthlyBudget(user(), new Date("2026-12-31T23:59:00Z"));

		expect(budget.until).toEqual(new Date("2027-01-01T00:00:00Z"));
	});

	it("takes the account's own budget over the default", () => {
		expect(monthlyBudget(user({ monthly_budget_usd: 25 })).usd).toBe(25);
	});

	it("rejects a budget that is not a non-negative number", () => {
		expect(() => monthlyBudget(user({ monthly_budget_usd: -1 }))).toThrow();
	});
});
