import { describe, expect, it } from "vitest";
import type { User } from "@supabase/supabase-js";
import { monthlyBudget } from "../budget";

const SIGNUP = "2026-06-14T09:30:00Z";

const user = (app_metadata: Record<string, unknown> = {}) =>
	({ id: "u1", created_at: SIGNUP, app_metadata }) as unknown as User;

describe("monthlyBudget", () => {
	it("starts the first cycle at signup", () => {
		expect(monthlyBudget(user())).toEqual({
			usd: 100,
			since: new Date(SIGNUP),
			until: new Date("2026-07-14T09:30:00Z"),
		});
	});

	it("starts at the cycle billing recorded", () => {
		const budget = monthlyBudget(
			user({ billing_cycle_start: "2026-10-14T09:30:00+00:00" }),
		);

		expect(budget.since).toEqual(new Date("2026-10-14T09:30:00Z"));
	});

	it("refreshes on the last day of a month too short for the cycle's day", () => {
		const budget = monthlyBudget(
			user({ billing_cycle_start: "2027-01-31T00:00:00Z" }),
		);

		expect(budget.until).toEqual(new Date("2027-02-28T00:00:00Z"));
	});

	it("rolls a December cycle into the next year", () => {
		const budget = monthlyBudget(
			user({ billing_cycle_start: "2026-12-14T00:00:00Z" }),
		);

		expect(budget.until).toEqual(new Date("2027-01-14T00:00:00Z"));
	});

	it("takes the account's own budget over the default", () => {
		expect(monthlyBudget(user({ monthly_budget_usd: 25 })).usd).toBe(25);
	});

	it("rejects a budget that is not a non-negative number", () => {
		expect(() => monthlyBudget(user({ monthly_budget_usd: -1 }))).toThrow();
	});

	it("rejects a cycle start that is not a timestamp", () => {
		expect(() =>
			monthlyBudget(user({ billing_cycle_start: "last tuesday" })),
		).toThrow();
	});
});
