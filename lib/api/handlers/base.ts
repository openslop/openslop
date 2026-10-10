import { vendorParams } from "@/lib/connectors/models";
import type { ModelRef } from "@/lib/connectors/types";
import type { ProviderType } from "@/lib/providers/types";
import type { BundleResponse } from "../assetBundle";
import type { JobConnectorType, JobRow } from "../jobs";
import { providerForPick } from "../routeFamilies";

export type JobRequest<TReq extends ModelRef = ModelRef> = {
	user_id: string;
	connector_type: JobConnectorType;
	request: TReq;
};

export const providerForJob = <K extends ProviderType>(
	type: K,
	job: JobRequest,
) => providerForPick(job.user_id, type, job.request);

export const jobVendorParams = <TReq extends ModelRef>(job: JobRequest<TReq>) =>
	vendorParams(job.connector_type, job.request);

export type ProcessOutcome<TMeta = Record<string, unknown>> =
	| { kind: "completed"; result: BundleResponse }
	| { kind: "pending"; metadata: TMeta };

export type TypedJobRow<TReq, TMeta> = Omit<JobRow, "request" | "metadata"> & {
	request: TReq;
	metadata: TMeta;
};

export interface JobHandler<
	TReq = Record<string, unknown>,
	TMeta = Record<string, unknown>,
> {
	process(job: TypedJobRow<TReq, TMeta>): Promise<ProcessOutcome<TMeta>>;
}
