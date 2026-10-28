import type { User } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { getUser } from "./auth";
import { refuseOverBudget } from "./budget";
import { hasApiAccess, MissingProviderKeyError } from "./provider-keys";
import { logger } from "./logger";
import { badRequest, forbidden, serverError, unauthorized } from "./response";

type RouteBody = (user: User) => Promise<Response>;
type Authorize = (user: User) => Promise<Response | null>;

// Uniform error envelope: an unconnected provider is the caller's to fix, so it
// comes back as a 400; anything else is logged and returned as 500.
async function runGuarded(
	label: string,
	run: () => Promise<Response>,
): Promise<Response> {
	try {
		return await run();
	} catch (error) {
		if (error instanceof MissingProviderKeyError)
			return badRequest(error.message);
		const requestId = (await headers()).get("x-vercel-id");
		logger.error({ err: error, requestId }, `${label} failed`);
		return serverError(`${label} failed`);
	}
}

async function guard(
	label: string,
	run: RouteBody,
	...tiers: Authorize[]
): Promise<Response> {
	return runGuarded(label, async () => {
		const user = await getUser();
		if (!user) return unauthorized();
		for (const tier of tiers) {
			const denied = await tier(user);
			if (denied) return denied;
		}
		return run(user);
	});
}

const requireApiAccess: Authorize = async (user) =>
	hasApiAccess(user) ? null : forbidden();

export const withApiAccess = (label: string, run: RouteBody) =>
	guard(label, run, requireApiAccess);

export const withHostedBudget = (label: string, run: RouteBody) =>
	guard(label, run, requireApiAccess, refuseOverBudget);

export const withSession = (label: string, run: RouteBody) => guard(label, run);

export const withPublic = (label: string, run: () => Promise<Response>) =>
	runGuarded(label, run);
