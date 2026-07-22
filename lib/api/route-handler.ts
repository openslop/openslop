import { NextRequest, NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { z } from "zod";
import type { ConnectorType } from "@/lib/connectors/types";
import { withApiAccess, withPublic, withSession } from "./with-auth";
import { getJobHandler, rowView } from "./job-handlers";
import { createJob, enqueueJob, getJob } from "./jobs";
import { parseBody, parseSearchParams, type ParseResult } from "./parse";
import { badRequest } from "./response";

type AuthTier = typeof withApiAccess;

async function withParsed<TData>(
	parsing: ParseResult<TData> | Promise<ParseResult<TData>>,
	handle: (data: TData) => Promise<Response>,
): Promise<Response> {
	const parsed = await parsing;
	return parsed.ok ? handle(parsed.data) : parsed.response;
}

function jsonRouteHandler(authTier: AuthTier) {
	return function createHandler<TSchema extends z.ZodType>(opts: {
		schema: TSchema;
		label: string;
		handle: (ctx: {
			user: User;
			body: z.infer<TSchema>;
			request: NextRequest;
		}) => Promise<Response>;
	}) {
		return async (request: NextRequest) =>
			authTier(opts.label, (user) =>
				withParsed(parseBody(request, opts.schema, opts.label), (body) =>
					opts.handle({ user, body, request }),
				),
			);
	};
}

function queryRouteHandler(authTier: AuthTier) {
	return function createHandler<TSchema extends z.ZodType>(opts: {
		schema: TSchema;
		label: string;
		handle: (ctx: {
			user: User;
			query: z.infer<TSchema>;
			request: NextRequest;
		}) => Promise<Response>;
	}) {
		return async (request: NextRequest) =>
			authTier(opts.label, (user) =>
				withParsed(
					parseSearchParams(request, opts.schema, opts.label),
					(query) => opts.handle({ user, query, request }),
				),
			);
	};
}

export const createApiRouteHandler = jsonRouteHandler(withApiAccess);
export const createSessionRouteHandler = jsonRouteHandler(withSession);
export const createApiQueryRouteHandler = queryRouteHandler(withApiAccess);

export function createPublicRouteHandler<TSchema extends z.ZodType>(opts: {
	schema: TSchema;
	label: string;
	handle: (ctx: {
		body: z.infer<TSchema>;
		request: NextRequest;
	}) => Promise<Response>;
}) {
	return async (request: NextRequest) =>
		withPublic(opts.label, () =>
			withParsed(parseBody(request, opts.schema, opts.label), (body) =>
				opts.handle({ body, request }),
			),
		);
}

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
		handle: async ({ user, body }) => {
			const { projectId, ...request } = body;
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
		if (!jobId) return badRequest("jobId is required");
		const job = await getJob(jobId, user.id);
		if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
		const view =
			(await getJobHandler(job.connector_type)?.poll?.(job)) ?? rowView(job);
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
