import { NextResponse } from "next/server";
import { z } from "zod";
import type { JobPoll } from "@/lib/gateway/base";
import type { ConnectorType, ModelRef } from "@/lib/connectors/types";
import { createJob, enqueueJob, getJob } from "./jobs";
import { bodySchema } from "./generation-schema";
import { notFound } from "./response";
import type { RouteFamily } from "./route-families";

type AssetBody = ModelRef & { projectId?: string } & Record<string, unknown>;

type AssetRoute<TModels, TShape extends z.ZodRawShape> = {
	connectorType: ConnectorType;
	models: TModels;
	fields: TShape;
	label: string;
};

export const createAssetRouteHandler = <
	TModels,
	TPicked extends ModelRef,
	TShape extends z.ZodRawShape,
>(
	family: RouteFamily<TModels, TPicked>,
	route: AssetRoute<TModels, TShape>,
) =>
	family.createHandler({
		// The intersection's inferred type does not survive a generic field
		// shape; every route's body is this shape regardless.
		schema: bodySchema(
			family.model(route.models),
			route.fields,
		) as z.ZodType<AssetBody>,
		label: route.label,
		handle: async ({ user, input }) => {
			const { projectId, ...request } = input;
			const { id } = await createJob({
				userId: user.id,
				projectId,
				connectorType: route.connectorType,
				request,
			});
			await enqueueJob(id, route.connectorType);
			return NextResponse.json({ jobId: id, status: "pending" });
		},
	});

export const createJobPollHandler = (
	family: Pick<RouteFamily<never, ModelRef>, "createParamHandler">,
) =>
	family.createParamHandler({
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
