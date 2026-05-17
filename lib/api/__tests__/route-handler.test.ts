import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { bodySchema, createRouteHandler } from "../route-handler";

vi.mock("../logger", () => ({
	logger: { warn: vi.fn(), error: vi.fn() },
}));

const mockGetUser = vi.fn();
vi.mock("../auth", () => ({
	getUser: () => mockGetUser(),
}));

beforeEach(() => {
	mockGetUser.mockResolvedValue({ id: "user-1" });
});

function makeRequest(body: unknown) {
	return new NextRequest("http://localhost/api/test", {
		method: "POST",
		body: JSON.stringify(body),
		headers: { "Content-Type": "application/json" },
	});
}

const models = { "model-a": "slug-a", "model-b": "slug-b" };
const schema = bodySchema(models, {});

function makeHandler(
	handle?: Parameters<typeof createRouteHandler>[0]["handle"],
) {
	return createRouteHandler({
		schema,
		label: "TestRoute",
		handle:
			handle ??
			(async ({ body }) =>
				NextResponse.json({ ok: true, prompt: body.prompt })),
	});
}

describe("createRouteHandler", () => {
	it("returns 401 when the user is not authenticated", async () => {
		mockGetUser.mockResolvedValue(null);
		const handle = vi.fn(async () => NextResponse.json({}));
		const handler = makeHandler(handle);
		const res = await handler(makeRequest({ prompt: "hello" }));
		expect(res.status).toBe(401);
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
		expect(json.error).toContain("model-a");
	});

	it("maps model name to slug and passes to handle", async () => {
		const handle = vi.fn(async () => NextResponse.json({ done: true }));
		const handler = makeHandler(handle);
		await handler(makeRequest({ prompt: "hello", model: "model-a" }));

		expect(handle).toHaveBeenCalledWith(
			expect.objectContaining({
				user: { id: "user-1" },
				body: expect.objectContaining({ prompt: "hello", model: "slug-a" }),
			}),
		);
	});

	it("returns successful response when valid", async () => {
		const handler = makeHandler();
		const res = await handler(makeRequest({ prompt: "hello" }));
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ ok: true, prompt: "hello" });
	});

	it("returns 500 with the error message when handle throws an Error", async () => {
		const handler = makeHandler(async () => {
			throw new Error("boom");
		});
		const res = await handler(makeRequest({ prompt: "hello" }));
		expect(res.status).toBe(500);
		const json = await res.json();
		expect(json.error).toContain("TestRoute failed: ");
		expect(json.error).toContain("boom");
	});

	it("stringifies non-Error throws", async () => {
		const handler = makeHandler(async () => {
			throw "raw string failure";
		});
		const res = await handler(makeRequest({ prompt: "hello" }));
		expect(res.status).toBe(500);
		const json = await res.json();
		expect(json.error).toContain("TestRoute failed: ");
		expect(json.error).toContain("raw string failure");
	});
});
