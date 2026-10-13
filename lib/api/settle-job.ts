import { stringifyError } from "@/lib/errors";
import type { Priced } from "@/lib/providers/base";
import { updateJob } from "./jobs";

export const completeJob = (jobId: string, costUsd: number) =>
	updateJob(jobId, { status: "completed", cost_usd: costUsd });

export const failJob = (jobId: string, error: unknown) =>
	updateJob(jobId, { status: "failed", error: stringifyError(error) });

export async function failJobOnThrow<T>(
	jobId: string,
	work: () => Promise<T>,
): Promise<T> {
	try {
		return await work();
	} catch (error) {
		await failJob(jobId, error);
		throw error;
	}
}

export async function settleJob<T>(
	jobId: string,
	work: () => Promise<Priced<T>>,
): Promise<T> {
	const { output, costUsd } = await failJobOnThrow(jobId, work);
	await completeJob(jobId, costUsd);
	return output;
}

export async function* settleJobWith<T>(
	jobId: string,
	chunks: AsyncGenerator<T, number>,
): AsyncGenerator<T> {
	let costUsd: number;
	try {
		costUsd = yield* chunks;
	} catch (error) {
		await failJob(jobId, error);
		throw error;
	}
	await completeJob(jobId, costUsd);
}
