import { vi, type MockInstance } from "vitest";
import type { BundleResponse } from "@/lib/api/asset-bundle";
import type { JobPoll, JobStatus } from "@/lib/gateway/base";

function jsonResponse(data: unknown) {
	return new Response(JSON.stringify(data), {
		status: 200,
		headers: { "content-type": "application/json" },
	});
}

// One declarative step in a mocked gateway exchange. Use `submitStatus` for
// the POST submission response, `pollStatus`+`result`/`error` for the poll
// response, or `payload` for any other raw json (e.g. AssetBundle.fetchJson).
export type GatewayStep = {
	submitStatus?: JobStatus;
	pollStatus?: JobStatus;
	result?: BundleResponse;
	error?: string;
	errorDetail?: unknown;
	payload?: unknown;
};

function stepToResponse(step: GatewayStep, jobId: string): Response {
	if (step.submitStatus !== undefined) {
		return jsonResponse({ jobId, status: step.submitStatus });
	}
	if (step.pollStatus !== undefined) {
		return jsonResponse({
			jobId,
			status: step.pollStatus,
			result: step.result ?? null,
			error: step.error ?? null,
			errorDetail: step.errorDetail,
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
			{ submitStatus: "pending" },
			{ pollStatus: "completed", result: response },
		],
		jobId,
	);
}
