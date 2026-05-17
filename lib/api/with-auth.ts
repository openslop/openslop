import type { User } from "@supabase/supabase-js";
import { stringifyError } from "../errors";
import { getUser } from "./auth";
import { logger } from "./logger";
import { serverError, unauthorized } from "./response";

// Wraps a route handler with auth + a uniform error envelope. The handler only
// runs for authenticated users; thrown errors are logged and returned as 500.
export async function withAuth(
	label: string,
	run: (user: User) => Promise<Response>,
): Promise<Response> {
	try {
		const user = await getUser();
		if (!user) return unauthorized();
		return await run(user);
	} catch (error) {
		logger.error(error, `${label} failed`);
		return serverError(`${label} failed: ${stringifyError(error)}`);
	}
}
