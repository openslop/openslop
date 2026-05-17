import { send } from "@vercel/queue";
import type { BundleResponse } from "@/lib/api/asset-bundle";
import type { ConnectorType } from "@/lib/connectors/types";
import type { JobStatus } from "@/lib/gateway/base";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const ASSET_QUEUE_TOPIC = "asset-generate";

export type JobRow = {
	id: string;
	user_id: string;
	project_id: string | null;
	connector_type: ConnectorType;
	status: JobStatus;
	request: Record<string, unknown>;
	result: BundleResponse | null;
	provider_job_id: string | null;
	error: string | null;
	created_at: string;
	updated_at: string;
};

export type AssetQueueMessage = {
	jobId: string;
	connectorType: ConnectorType;
};

export async function createJob(input: {
	userId: string;
	projectId?: string | null;
	connectorType: ConnectorType;
	request: Record<string, unknown>;
}): Promise<{ id: string }> {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("jobs")
		.insert({
			user_id: input.userId,
			project_id: input.projectId ?? null,
			connector_type: input.connectorType,
			request: input.request,
		})
		.select("id")
		.single();
	if (error || !data)
		throw new Error(`Failed to create job: ${error?.message}`);
	return { id: data.id };
}

export async function getJob(
	jobId: string,
	userId: string,
): Promise<JobRow | null> {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("jobs")
		.select("*")
		.eq("id", jobId)
		.eq("user_id", userId)
		.maybeSingle();
	if (error) throw new Error(`Failed to load job: ${error.message}`);
	return (data as JobRow) ?? null;
}

export async function loadJobForProcessing(jobId: string): Promise<JobRow> {
	const supabase = createServiceClient();
	const { data, error } = await supabase
		.from("jobs")
		.select("*")
		.eq("id", jobId)
		.single();
	if (error || !data)
		throw new Error(`Job ${jobId} not found: ${error?.message}`);
	return data as JobRow;
}

export async function updateJob(
	jobId: string,
	patch: {
		status?: JobStatus;
		result?: BundleResponse;
		error?: string;
		providerJobId?: string;
	},
): Promise<void> {
	const supabase = createServiceClient();
	const { error } = await supabase
		.from("jobs")
		.update({
			...(patch.status !== undefined && { status: patch.status }),
			...(patch.result !== undefined && { result: patch.result }),
			...(patch.error !== undefined && { error: patch.error }),
			...(patch.providerJobId !== undefined && {
				provider_job_id: patch.providerJobId,
			}),
		})
		.eq("id", jobId);
	if (error) throw new Error(`Failed to update job: ${error.message}`);
}

export async function enqueueJob(
	jobId: string,
	connectorType: ConnectorType,
): Promise<void> {
	const message: AssetQueueMessage = { jobId, connectorType };
	await send(ASSET_QUEUE_TOPIC, message);
}
