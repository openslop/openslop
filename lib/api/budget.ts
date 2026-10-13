import type { User } from "@supabase/supabase-js";
import { z } from "zod";
import { MANAGED_PROVIDER } from "@/lib/connectors/provider-catalog";
import { spentSince } from "./jobs";
import { tooManyRequests } from "./response";

const DEFAULT_MONTHLY_BUDGET_USD = 100;

const BillingMetadata = z.object({
	billing_cycle_start: z.iso.datetime({ offset: true }).optional(),
	monthly_budget_usd: z
		.number()
		.nonnegative()
		.default(DEFAULT_MONTHLY_BUDGET_USD),
});

export type Budget = { usd: number; since: Date; until: Date };

/** A month on, held to the month's last day when it is shorter (Jan 31 to Feb 28). */
function monthAfter(date: Date): Date {
	const next = new Date(date);
	next.setUTCMonth(next.getUTCMonth() + 1);
	if (next.getUTCDate() !== date.getUTCDate()) next.setUTCDate(0);
	return next;
}

/** The account's current cycle, which starts at signup until billing records one. */
export function monthlyBudget(user: User): Budget {
	const billing = BillingMetadata.parse(user.app_metadata);
	const since = new Date(billing.billing_cycle_start ?? user.created_at);
	return { usd: billing.monthly_budget_usd, since, until: monthAfter(since) };
}

const USD = new Intl.NumberFormat("en", { style: "currency", currency: "USD" });
const DAY = new Intl.DateTimeFormat("en", {
	month: "long",
	day: "numeric",
	timeZone: "UTC",
});

/** The 429 once this cycle's spend reaches the budget, or null while some is left. */
export async function refuseOverBudget(user: User): Promise<Response | null> {
	const { usd, since, until } = monthlyBudget(user);
	if ((await spentSince(user.id, MANAGED_PROVIDER, since)) < usd) return null;
	return tooManyRequests(
		`You've used your ${USD.format(usd)} generation budget. Your credits refresh on ${DAY.format(until)}.`,
	);
}
