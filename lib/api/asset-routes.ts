import { NextResponse } from "next/server";
import { z } from "zod";
import type { JobPoll, JobSubmission } from "@/lib/gateway/base";
import type { ModelRef } from "@/lib/connectors/types";
import { errorMessage } from "@/lib/errors";
import {
	createJob,
	enqueueJob,
	getJob,
	updateJob,
	type JobConnectorType,
} from "./jobs";
import { failIfExpired } from "./job-deadline";
import {
	AUDIO_FIELDS,
	MUSIC_FIELDS,
	bodySchema,
	IMAGE_FIELDS,
	STT_FIELDS,
	TTS_FIELDS,
	VIDEO_FIELDS,
} from "./generation-schema";
import { withOwnedProject } from "./with-owned-project";
import { notFound } from "./response";
import { rowId } from "./request-schema-fields";
import type { RouteFamily } from "./route-families";

/** What each asset route takes beyond the prompt and model, and how the log names it. */
const ASSET_ROUTES = {
	image: { fields: IMAGE_FIELDS, label: "Image generation" },
	video: { fields: VIDEO_FIELDS, label: "Video submission" },
	tts: { fields: TTS_FIELDS, label: "TTS generation" },
	music: { fields: MUSIC_FIELDS, label: "Music generation" },
	sfx: { fields: AUDIO_FIELDS, label: "SFX generation" },
	stt: { fields: STT_FIELDS, label: "Speech to text" },
} satisfies Record<JobConnectorType, { fields: z.ZodRawShape; label: string }>;

export const createAssetRouteHandler = <TPicked extends ModelRef>(
	family: RouteFamily<TPicked>,
	type: JobConnectorType,
) => {
	const { fields, label } = ASSET_ROUTES[type];
	return family.createHandler({
		schema: bodySchema(family.model(type), fields),
		label,
		handle: withOwnedProject(async ({ user, input }) => {
			const { projectId, ...request } = input;
			const { id } = await createJob({
				userId: user.id,
				projectId,
				connectorType: type,
				request,
			});
			try {
				await enqueueJob(id);
			} catch (error) {
				await updateJob(id, {
					status: "failed",
					error: `Failed to queue job: ${errorMessage(error)}`,
				});
				throw error;
			}
			return NextResponse.json<JobSubmission>({ jobId: id, status: "pending" });
		}),
	});
};

export const createJobPollHandler = (
	family: Pick<RouteFamily<ModelRef>, "createParamHandler">,
) =>
	family.createParamHandler({
		schema: z.object({ jobId: rowId }),
		label: "Job poll",
		handle: async ({ user, params }) => {
			const found = await getJob(params.jobId, user.id);
			if (!found) return notFound();
			const job = await failIfExpired(found);
			return NextResponse.json<JobPoll>({
				jobId: job.id,
				status: job.status,
				result: job.result,
				error: job.error,
			});
		},
	});
