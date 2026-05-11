import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
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

type Provider = {
	generate: (body: z.infer<typeof schema>) => Promise<unknown>;
};

function makeHandler(overrides?: {
	handle?: (
		provider: Provider,
		body: z.infer<typeof schema>,
	) => Promise<Response>;
	generate?: Provider["generate"];
}) {
	const provider: Provider = {
		generate:
			overrides?.generate ??
			(async (body) => ({ ok: true, prompt: body.prompt })),
	};
	return createRouteHandler({
		schema,
		getProvider: () => provider,
		label: "TestRoute",
		handle:
			overrides?.handle ??
			(async (_provider, body) =>
				NextResponse.json({ ok: true, prompt: body.prompt })),
	});
}

describe("createRouteHandler", () => {
	it("returns 401 when the user is not authenticated", async () => {
		mockGetUser.mockResolvedValue(null);
		const generate = vi.fn();
		const handler = makeHandler({ generate });
		const res = await handler(makeRequest({ prompt: "hello" }));
		expect(res.status).toBe(401);
		expect(generate).not.toHaveBeenCalled();
	});

	it("returns 400 when prompt is missing", async () => {
		const handler = makeHandler();
		const res = await handler(makeRequest({}));
		expect(res.status).toBe(400);
		const json = await res.json();
		expect(json.error).toBe("prompt is required");
	});

	it("returns 400 when body is null", async () => {
		const handler = makeHandler();
		const res = await handler(makeRequest(null));
		expect(res.status).toBe(400);
		const json = await res.json();
		expect(json.error).toBe("Request body must be a JSON object");
	});

	it("returns 400 when body is an array", async () => {
		const handler = makeHandler();
		const res = await handler(makeRequest(["prompt"]));
		expect(res.status).toBe(400);
		const json = await res.json();
		expect(json.error).toBe("Request body must be a JSON object");
	});

	it("returns 400 when body is a primitive", async () => {
		const handler = makeHandler();
		const res = await handler(makeRequest("hello"));
		expect(res.status).toBe(400);
		const json = await res.json();
		expect(json.error).toBe("Request body must be a JSON object");
	});

	it("returns 400 when prompt is not a string", async () => {
		const handler = makeHandler();
		const res = await handler(makeRequest({ prompt: 123 }));
		expect(res.status).toBe(400);
		const json = await res.json();
		expect(json.error).toBe("prompt is required");
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
		const handler = makeHandler({ handle });
		await handler(makeRequest({ prompt: "hello", model: "model-a" }));

		expect(handle).toHaveBeenCalledWith(
			expect.objectContaining({ generate: expect.any(Function) }),
			expect.objectContaining({ prompt: "hello", model: "slug-a" }),
		);
	});

	it("returns successful response when valid", async () => {
		const handler = makeHandler();
		const res = await handler(makeRequest({ prompt: "hello" }));
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json).toEqual({ ok: true, prompt: "hello" });
	});

	it("defaults to provider.generate when handle is omitted", async () => {
		const generate = vi.fn(async () => ({ url: "https://example.com/x" }));
		const handler = createRouteHandler({
			schema,
			getProvider: () => ({ generate }),
			label: "TestRoute",
		});
		const res = await handler(makeRequest({ prompt: "hello" }));
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ url: "https://example.com/x" });
		expect(generate).toHaveBeenCalledWith(
			expect.objectContaining({ prompt: "hello" }),
		);
	});

	it("returns a generic 500 when handle throws an Error", async () => {
		const handler = makeHandler({
			handle: async () => {
				throw new Error("boom");
			},
		});
		const res = await handler(makeRequest({ prompt: "hello" }));
		expect(res.status).toBe(500);
		const json = await res.json();
		expect(json.error).toBe("TestRoute failed");
		expect(json.error).not.toContain("boom");
	});

	it("does not leak non-Error throws to clients", async () => {
		const handler = makeHandler({
			handle: async () => {
				throw "raw string failure";
			},
		});
		const res = await handler(makeRequest({ prompt: "hello" }));
		expect(res.status).toBe(500);
		const json = await res.json();
		expect(json.error).toBe("TestRoute failed");
		expect(json.error).not.toContain("raw string failure");
	});
});
