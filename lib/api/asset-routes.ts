import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import type { JobPoll } from "@/lib/gateway/base";
import { providerForModel } from "@/lib/connectors/models";
import type { ConnectorType } from "@/lib/connectors/types";
import { requireConnector } from "./connectorKeys";
import { createJob, enqueueJob, getJob } from "./jobs";
import { notFound } from "./response";
import {
	createApiRouteHandler,
	createSessionRouteHandler,
	type AuthTier,
} from "./route-handler";
import { withApiAccess, withSession } from "./with-auth";

type AssetBody = { projectId?: string } & Record<string, unknown>;

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

/** Asset generation on the models OpenSlop hosts, billed to our own keys. */
export function createAssetRouteHandlers<TSchema extends z.ZodType<AssetBody>>(
	opts: RouteOptions<TSchema>,
) {
	const POST = createApiRouteHandler({
		schema: opts.schema,
		label: opts.label,
		handle: async ({ user, input }) => {
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
}

/**
 * Asset generation on a key the user stored. Same job protocol as the hosted
 * routes, so polling, timeouts and history are unchanged; only the provider the
 * worker resolves and the key it runs on differ. The model names the provider,
 * so the client never gets to choose whose key is read, and the job carries no
 * routing decision of its own.
 */
export function createThirdPartyAssetRouteHandlers<
	TSchema extends z.ZodType<AssetBody & { model: string }>,
>(opts: RouteOptions<TSchema>) {
	const POST = createSessionRouteHandler({
		schema: opts.schema,
		label: opts.label,
		handle: async ({ user, input }) => {
			const { projectId, ...request } = input;
			await requireConnector(
				user.id,
				providerForModel(opts.connectorType, input.model),
			);
			return submitJob({
				userId: user.id,
				projectId,
				connectorType: opts.connectorType,
				request,
			});
		},
	});
	return { POST };
}

function jobPoller(authTier: AuthTier) {
	return async (
		_request: NextRequest,
		context: { params: Promise<{ jobId: string }> },
	) =>
		authTier("Job poll", async (user) => {
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

export const pollJob = jobPoller(withApiAccess);

/** The same poll, for a job the caller submitted against their own key. */
export const pollThirdPartyJob = jobPoller(withSession);
