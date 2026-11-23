import pick from "lodash/pick";
import { describe, expect, it, vi } from "vitest";
import { getJob, JOB_CONNECTOR_TYPES, loadJobForProcessing } from "../jobs";

type Answer = { data: unknown; error: { message: string } | null };

const table = {
	answer: { data: null, error: null } as Answer,
	select: vi.fn(() => table),
	eq: vi.fn(() => table),
	in: vi.fn(() => table),
	single: vi.fn(() => table),
	maybeSingle: vi.fn(() => table),
	then: (resolve: (answer: Answer) => void) => resolve(table.answer),
};

function answerWith(answer: Answer) {
	table.answer = answer;
}

vi.mock("@/lib/supabase/service", () => ({
	createServiceClient: () => ({
		from: () => table,
	}),
}));
vi.mock("@/lib/supabase/server", () => ({
	createClient: async () => ({ from: () => table }),
}));
vi.mock("@vercel/queue", () => ({ send: vi.fn() }));

const JOB_ID = "00000000-0000-0000-0000-000000000001";

const STORED_JOB = {
	id: JOB_ID,
	user_id: "u1",
	project_id: null,
	connector_type: "image",
	status: "completed",
	request: { provider: "openslop", model: "Slop Image", prompt: "a cat" },
	result: null,
	metadata: {},
	error: null,
	cost_usd: 0.04,
	created_at: "2026-10-01T00:00:00.000Z",
	updated_at: "2026-10-01T00:00:01.000Z",
};

describe("getJob", () => {
	it("reads only what the poll answers with, from the caller's asset jobs", async () => {
		const polled = pick(STORED_JOB, [
			"id",
			"connector_type",
			"status",
			"result",
			"error",
			"cost_usd",
			"created_at",
		]);
		answerWith({ data: polled, error: null });

		await expect(getJob(JOB_ID, "u1")).resolves.toEqual(polled);
		expect(table.eq.mock.calls).toEqual([
			["id", JOB_ID],
			["user_id", "u1"],
		]);
		expect(table.in).toHaveBeenCalledExactlyOnceWith(
			"connector_type",
			JOB_CONNECTOR_TYPES,
		);
	});

	it("returns null when no job matches", async () => {
		answerWith({ data: null, error: null });

		await expect(getJob(JOB_ID, "u1")).resolves.toBeNull();
	});

	it("throws when the query fails", async () => {
		answerWith({ data: null, error: { message: "db down" } });

		await expect(getJob(JOB_ID, "u1")).rejects.toThrow(
			"Failed to load job: db down",
		);
	});
});

describe("loadJobForProcessing", () => {
	it("reads the whole row the worker needs", async () => {
		answerWith({ data: STORED_JOB, error: null });

		await expect(loadJobForProcessing(JOB_ID)).resolves.toEqual(STORED_JOB);
	});

	it("rejects a booked llm row, which no queue message should name", async () => {
		answerWith({
			data: { ...STORED_JOB, connector_type: "llm" },
			error: null,
		});

		await expect(loadJobForProcessing(JOB_ID)).rejects.toThrow();
	});
});
