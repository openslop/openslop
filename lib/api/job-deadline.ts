import { isTerminal } from "@/lib/gateway/base";
import { updateJob, type JobConnectorType, type JobRow } from "./jobs";

const TIMEOUT_MINUTES: Record<JobConnectorType, number> = {
	image: 15,
	music: 15,
	sfx: 15,
	stt: 15,
	tts: 15,
	video: 45,
};

/** The one owner of job deadlines: a live job past its deadline is failed. */
export async function failIfExpired(job: JobRow): Promise<JobRow> {
	const minutes = TIMEOUT_MINUTES[job.connector_type];
	const ageMs = Date.now() - Date.parse(job.created_at);
	if (isTerminal(job.status) || ageMs <= minutes * 60_000) return job;
	const error = `Job timed out after ${minutes} minutes`;
	await updateJob(job.id, { status: "failed", error });
	return { ...job, status: "failed", error };
}
