import { describe, expect, it } from "vitest";
import type { User } from "@supabase/supabase-js";
import { billingPeriod, monthlyBudget } from "../budget";

const at = (iso: string) => new Date(iso);

const period = (anchor: string, now: string) =>
	billingPeriod(at(anchor), at(now));

describe("billingPeriod", () => {
	it("runs from this month's anchor day to next month's", () => {
		expect(period("2026-01-05T09:30:00Z", "2026-07-12T00:00:00Z")).toEqual({
			start: at("2026-07-05T09:30:00Z"),
			end: at("2026-08-05T09:30:00Z"),
		});
	});

	it("is still last month's period before this month's anchor day", () => {
		expect(period("2026-01-05T09:30:00Z", "2026-07-03T00:00:00Z")).toEqual({
			start: at("2026-06-05T09:30:00Z"),
			end: at("2026-07-05T09:30:00Z"),
		});
	});

	it("turns over at the anchor's time of day, not at midnight", () => {
		const { start } = period("2026-01-05T09:30:00Z", "2026-07-05T09:00:00Z");

		expect(start).toEqual(at("2026-06-05T09:30:00Z"));
	});

	it("falls on a short month's last day, then returns to the anchor day", () => {
		const anchor = "2026-01-31T00:00:00Z";

		expect(period(anchor, "2026-02-28T12:00:00Z")).toEqual({
			start: at("2026-02-28T00:00:00Z"),
			end: at("2026-03-31T00:00:00Z"),
		});
		expect(period(anchor, "2026-04-30T12:00:00Z").end).toEqual(
			at("2026-05-31T00:00:00Z"),
		);
	});

	it("rolls a December period into the next year", () => {
		expect(period("2025-03-20T00:00:00Z", "2026-12-25T00:00:00Z")).toEqual({
			start: at("2026-12-20T00:00:00Z"),
			end: at("2027-01-20T00:00:00Z"),
		});
	});

	it("starts the first period at the anchor itself", () => {
		const { start } = period("2026-10-12T08:00:00Z", "2026-10-12T08:00:00Z");

		expect(start).toEqual(at("2026-10-12T08:00:00Z"));
	});
});

const SIGNUP = "2026-06-14T09:30:00Z";

const user = (app_metadata: Record<string, unknown> = {}) =>
	({ id: "u1", created_at: SIGNUP, app_metadata }) as unknown as User;

describe("monthlyBudget", () => {
	const NOW = at("2026-10-20T00:00:00Z");

	it("anchors at signup until billing records an anchor", () => {
		expect(monthlyBudget(user(), NOW)).toEqual({
			usd: 100,
			period: {
				start: at("2026-10-14T09:30:00Z"),
				end: at("2026-11-14T09:30:00Z"),
			},
		});
	});

	it("anchors at the cycle billing recorded", () => {
		const { period } = monthlyBudget(
			user({ billing_cycle_anchor: "2026-03-02T00:00:00+00:00" }),
			NOW,
		);

		expect(period.start).toEqual(at("2026-10-02T00:00:00Z"));
	});

	it("takes the account's own budget over the default", () => {
		expect(monthlyBudget(user({ monthly_budget_usd: 25 }), NOW).usd).toBe(25);
	});

	it("rejects a budget that is not a non-negative number", () => {
		expect(() =>
			monthlyBudget(user({ monthly_budget_usd: -1 }), NOW),
		).toThrow();
	});

	it("rejects an anchor that is not a timestamp", () => {
		expect(() =>
			monthlyBudget(user({ billing_cycle_anchor: "last tuesday" }), NOW),
		).toThrow();
	});
});
