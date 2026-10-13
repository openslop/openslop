import { utc } from "@date-fns/utc";
import type { User } from "@supabase/supabase-js";
import { addMonths, differenceInCalendarMonths, isAfter } from "date-fns";
import { z } from "zod";
import { MANAGED_PROVIDER } from "@/lib/connectors/provider-catalog";
import { spentSince } from "./jobs";
import { tooManyRequests } from "./response";

const DEFAULT_MONTHLY_BUDGET_USD = 100;

const BillingMetadata = z.object({
	billing_cycle_anchor: z.iso.datetime({ offset: true }).optional(),
	monthly_budget_usd: z
		.number()
		.nonnegative()
		.default(DEFAULT_MONTHLY_BUDGET_USD),
});

type BillingPeriod = { start: Date; end: Date };

/** The monthly period, counted from the anchor, that `now` falls in. */
export function billingPeriod(anchor: Date, now: Date): BillingPeriod {
	const nthStart = (n: number) => addMonths(anchor, n, { in: utc });
	const months = differenceInCalendarMonths(now, anchor, { in: utc });
	const elapsed = isAfter(nthStart(months), now) ? months - 1 : months;
	return { start: nthStart(elapsed), end: nthStart(elapsed + 1) };
}

/** Anchored at signup until billing records an anchor. */
export function monthlyBudget(user: User, now = new Date()) {
	const billing = BillingMetadata.parse(user.app_metadata);
	const anchor = new Date(billing.billing_cycle_anchor ?? user.created_at);
	return {
		usd: billing.monthly_budget_usd,
		period: billingPeriod(anchor, now),
	};
}

const USD = new Intl.NumberFormat("en", { style: "currency", currency: "USD" });
const DAY = new Intl.DateTimeFormat("en", {
	month: "long",
	day: "numeric",
	timeZone: "UTC",
});

export async function refuseOverBudget(user: User): Promise<Response | null> {
	const { usd, period } = monthlyBudget(user);
	const spent = await spentSince(user.id, MANAGED_PROVIDER, period.start);
	if (spent < usd) return null;
	return tooManyRequests(
		`You've used your ${USD.format(usd)} generation budget. Your credits refresh on ${DAY.format(period.end)}.`,
	);
}
