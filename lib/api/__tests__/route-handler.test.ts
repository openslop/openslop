import { describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandler } from "../route-handler";

vi.mock("../logger", () => ({
	logger: { warn: vi.fn(), error: vi.fn() },
}));

function makeRequest(body: unknown) {
	return new NextRequest("http://localhost/api/test", {
		method: "POST",
		body: JSON.stringify(body),
		headers: { "Content-Type": "application/json" },
	});
}

const models = { "model-a": "slug-a", "model-b": "slug-b" };

function makeHandler(overrides?: {
	extraValidation?: (body: Record<string, unknown>) => Response | null;
	handle?: (
		provider: string,
		body: Record<string, unknown>,
	) => Promise<Response>;
}) {
	return createRouteHandler<string>({
		models,
		getProvider: () => "test-provider",
		label: "TestRoute",
		...overrides,
		handle:
			overrides?.handle ??
			(async (_provider, body) =>
				NextResponse.json({ ok: true, prompt: body.prompt })),
	});
}

describe("createRouteHandler", () => {
	it("returns 400 when prompt is missing", async () => {
		const handler = makeHandler();
		const res = await handler(makeRequest({}));
		expect(res.status).toBe(400);
		const json = await res.json();
		expect(json.error).toBe("prompt is required");
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
			"test-provider",
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

	it("calls extraValidation and returns its response on failure", async () => {
		const handler = makeHandler({
			extraValidation: () =>
				Response.json({ error: "custom" }, { status: 422 }),
		});
		const res = await handler(makeRequest({ prompt: "hello" }));
		expect(res.status).toBe(422);
	});

	it("proceeds when extraValidation returns null", async () => {
		const handler = makeHandler({ extraValidation: () => null });
		const res = await handler(makeRequest({ prompt: "hello" }));
		expect(res.status).toBe(200);
	});

	it("returns 500 when handle throws", async () => {
		const handler = makeHandler({
			handle: async () => {
				throw new Error("boom");
			},
		});
		const res = await handler(makeRequest({ prompt: "hello" }));
		expect(res.status).toBe(500);
		const json = await res.json();
		expect(json.error).toBe("TestRoute failed");
	});
});
