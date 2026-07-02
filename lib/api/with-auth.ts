import type { User } from "@supabase/supabase-js";
import { stringifyError } from "../errors";
import { getUser } from "./auth";
import { logger } from "./logger";
import { forbidden, serverError, unauthorized } from "./response";

type RouteBody = (user: User) => Promise<Response>;

// Uniform error envelope: thrown errors are logged and returned as 500.
async function runGuarded(
	label: string,
	run: () => Promise<Response>,
): Promise<Response> {
	try {
		return await run();
	} catch (error) {
		logger.error(error, `${label} failed`);
		return serverError(`${label} failed: ${stringifyError(error)}`);
	}
}

// Wraps a route handler with auth + the error envelope. The handler only runs
// for authorized users.
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
	guard(label, run, (user) =>
		user.app_metadata?.api_access ? null : forbidden(),
	);

export const withSession = (label: string, run: RouteBody) => guard(label, run);

// Public routes: no auth, but still get the uniform error envelope.
export const withPublic = (label: string, run: () => Promise<Response>) =>
	runGuarded(label, run);
