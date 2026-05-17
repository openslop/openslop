import { NextRequest, NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { z } from "zod";
import type { ConnectorType } from "@/lib/connectors/types";
import { withAuth } from "./with-auth";
import { getJobHandler } from "./job-handlers";
import { createJob, enqueueJob, getJob } from "./jobs";
import { parseBody } from "./parse";
import { badRequest } from "./response";

type RouteContext<TParams> = { params: Promise<TParams> };

type RouteHandlerOptions<TSchema extends z.ZodType | undefined, TParams> = {
	schema?: TSchema;
	label: string;
	handle: (ctx: {
		user: User;
		body: TSchema extends z.ZodType ? z.infer<TSchema> : undefined;
		params: TParams;
		request: NextRequest;
	}) => Promise<Response>;
};

export function createRouteHandler<
	TSchema extends z.ZodType | undefined = undefined,
	TParams extends Record<string, string> = Record<string, string>,
>(opts: RouteHandlerOptions<TSchema, TParams>) {
	return async (request: NextRequest, context?: RouteContext<TParams>) =>
		withAuth(opts.label, async (user) => {
			const params = ((await context?.params) ?? {}) as TParams;
			let body: unknown = undefined;
			if (opts.schema) {
				const parsed = await parseBody(request, opts.schema, opts.label);
				if (!parsed.ok) return parsed.response;
				body = parsed.data;
			}
			return opts.handle({
				user,
				body: body as TSchema extends z.ZodType ? z.infer<TSchema> : undefined,
				params,
				request,
			});
		});
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
	const POST = createRouteHandler({
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

export const pollJob = createRouteHandler<undefined, { jobId: string }>({
	label: "Job poll",
	handle: async ({ user, params }) => {
		if (!params.jobId) return badRequest("jobId is required");
		const job = await getJob(params.jobId, user.id);
		if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
		const view = (await getJobHandler(job.connector_type)?.poll?.(job)) ?? {
			jobId: job.id,
			status: job.status,
			result: job.result,
			error: job.error,
		};
		return NextResponse.json(view);
	},
});

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
