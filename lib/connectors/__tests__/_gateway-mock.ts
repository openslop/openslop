import { vi, type MockInstance } from "vitest";
import type { BundleResponse } from "@/lib/api/asset-bundle";
import type { JobPoll, JobStatus } from "@/lib/gateway/base";

function jsonResponse(data: unknown) {
	return new Response(JSON.stringify(data), {
		status: 200,
		headers: { "content-type": "application/json" },
	});
}

export type GatewayStep =
	| { kind: "submit"; status?: JobStatus }
	| { kind: "poll"; status: JobStatus; result?: BundleResponse; error?: string }
	| { kind: "fetch"; payload: unknown };

function stepToResponse(step: GatewayStep, jobId: string): Response {
	if (step.kind === "submit") {
		return jsonResponse({ jobId, status: step.status ?? "pending" });
	}
	if (step.kind === "poll") {
		return jsonResponse({
			jobId,
			status: step.status,
			result: step.result ?? null,
			error: step.error ?? null,
		} satisfies JobPoll);
	}
	return jsonResponse(step.payload);
}

export function mockGatewaySequence(
	steps: GatewayStep[],
	jobId = "job-1",
): MockInstance {
	const fetch = vi.spyOn(globalThis, "fetch");
	for (const step of steps) {
		fetch.mockResolvedValueOnce(stepToResponse(step, jobId));
	}
	return fetch;
}

export function mockGatewaySuccess(
	response: BundleResponse,
	jobId = "job-1",
): MockInstance {
	return mockGatewaySequence(
		[
			{ kind: "submit" },
			{ kind: "poll", status: "completed", result: response },
		],
		jobId,
	);
}
