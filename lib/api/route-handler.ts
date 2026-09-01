import { NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import { z } from "zod";
import { withApiAccess, withPublic, withSession } from "./with-auth";
import {
	parseBody,
	parseFormData,
	parseSearchParams,
	type ParseResult,
} from "./parse";

/** How a route authenticates. The tiers themselves live in `with-auth`. */
export type AuthTier = typeof withApiAccess;

/** Turns a request into validated data, or into the 400 that explains why not. */
type ParseSource = <TSchema extends z.ZodType>(
	request: NextRequest,
	schema: TSchema,
	label: string,
) => ParseResult<z.infer<TSchema>> | Promise<ParseResult<z.infer<TSchema>>>;

type RouteOptions<TSchema extends z.ZodType, TContext> = {
	schema: TSchema;
	label: string;
	handle: (ctx: TContext) => Promise<Response>;
};

async function withParsed<TData>(
	parsing: ParseResult<TData> | Promise<ParseResult<TData>>,
	handle: (data: TData) => Promise<Response>,
): Promise<Response> {
	const parsed = await parsing;
	return parsed.ok ? handle(parsed.data) : parsed.response;
}

function routeHandler(authTier: AuthTier, parse: ParseSource) {
	return function createHandler<TSchema extends z.ZodType>(
		opts: RouteOptions<
			TSchema,
			{ user: User; input: z.infer<TSchema>; request: NextRequest }
		>,
	) {
		return async (request: NextRequest) =>
			authTier(opts.label, (user) =>
				withParsed(parse(request, opts.schema, opts.label), (input) =>
					opts.handle({ user, input, request }),
				),
			);
	};
}

export const createApiRouteHandler = routeHandler(withApiAccess, parseBody);
export const createSessionRouteHandler = routeHandler(withSession, parseBody);
export const createApiQueryRouteHandler = routeHandler(
	withApiAccess,
	parseSearchParams,
);
export const createSessionQueryRouteHandler = routeHandler(
	withSession,
	parseSearchParams,
);
export const createSessionFormRouteHandler = routeHandler(
	withSession,
	parseFormData,
);

function publicRouteHandler(parse: ParseSource) {
	return function createHandler<TSchema extends z.ZodType>(
		opts: RouteOptions<
			TSchema,
			{ input: z.infer<TSchema>; request: NextRequest }
		>,
	) {
		return async (request: NextRequest) =>
			withPublic(opts.label, () =>
				withParsed(parse(request, opts.schema, opts.label), (input) =>
					opts.handle({ input, request }),
				),
			);
	};
}

export const createPublicRouteHandler = publicRouteHandler(parseBody);
export const createPublicQueryRouteHandler =
	publicRouteHandler(parseSearchParams);
