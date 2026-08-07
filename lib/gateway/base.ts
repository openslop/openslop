import type { BundleResponse } from "@/lib/api/asset-bundle";

export abstract class GatewayClient<TParams = unknown, TResult = unknown> {
	abstract generate(params: TParams): Promise<TResult>;
}

export type JobStatus = "pending" | "processing" | "completed" | "failed";

/**
 * How long an asset job may run before both sides give up: the queue worker
 * stops redelivering it, and the client stops polling for it.
 */
export const JOB_TIMEOUT_MS = 15 * 60_000;

/** A job in a terminal state will never change again, so stop polling it. */
export function isTerminal(status: JobStatus): boolean {
	return status === "completed" || status === "failed";
}

export type JobSubmission = { jobId: string; status: JobStatus };

export type JobPoll = {
	jobId: string;
	status: JobStatus;
	result: BundleResponse | null;
	error: string | null;
};

export abstract class AssetGateway<TParams> extends GatewayClient<
	TParams,
	JobSubmission
> {
	abstract poll(jobId: string): Promise<JobPoll>;
}
