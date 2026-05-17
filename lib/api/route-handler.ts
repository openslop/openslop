import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { ConnectorType } from "@/lib/connectors/types";
import { stringifyError } from "../errors";
import { getUser } from "./auth";
import { createJob, enqueueJob, getJob } from "./jobs";
import { badRequest, serverError, unauthorized } from "./response";
import { logger } from "./logger";

type ParseResult<T> = { ok: true; data: T } | { ok: false; response: Response };

async function parseBody<TSchema extends z.ZodType>(
	request: NextRequest,
	schema: TSchema,
	label: string,
): Promise<ParseResult<z.infer<TSchema>>> {
	const parsed = schema.safeParse(await request.json());
	if (parsed.success) return { ok: true, data: parsed.data };
	const message = parsed.error.issues[0]?.message ?? "Invalid request body";
	logger.warn(`${label}: ${message}`);
	return { ok: false, response: badRequest(message) };
}

async function withAuth(
	label: string,
	run: (user: { id: string }) => Promise<Response>,
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

type RouteOptions<
	TSchema extends z.ZodType,
	TProvider extends {
		generate: (params: z.infer<TSchema>) => Promise<unknown>;
	},
> = {
	schema: TSchema;
	getProvider: () => TProvider;
	label: string;
	handle?: (provider: TProvider, body: z.infer<TSchema>) => Promise<Response>;
};

export function createRouteHandler<
	TSchema extends z.ZodType,
	TProvider extends {
		generate: (params: z.infer<TSchema>) => Promise<unknown>;
	},
>(options: RouteOptions<TSchema, TProvider>) {
	const handle =
		options.handle ??
		(async (provider, body) =>
			NextResponse.json(await provider.generate(body)));

	return async function POST(request: NextRequest) {
		return withAuth(options.label, async () => {
			const parsed = await parseBody(request, options.schema, options.label);
			if (!parsed.ok) return parsed.response;
			return handle(options.getProvider(), parsed.data);
		});
	};
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

export function createAssetRouteHandlers<TSchema extends z.ZodType>(opts: {
	connectorType: ConnectorType;
	schema: TSchema;
	label: string;
}) {
	const POST = async (request: NextRequest) =>
		withAuth(opts.label, async (user) => {
			const parsed = await parseBody(request, opts.schema, opts.label);
			if (!parsed.ok) return parsed.response;

			// projectId is metadata for observability, not a generation param;
			// peel it off so providers never see it in the request body.
			const { projectId, ...providerRequest } = parsed.data as {
				projectId?: string;
			} & Record<string, unknown>;
			const job = await createJob({
				userId: user.id,
				projectId,
				connectorType: opts.connectorType,
				request: providerRequest,
			});
			await enqueueJob(job.id, opts.connectorType);
			return NextResponse.json({ jobId: job.id, status: "pending" });
		});

	return { POST };
}

export async function pollJob(
	_request: NextRequest,
	context: { params: Promise<{ jobId: string }> },
) {
	return withAuth("Job poll", async (user) => {
		const { jobId } = await context.params;
		if (!jobId) return badRequest("jobId is required");

		const job = await getJob(jobId, user.id);
		if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

		return NextResponse.json({
			jobId: job.id,
			status: job.status,
			result: job.result,
			error: job.error,
		});
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
