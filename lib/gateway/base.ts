import { z } from "zod";
import { BundleResponseSchema } from "@/lib/api/asset-bundle";

export abstract class GatewayClient<TParams = unknown, TResult = unknown> {
	abstract generate(params: TParams): Promise<TResult>;
}

export const JOB_STATUSES = [
	"pending",
	"processing",
	"completed",
	"failed",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

/** A job in a terminal state will never change again, so stop polling it. */
export function isTerminal(status: JobStatus): boolean {
	return status === "completed" || status === "failed";
}

export const JobSubmissionSchema = z.object({
	jobId: z.string(),
	status: z.enum(JOB_STATUSES),
});

export type JobSubmission = z.infer<typeof JobSubmissionSchema>;

export const JobPollSchema = JobSubmissionSchema.extend({
	result: BundleResponseSchema.nullable(),
	error: z.string().nullable(),
});

export type JobPoll = z.infer<typeof JobPollSchema>;

export abstract class AssetGateway<TParams> extends GatewayClient<
	TParams,
	JobSubmission
> {
	abstract poll(jobId: string, signal?: AbortSignal): Promise<JobPoll>;
}
