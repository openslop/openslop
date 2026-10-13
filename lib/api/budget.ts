import type { User } from "@supabase/supabase-js";
import { z } from "zod";
import { MANAGED_PROVIDER } from "@/lib/connectors/provider-catalog";
import type { ModelRef } from "@/lib/connectors/types";
import { createJob, spentSince, type MeteredType } from "./jobs";
import { tooManyRequests } from "./response";
import type { RouteFamily } from "./route-families";

export type Budget = { usd: number; since: Date; until: Date };

const DEFAULT_MONTHLY_BUDGET_USD = 10;

const BudgetOverride = z.number().nonnegative().optional();

/** The calendar month in UTC, at the account's `app_metadata.monthly_budget_usd` or the default. */
export function monthlyBudget(user: User, now = new Date()): Budget {
	const year = now.getUTCFullYear();
	const month = now.getUTCMonth();
	return {
		usd:
			BudgetOverride.parse(user.app_metadata.monthly_budget_usd) ??
			DEFAULT_MONTHLY_BUDGET_USD,
		since: new Date(Date.UTC(year, month, 1)),
		until: new Date(Date.UTC(year, month + 1, 1)),
	};
}

const USD = new Intl.NumberFormat("en", { style: "currency", currency: "USD" });
const DAY = new Intl.DateTimeFormat("en", {
	month: "long",
	day: "numeric",
	timeZone: "UTC",
});

function budgetSpent(budget: Budget): Response {
	const retryAfterSeconds = Math.max(
		1,
		Math.ceil((budget.until.getTime() - Date.now()) / 1000),
	);
	return tooManyRequests(
		`You've used your ${USD.format(budget.usd)} generation budget. It resets on ${DAY.format(budget.until)}.`,
		retryAfterSeconds,
	);
}

type Admission =
	| { ok: true; jobId: string }
	| { ok: false; response: Response };

/** Opens a job while the account has budget left, or answers the 429 that says when it renews. */
export async function admitJob<TPicked extends ModelRef>(
	family: RouteFamily<TPicked>,
	user: User,
	type: MeteredType,
	job: { projectId?: string; request: Record<string, unknown> },
): Promise<Admission> {
	const budget = family.budget(user);
	if (
		budget &&
		(await spentSince(user.id, MANAGED_PROVIDER, budget.since)) >= budget.usd
	)
		return { ok: false, response: budgetSpent(budget) };
	const { id } = await createJob({
		...job,
		userId: user.id,
		connectorType: type,
	});
	return { ok: true, jobId: id };
}
