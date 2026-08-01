import { beforeEach, describe, expect, it, vi } from "vitest";

type Result = { data: unknown; error: unknown };

const single = vi.fn<() => Promise<Result>>();
const maybeSingle = vi.fn<() => Promise<Result>>();
const updateResult = vi.fn<() => Promise<{ error: unknown }>>();

const insert = vi.fn(() => ({ select: () => ({ single }) }));
const select = vi.fn(() => {
	const filter = {
		eq: () => filter,
		single,
		maybeSingle,
	};
	return filter;
});
const update = vi.fn(() => ({ eq: () => updateResult() }));
const from = vi.fn(() => ({ insert, select, update }));

vi.mock("@/lib/supabase/server", () => ({
	createClient: () => Promise.resolve({ from }),
}));
vi.mock("@/lib/supabase/service", () => ({
	createServiceClient: () => ({ from }),
}));

const send = vi.fn();
vi.mock("@vercel/queue", () => ({
	send: (...args: unknown[]) => send(...args),
}));

const { createJob, getJob, loadJobForProcessing, updateJob, enqueueJob } =
	await import("../jobs");

describe("createJob", () => {
	beforeEach(() => vi.clearAllMocks());

	it("defaults a missing projectId to null rather than dropping the column", async () => {
		single.mockResolvedValue({ data: { id: "job-1" }, error: null });

		await expect(
			createJob({
				userId: "user-1",
				connectorType: "image",
				request: { prompt: "a cat" },
			}),
		).resolves.toEqual({ id: "job-1" });

		expect(from).toHaveBeenCalledWith("jobs");
		expect(insert).toHaveBeenCalledWith({
			user_id: "user-1",
			project_id: null,
			connector_type: "image",
			request: { prompt: "a cat" },
		});
	});

	it("throws when the insert reports an error", async () => {
		single.mockResolvedValue({ data: null, error: { message: "rls denied" } });

		await expect(
			createJob({ userId: "u", connectorType: "tts", request: {} }),
		).rejects.toThrow("Failed to create job: rls denied");
	});

	it("throws when the insert returns no row", async () => {
		single.mockResolvedValue({ data: null, error: null });

		await expect(
			createJob({ userId: "u", connectorType: "tts", request: {} }),
		).rejects.toThrow("Failed to create job");
	});
});

describe("getJob", () => {
	beforeEach(() => vi.clearAllMocks());

	it("returns null for a job the user does not own", async () => {
		maybeSingle.mockResolvedValue({ data: null, error: null });

		await expect(getJob("job-1", "user-1")).resolves.toBeNull();
	});

	it("throws instead of masking a query error as a missing job", async () => {
		maybeSingle.mockResolvedValue({ data: null, error: { message: "boom" } });

		await expect(getJob("job-1", "user-1")).rejects.toThrow(
			"Failed to load job: boom",
		);
	});
});

describe("loadJobForProcessing", () => {
	beforeEach(() => vi.clearAllMocks());

	it("throws with the job id when the row is absent", async () => {
		single.mockResolvedValue({ data: null, error: { message: "no rows" } });

		await expect(loadJobForProcessing("job-9")).rejects.toThrow(
			"Job job-9 not found: no rows",
		);
	});
});

describe("updateJob", () => {
	beforeEach(() => vi.clearAllMocks());

	it("skips the write when every field is undefined", async () => {
		await updateJob("job-1", { status: undefined, error: undefined });

		expect(from).not.toHaveBeenCalled();
	});

	it("drops undefined fields so they cannot null out existing columns", async () => {
		updateResult.mockResolvedValue({ error: null });

		await updateJob("job-1", { status: "failed", result: undefined });

		expect(update).toHaveBeenCalledWith({ status: "failed" });
	});

	it("throws when the update reports an error", async () => {
		updateResult.mockResolvedValue({ error: { message: "conflict" } });

		await expect(updateJob("job-1", { status: "completed" })).rejects.toThrow(
			"Failed to update job: conflict",
		);
	});
});

describe("enqueueJob", () => {
	beforeEach(() => vi.clearAllMocks());

	it("publishes the job id and connector type to the asset topic", async () => {
		await enqueueJob("job-1", "video");

		expect(send).toHaveBeenCalledWith("asset-generate", {
			jobId: "job-1",
			connectorType: "video",
		});
	});
});
