import { NextResponse } from "next/server";
import { z } from "zod";
import type { JobPoll } from "@/lib/gateway/base";
import { providerForModel } from "@/lib/connectors/models";
import type { ConnectorType } from "@/lib/connectors/types";
import { requireConnector } from "./connectorKeys";
import { createJob, enqueueJob, getJob } from "./jobs";
import { notFound } from "./response";
import {
	createApiParamRouteHandler,
	createApiRouteHandler,
	createSessionParamRouteHandler,
	createSessionRouteHandler,
} from "./route-handler";

type AssetBody = { projectId?: string; model?: string } & Record<
	string,
	unknown
>;

type RouteOptions<TSchema extends z.ZodType> = {
	connectorType: ConnectorType;
	schema: TSchema;
	label: string;
};

/** Queues one generation and answers with the job the client polls. */
async function submitJob(job: {
	userId: string;
	projectId?: string;
	connectorType: ConnectorType;
	request: Record<string, unknown>;
}): Promise<Response> {
	const { id } = await createJob(job);
	await enqueueJob(id, job.connectorType);
	return NextResponse.json({ jobId: id, status: "pending" });
}

/**
 * Asset generation, queued as a job the client then polls. The tiers differ
 * only in who they let in and what they check first: the hosted routes bill our
 * own keys, and a BYOK route refuses before queueing when the account has no
 * key for the provider its model names, so no job is created that could only
 * fail. The job records the model's name and no routing decision of its own.
 */
const assetRoutes =
	(
		createHandler: typeof createApiRouteHandler,
		check?: (
			userId: string,
			connectorType: ConnectorType,
			body: AssetBody,
		) => Promise<void>,
	) =>
	<TSchema extends z.ZodType<AssetBody>>(opts: RouteOptions<TSchema>) => {
		const POST = createHandler({
			schema: opts.schema,
			label: opts.label,
			handle: async ({ user, input }) => {
				await check?.(user.id, opts.connectorType, input);
				const { projectId, ...request } = input;
				return submitJob({
					userId: user.id,
					projectId,
					connectorType: opts.connectorType,
					request,
				});
			},
		});
		return { POST };
	};

export const createAssetRouteHandlers = assetRoutes(createApiRouteHandler);

export const createThirdPartyAssetRouteHandlers = assetRoutes(
	createSessionRouteHandler,
	(userId, type, body) =>
		requireConnector(userId, providerForModel(type, body.model)),
);

/** The job as its submitter may see it, whichever family they submitted through. */
const jobPoller = (createHandler: typeof createApiParamRouteHandler) =>
	createHandler({
		// A malformed id makes Postgres throw on the cast; guid() matches every
		// shape it accepts, so anything else is a 404 before the query.
		schema: z.object({ jobId: z.guid() }),
		label: "Job poll",
		handle: async ({ user, params }) => {
			const job = await getJob(params.jobId, user.id);
			if (!job) return notFound();
			const view: JobPoll = {
				jobId: job.id,
				status: job.status,
				result: job.result,
				error: job.error,
			};
			return NextResponse.json(view);
		},
	});

export const pollJob = jobPoller(createApiParamRouteHandler);

/** The same poll, for a job the caller submitted against their own key. */
export const pollThirdPartyJob = jobPoller(createSessionParamRouteHandler);
