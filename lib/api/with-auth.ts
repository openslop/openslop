import type { User } from "@supabase/supabase-js";
import { stringifyError } from "../errors";
import { getUser } from "./auth";
import { logger } from "./logger";
import { forbidden, serverError, unauthorized } from "./response";

type RouteBody = (user: User) => Promise<Response>;

// Wraps a route handler with auth + a uniform error envelope. The handler only
// runs for authorized users; thrown errors are logged and returned as 500.
async function guard(
	label: string,
	run: RouteBody,
	authorize: (user: User) => Response | null = () => null,
): Promise<Response> {
	try {
		const user = await getUser();
		if (!user) return unauthorized();
		const denied = authorize(user);
		if (denied) return denied;
		return await run(user);
	} catch (error) {
		logger.error(error, `${label} failed`);
		return serverError(`${label} failed: ${stringifyError(error)}`);
	}
}

export const withApiAccess = (label: string, run: RouteBody) =>
	guard(label, run, (user) =>
		user.app_metadata?.api_access ? null : forbidden(),
	);

export const withSession = (label: string, run: RouteBody) => guard(label, run);
