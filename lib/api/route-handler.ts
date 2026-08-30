import { NextRequest, NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { z } from "zod";
import type { ConnectorType } from "@/lib/connectors/types";
import { withApiAccess, withPublic, withSession } from "./with-auth";
import type { JobPoll } from "@/lib/gateway/base";
import { createJob, enqueueJob, getJob } from "./jobs";
import {
	parseBody,
	parseFormData,
	parseSearchParams,
	type ParseResult,
} from "./parse";
import { notFound } from "./response";

type AuthTier = typeof withApiAccess;

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

/** The models this API serves, mapped to the ids it forwards. */
export function modelField(models: Record<string, string>) {
	const names = Object.keys(models);
	return z
		.string()
		.optional()
		.refine((v) => v === undefined || names.includes(v), {
			message: `Invalid model. Supported: ${names.join(", ")}`,
		})
		.transform((v) => (v === undefined ? undefined : models[v]));
}

type AssetBody = { projectId?: string } & Record<string, unknown>;

export function createAssetRouteHandlers<
	TSchema extends z.ZodType<AssetBody>,
>(opts: { connectorType: ConnectorType; schema: TSchema; label: string }) {
	const POST = createApiRouteHandler({
		schema: opts.schema,
		label: opts.label,
		handle: async ({ user, input }) => {
			const { projectId, ...request } = input;
			const job = await createJob({
				userId: user.id,
				projectId,
				connectorType: opts.connectorType,
				request,
			});
			await enqueueJob(job.id, opts.connectorType);
			return NextResponse.json({ jobId: job.id, status: "pending" });
		},
	});
	return { POST };
}

export async function pollJob(
	_request: NextRequest,
	context: { params: Promise<{ jobId: string }> },
) {
	return withApiAccess("Job poll", async (user) => {
		const { jobId } = await context.params;
		// A malformed id makes Postgres throw on the cast; guid() matches every shape it accepts.
		if (!z.guid().safeParse(jobId).success) return notFound();
		const job = await getJob(jobId, user.id);
		if (!job) return notFound();
		const view: JobPoll = {
			jobId: job.id,
			status: job.status,
			result: job.result,
			error: job.error,
		};
		return NextResponse.json(view);
	});
}

export function bodySchema<TShape extends z.ZodRawShape>(
	models: Record<string, string>,
	shape: TShape,
) {
	return z.object(
		{
			prompt: z.string({ error: "prompt is required" }).min(1, {
				message: "prompt is required",
			}),
			model: modelField(models),
			projectId: z.uuid().optional(),
			...shape,
		},
		"Request body must be a JSON object",
	);
}
