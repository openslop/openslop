import type { BundleResponse } from "@/lib/api/asset-bundle";

export abstract class GatewayClient<TParams = unknown, TResult = unknown> {
	abstract generate(params: TParams): Promise<TResult>;
}

export type JobStatus = "pending" | "processing" | "completed" | "failed";

export type JobPoll = {
	jobId: string;
	status: JobStatus;
	result: BundleResponse | null;
	error: string | null;
};

export interface AssetGateway<TParams> {
	generate(params: TParams): Promise<{ jobId: string; status: JobStatus }>;
	poll(jobId: string): Promise<JobPoll>;
}
