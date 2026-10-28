import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { createJobPollHandler } from "../asset-routes";
import { HOSTED } from "../route-families";
import { bodySchema, hostedModel } from "../generation-schema";
import {
	createHostedRouteHandler,
	createSessionRouteHandler,
} from "../route-handler";

const mockGetJob = vi.fn();
const mockUpdateJob = vi.fn();
vi.mock("../jobs", () => ({
	createJob: vi.fn(),
	enqueueJob: vi.fn(),
	getJob: (...args: unknown[]) => mockGetJob(...args),
	updateJob: (...args: unknown[]) => mockUpdateJob(...args),
	spentSince: async () => 0,
}));

vi.mock("../logger", () => ({
	logger: { warn: vi.fn(), error: vi.fn() },
}));

const mockGetUser = vi.fn();
vi.mock("../auth", () => ({
	getUser: () => mockGetUser(),
}));

beforeEach(() => {
	mockGetJob.mockReset();
	mockGetUser.mockResolvedValue({
		id: "user-1",
		app_metadata: { api_access: true },
	});
});

const VALID_BODY = { prompt: "hello", model: "Slop Image v1" };

function makeRequest(body: unknown) {
	return new NextRequest("http://localhost/api/test", {
		method: "POST",
		body: JSON.stringify(body),
		headers: { "Content-Type": "application/json" },
	});
}

const schema = bodySchema(hostedModel("image"), {});

function makeHandler(
	handle?: Parameters<typeof createHostedRouteHandler>[0]["handle"],
) {
	return createHostedRouteHandler({
		schema,
		label: "TestRoute",
		handle:
			handle ??
			(async ({ input }) =>
				NextResponse.json({ ok: true, prompt: input.prompt })),
	});
}

describe("createHostedRouteHandler", () => {
	it("returns 401 when the user is not authenticated", async () => {
		mockGetUser.mockResolvedValue(null);
		const handle = vi.fn(async () => NextResponse.json({}));
		const handler = makeHandler(handle);
		const res = await handler(makeRequest({ prompt: "hello" }));
		expect(res.status).toBe(401);
		expect(handle).not.toHaveBeenCalled();
	});

	it("returns 403 when the user lacks api_access", async () => {
		mockGetUser.mockResolvedValue({ id: "user-1", app_metadata: {} });
		const handle = vi.fn(async () => NextResponse.json({}));
		const handler = makeHandler(handle);
		const res = await handler(makeRequest({ prompt: "hello" }));
		expect(res.status).toBe(403);
		expect(handle).not.toHaveBeenCalled();
	});

	it("returns 500 when the api_access flag is not a boolean", async () => {
		mockGetUser.mockResolvedValue({
			id: "user-1",
			app_metadata: { api_access: "true" },
		});
		const handle = vi.fn(async () => NextResponse.json({}));
		const handler = makeHandler(handle);
		const res = await handler(makeRequest({ prompt: "hello" }));
		expect(res.status).toBe(500);
		expect(handle).not.toHaveBeenCalled();
	});

	it("returns 400 when prompt is missing", async () => {
		const handler = makeHandler();
		const res = await handler(makeRequest({}));
		expect(res.status).toBe(400);
		expect((await res.json()).error).toBe("prompt is required");
	});

	it("returns 400 when body is null", async () => {
		const handler = makeHandler();
		const res = await handler(makeRequest(null));
		expect(res.status).toBe(400);
		expect((await res.json()).error).toBe("Request body must be a JSON object");
	});

	it("returns 400 when body is an array", async () => {
		const handler = makeHandler();
		const res = await handler(makeRequest(["prompt"]));
		expect(res.status).toBe(400);
		expect((await res.json()).error).toBe("Request body must be a JSON object");
	});

	it("returns 400 when body is a primitive", async () => {
		const handler = makeHandler();
		const res = await handler(makeRequest("hello"));
		expect(res.status).toBe(400);
		expect((await res.json()).error).toBe("Request body must be a JSON object");
	});

	it("returns 400 when prompt is not a string", async () => {
		const handler = makeHandler();
		const res = await handler(makeRequest({ prompt: 123 }));
		expect(res.status).toBe(400);
		expect((await res.json()).error).toBe("prompt is required");
	});

	it("returns 400 for invalid model", async () => {
		const handler = makeHandler();
		const res = await handler(
			makeRequest({ prompt: "hello", model: "unknown" }),
		);
		expect(res.status).toBe(400);
		const json = await res.json();
		expect(json.error).toContain("Invalid model");
		expect(json.error).toContain("Slop Image v1");
	});

	// The name is what says which provider serves the model, so it survives the
	// boundary; only the code that reaches a vendor turns it into that vendor's id.
	it("passes the model through by name, with the provider it runs on", async () => {
		const handle = vi.fn(async () => NextResponse.json({ done: true }));
		const handler = makeHandler(handle);
		await handler(makeRequest({ prompt: "hello", model: "Slop Image v1" }));

		expect(handle).toHaveBeenCalledWith(
			expect.objectContaining({
				user: expect.objectContaining({ id: "user-1" }),
				input: expect.objectContaining({
					prompt: "hello",
					provider: "openslop",
					model: "Slop Image v1",
				}),
			}),
		);
	});

	it("returns successful response when valid", async () => {
		const handler = makeHandler();
		const res = await handler(makeRequest(VALID_BODY));
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ ok: true, prompt: "hello" });
	});

	it("returns 500 with a generic message, not the internal error", async () => {
		const handler = makeHandler(async () => {
			throw new Error("boom");
		});
		const res = await handler(makeRequest(VALID_BODY));
		expect(res.status).toBe(500);
		expect(await res.json()).toEqual({ error: "TestRoute failed" });
	});

	it("answers a generic 500 for non-Error throws too", async () => {
		const handler = makeHandler(async () => {
			throw "raw string failure";
		});
		const res = await handler(makeRequest(VALID_BODY));
		expect(res.status).toBe(500);
		expect(await res.json()).toEqual({ error: "TestRoute failed" });
	});
});

describe("createSessionRouteHandler", () => {
	function makeUserHandler() {
		return createSessionRouteHandler({
			schema,
			label: "TestUserRoute",
			handle: async ({ input }) => NextResponse.json({ prompt: input.prompt }),
		});
	}

	it("returns 401 when the user is not authenticated", async () => {
		mockGetUser.mockResolvedValue(null);
		const res = await makeUserHandler()(makeRequest({ prompt: "hello" }));
		expect(res.status).toBe(401);
	});

	it("allows signed-in users without api_access", async () => {
		mockGetUser.mockResolvedValue({ id: "user-1", app_metadata: {} });
		const res = await makeUserHandler()(makeRequest(VALID_BODY));
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ prompt: "hello" });
	});

	it("returns 400 for an invalid body", async () => {
		const res = await makeUserHandler()(makeRequest({}));
		expect(res.status).toBe(400);
	});
});

describe("createJobPollHandler", () => {
	const pollJob = createJobPollHandler(HOSTED);
	const request = new NextRequest("http://localhost/api/v1/image/bruh");

	function poll(jobId: string) {
		return pollJob(request, { params: Promise.resolve({ jobId }) });
	}

	it("returns 404 for a malformed job id without querying the database", async () => {
		const res = await poll("bruh");
		expect(res.status).toBe(404);
		expect(mockGetJob).not.toHaveBeenCalled();
	});

	it("returns 404 for a well-formed id with no matching job", async () => {
		mockGetJob.mockResolvedValue(null);
		const res = await poll("00000000-0000-0000-0000-000000000000");
		expect(res.status).toBe(404);
	});

	function storedJob(ageMs: number) {
		return {
			id: "00000000-0000-0000-0000-000000000000",
			connector_type: "image",
			status: "pending",
			result: null,
			error: null,
			created_at: new Date(Date.now() - ageMs).toISOString(),
		};
	}

	it("returns the job view when the job exists", async () => {
		mockGetJob.mockResolvedValue(storedJob(0));
		const res = await poll("00000000-0000-0000-0000-000000000000");
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({
			jobId: "00000000-0000-0000-0000-000000000000",
			status: "pending",
			result: null,
			error: null,
		});
	});

	it("fails a job past its deadline before reporting it", async () => {
		mockGetJob.mockResolvedValue(storedJob(60 * 60_000));
		mockUpdateJob.mockResolvedValue(undefined);
		const res = await poll("00000000-0000-0000-0000-000000000000");
		expect(await res.json()).toMatchObject({
			status: "failed",
			error: "Job timed out after 15 minutes",
		});
		expect(mockUpdateJob).toHaveBeenCalledOnce();
	});
});
