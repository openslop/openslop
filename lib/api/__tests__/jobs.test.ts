import { beforeEach, describe, expect, it, vi } from "vitest";
import { getJobPoll } from "../jobs";

const maybeSingle = vi.fn();
const select = vi.fn();
const from = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
	createClient: async () => ({ from }),
}));

beforeEach(() => {
	vi.clearAllMocks();
	const filtered = { eq: vi.fn(() => filtered), maybeSingle };
	select.mockReturnValue(filtered);
	from.mockReturnValue({ select });
	maybeSingle.mockResolvedValue({ data: null, error: null });
});

describe("getJobPoll", () => {
	it("reads only the columns the poll exposes", async () => {
		await getJobPoll("job-1", "user-1");
		expect(select).toHaveBeenCalledWith("id, status, result, error");
	});

	it("returns the poll view of the row", async () => {
		maybeSingle.mockResolvedValue({
			data: {
				id: "job-1",
				status: "completed",
				result: { id: "asset-1" },
				error: null,
			},
			error: null,
		});
		await expect(getJobPoll("job-1", "user-1")).resolves.toEqual({
			jobId: "job-1",
			status: "completed",
			result: { id: "asset-1" },
			error: null,
		});
	});

	it("returns null when no job matches", async () => {
		await expect(getJobPoll("job-1", "user-1")).resolves.toBeNull();
	});

	it("throws when the read fails", async () => {
		maybeSingle.mockResolvedValue({ data: null, error: { message: "boom" } });
		await expect(getJobPoll("job-1", "user-1")).rejects.toThrow("boom");
	});
});
