import { beforeEach, describe, expect, it, vi } from "vitest";
import type { JobRow } from "@/lib/api/jobs";

const mockUpdateJob = vi.fn();
vi.mock("@/lib/api/jobs", () => ({
	updateJob: (...args: unknown[]) => mockUpdateJob(...args),
}));

const { failIfExpired } = await import("@/lib/api/job-deadline");

const MINUTE = 60_000;

function job(overrides: Partial<JobRow> & { ageMs: number }): JobRow {
	const { ageMs, ...rest } = overrides;
	return {
		id: "job-1",
		user_id: "user-1",
		project_id: null,
		connector_type: "image",
		status: "processing",
		request: {},
		result: null,
		metadata: {},
		error: null,
		created_at: new Date(Date.now() - ageMs).toISOString(),
		updated_at: new Date().toISOString(),
		...rest,
	};
}

describe("failIfExpired", () => {
	beforeEach(() => {
		mockUpdateJob.mockReset().mockResolvedValue(undefined);
	});

	it("leaves a job inside its budget alone", async () => {
		const live = job({ ageMs: 10 * MINUTE });
		await expect(failIfExpired(live)).resolves.toBe(live);
		expect(mockUpdateJob).not.toHaveBeenCalled();
	});

	it("fails a job past its budget", async () => {
		const result = await failIfExpired(job({ ageMs: 20 * MINUTE }));
		expect(result).toMatchObject({
			status: "failed",
			error: "Job timed out after 15 minutes",
		});
		expect(mockUpdateJob).toHaveBeenCalledExactlyOnceWith("job-1", {
			status: "failed",
			error: "Job timed out after 15 minutes",
		});
	});

	it("gives video a longer budget", async () => {
		const video = job({ connector_type: "video", ageMs: 30 * MINUTE });
		await expect(failIfExpired(video)).resolves.toBe(video);

		const expired = await failIfExpired(
			job({ connector_type: "video", ageMs: 50 * MINUTE }),
		);
		expect(expired.error).toBe("Job timed out after 45 minutes");
	});

	it("never touches a finished job", async () => {
		const done = job({ status: "completed", ageMs: 120 * MINUTE });
		await expect(failIfExpired(done)).resolves.toBe(done);
		expect(mockUpdateJob).not.toHaveBeenCalled();
	});
});
