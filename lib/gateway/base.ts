import type { BundleResponse } from "@/lib/api/asset-bundle";

export abstract class GatewayClient<TParams = unknown, TResult = unknown> {
	abstract generate(params: TParams): Promise<TResult>;
}

export type JobStatus = "pending" | "processing" | "completed" | "failed";

export type JobSubmission = { jobId: string; status: JobStatus };

export type JobPoll = {
	jobId: string;
	status: JobStatus;
	result: BundleResponse | null;
	error: string | null;
	/** Raw provider error payload behind `error`'s message, if the provider captured one. */
	errorDetail?: unknown;
};

export abstract class AssetGateway<TParams> extends GatewayClient<
	TParams,
	JobSubmission
> {
	abstract poll(jobId: string): Promise<JobPoll>;
}
