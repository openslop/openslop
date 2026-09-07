import { send } from "@vercel/queue";
import isUndefined from "lodash/isUndefined";
import omitBy from "lodash/omitBy";
import { z } from "zod";
import {
	BundleResponseSchema,
	type BundleResponse,
} from "@/lib/api/asset-bundle";
import { CONNECTOR_TYPES, type ConnectorType } from "@/lib/connectors/types";
import { JOB_STATUSES, type JobStatus } from "@/lib/gateway/base";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const ASSET_QUEUE_TOPIC = "asset-generate";

const JobRowSchema = z.object({
	id: z.string(),
	user_id: z.string(),
	project_id: z.string().nullable(),
	connector_type: z.enum(CONNECTOR_TYPES),
	status: z.enum(JOB_STATUSES),
	request: z.record(z.string(), z.unknown()),
	result: BundleResponseSchema.nullable(),
	metadata: z.record(z.string(), z.unknown()),
	error: z.string().nullable(),
	created_at: z.string(),
	updated_at: z.string(),
});

export type JobRow = z.infer<typeof JobRowSchema>;

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
	const supabase = createServiceClient();
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
	if (error) throw new Error(`Failed to create job: ${error.message}`);
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
	return data ? JobRowSchema.parse(data) : null;
}

export async function loadJobForProcessing(jobId: string): Promise<JobRow> {
	const supabase = createServiceClient();
	const { data, error } = await supabase
		.from("jobs")
		.select("*")
		.eq("id", jobId)
		.single();
	if (error) throw new Error(`Job ${jobId} not found: ${error.message}`);
	return JobRowSchema.parse(data);
}

export async function updateJob(
	jobId: string,
	patch: {
		status?: JobStatus;
		result?: BundleResponse;
		error?: string;
		metadata?: Record<string, unknown>;
	},
): Promise<void> {
	const update = omitBy(patch, isUndefined);
	if (Object.keys(update).length === 0) return;
	const supabase = createServiceClient();
	const { error } = await supabase.from("jobs").update(update).eq("id", jobId);
	if (error) throw new Error(`Failed to update job: ${error.message}`);
}

export async function enqueueJob(
	jobId: string,
	connectorType: ConnectorType,
	options?: { delaySeconds: number },
): Promise<void> {
	const message: AssetQueueMessage = { jobId, connectorType };
	await send(ASSET_QUEUE_TOPIC, message, options);
}
