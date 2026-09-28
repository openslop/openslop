import { NextResponse } from "next/server";
import { z } from "zod";
import type { JobPoll } from "@/lib/gateway/base";
import type { ModelRef } from "@/lib/connectors/types";
import { createJob, enqueueJob, getJob, type JobConnectorType } from "./jobs";
import {
	AUDIO_FIELDS,
	bodySchema,
	IMAGE_FIELDS,
	TTS_FIELDS,
	VIDEO_FIELDS,
} from "./generation-schema";
import { notFound } from "./response";
import type { RouteFamily } from "./route-families";

type AssetBody = ModelRef & { projectId?: string } & Record<string, unknown>;

/** What each asset route takes beyond the prompt and model, and how the log names it. */
const ASSET_ROUTES: Record<
	JobConnectorType,
	{ fields: z.ZodRawShape; label: string }
> = {
	image: { fields: IMAGE_FIELDS, label: "Image generation" },
	video: { fields: VIDEO_FIELDS, label: "Video submission" },
	tts: { fields: TTS_FIELDS, label: "TTS generation" },
	music: { fields: AUDIO_FIELDS, label: "Music generation" },
	sfx: { fields: AUDIO_FIELDS, label: "SFX generation" },
};

export const createAssetRouteHandler = <TPicked extends ModelRef>(
	family: RouteFamily<TPicked>,
	type: JobConnectorType,
) => {
	const { fields, label } = ASSET_ROUTES[type];
	return family.createHandler({
		// Every route's body is this shape; the fields only add optional keys.
		schema: bodySchema(family.model(type), fields) as z.ZodType<AssetBody>,
		label,
		handle: async ({ user, input }) => {
			const { projectId, ...request } = input;
			const { id } = await createJob({
				userId: user.id,
				projectId,
				connectorType: type,
				request,
			});
			await enqueueJob(id, type);
			return NextResponse.json({ jobId: id, status: "pending" });
		},
	});
};

export const createJobPollHandler = (
	family: Pick<RouteFamily<ModelRef>, "createParamHandler">,
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
