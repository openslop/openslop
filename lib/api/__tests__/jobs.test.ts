import pick from "lodash/pick";
import { describe, expect, it, vi } from "vitest";
import {
	bookLlmSpend,
	createJob,
	getJob,
	JOB_CONNECTOR_TYPES,
	loadJobForProcessing,
	spentSince,
} from "../jobs";

type Answer = { data: unknown; error: { message: string } | null };

const rpc = vi.fn();
const table = {
	answer: { data: null, error: null } as Answer,
	insert: vi.fn(() => table),
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
		rpc: (...args: unknown[]) => rpc(...args),
		from: () => table,
	}),
}));
vi.mock("@/lib/supabase/server", () => ({
	createClient: async () => ({ from: () => table }),
}));
vi.mock("@vercel/queue", () => ({ send: vi.fn() }));

const SINCE = new Date("2026-10-01T00:00:00Z");
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
	created_at: "2026-10-01T00:00:00.000Z",
	updated_at: "2026-10-01T00:00:01.000Z",
};

describe("createJob", () => {
	it("queues a pending asset job and returns its id", async () => {
		answerWith({ data: { id: JOB_ID }, error: null });

		await expect(
			createJob({
				userId: "u1",
				projectId: "p1",
				connectorType: "image",
				request: { prompt: "a cat" },
			}),
		).resolves.toEqual({ id: JOB_ID });
		expect(table.insert).toHaveBeenCalledExactlyOnceWith({
			user_id: "u1",
			project_id: "p1",
			connector_type: "image",
			request: { prompt: "a cat" },
		});
	});

	it("throws when the insert fails", async () => {
		answerWith({ data: null, error: { message: "db down" } });

		await expect(
			createJob({ userId: "u1", connectorType: "image", request: {} }),
		).rejects.toThrow("Failed to create job: db down");
	});
});

describe("bookLlmSpend", () => {
	it("writes one finished llm row carrying the cost", async () => {
		answerWith({ data: null, error: null });

		await bookLlmSpend({
			userId: "u1",
			request: { provider: "openslop", model: "Slop LLM v1" },
			costUsd: 0.02,
		});

		expect(table.insert).toHaveBeenCalledExactlyOnceWith({
			user_id: "u1",
			connector_type: "llm",
			request: { provider: "openslop", model: "Slop LLM v1" },
			status: "completed",
			cost_usd: 0.02,
		});
	});

	it("throws when the insert fails", async () => {
		answerWith({ data: null, error: { message: "db down" } });

		await expect(
			bookLlmSpend({
				userId: "u1",
				request: { provider: "openslop", model: "Slop LLM v1" },
				costUsd: 0.02,
			}),
		).rejects.toThrow("Failed to book spend: db down");
	});
});

describe("getJob", () => {
	it("reads only what the poll answers with, from the caller's asset jobs", async () => {
		const polled = pick(STORED_JOB, [
			"id",
			"connector_type",
			"status",
			"result",
			"error",
			"created_at",
		]);
		answerWith({ data: polled, error: null });

		await expect(getJob(JOB_ID, "u1")).resolves.toEqual(polled);
		expect(table.select).toHaveBeenCalledExactlyOnceWith(
			"id, connector_type, status, result, error, created_at",
		);
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
		expect(table.select).toHaveBeenCalledExactlyOnceWith("*");
	});

	it("rejects a booked llm row, which no queue message should name", async () => {
		answerWith({
			data: { ...STORED_JOB, connector_type: "llm" },
			error: null,
		});

		await expect(loadJobForProcessing(JOB_ID)).rejects.toThrow();
	});
});

describe("spentSince", () => {
	it("sums the account's spend on a provider since an instant", async () => {
		rpc.mockResolvedValue({ data: 3.25, error: null });

		expect(await spentSince("u1", "openslop", SINCE)).toBe(3.25);
		expect(rpc).toHaveBeenCalledWith("spend_since", {
			p_user_id: "u1",
			p_provider: "openslop",
			p_since: "2026-10-01T00:00:00.000Z",
		});
	});

	// PostgREST can serialise a numeric as a string to keep its precision.
	it("reads a numeric sent as a string", async () => {
		rpc.mockResolvedValue({ data: "0.180000", error: null });

		expect(await spentSince("u1", "openslop", SINCE)).toBe(0.18);
	});

	it("throws when the query fails", async () => {
		rpc.mockResolvedValue({ data: null, error: { message: "db down" } });

		await expect(spentSince("u1", "openslop", SINCE)).rejects.toThrow(
			"Failed to read spend: db down",
		);
	});
});
