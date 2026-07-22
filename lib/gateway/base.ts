import type { BundleResponse } from "@/lib/api/asset-bundle";

export abstract class GatewayClient<TParams = unknown, TResult = unknown> {
	abstract generate(params: TParams): Promise<TResult>;
}

export type JobStatus = "pending" | "processing" | "completed" | "failed";

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
