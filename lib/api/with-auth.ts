import type { User } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { getUser } from "./auth";
import { createClient } from "@/lib/supabase/server";
import { balanceLevel, readBalanceUsd } from "@/lib/user/balance";
import { MissingProviderKeyError } from "./provider-keys";
import { logger } from "./logger";
import {
	badRequest,
	outOfBalance,
	serverError,
	unauthorized,
} from "./response";

type RouteBody = (user: User) => Promise<Response>;

// Uniform error envelope: an unconnected provider is the caller's to fix, so it
// comes back as a 400; anything else is logged and returned as 500.
export async function withPublic(
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

export const withSession = (label: string, run: RouteBody) =>
	withPublic(label, async () => {
		const user = await getUser();
		return user ? run(user) : unauthorized();
	});

// Post-paid: jobs already running may take the balance a little below zero.
export const withHostedBalance = (label: string, run: RouteBody) =>
	withSession(label, async (user) =>
		balanceLevel(await readBalanceUsd(await createClient())) === "empty"
			? outOfBalance()
			: run(user),
	);
