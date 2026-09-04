import type { User } from "@supabase/supabase-js";
import { stringifyError } from "../errors";
import { getUser } from "./auth";
import { hasApiAccess, MissingProviderKeyError } from "./providerKeys";
import { logger } from "./logger";
import { badRequest, forbidden, serverError, unauthorized } from "./response";

type RouteBody = (user: User) => Promise<Response>;

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
		logger.error(error, `${label} failed`);
		return serverError(`${label} failed: ${stringifyError(error)}`);
	}
}

async function guard(
	label: string,
	run: RouteBody,
	authorize: (user: User) => Response | null = () => null,
): Promise<Response> {
	return runGuarded(label, async () => {
		const user = await getUser();
		if (!user) return unauthorized();
		const denied = authorize(user);
		if (denied) return denied;
		return run(user);
	});
}

export const withApiAccess = (label: string, run: RouteBody) =>
	guard(label, run, (user) => (hasApiAccess(user) ? null : forbidden()));

export const withSession = (label: string, run: RouteBody) => guard(label, run);

export const withPublic = (label: string, run: () => Promise<Response>) =>
	runGuarded(label, run);
