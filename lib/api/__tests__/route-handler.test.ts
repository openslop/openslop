import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { imageFile } from "../request-schema-fields";
import {
	bodySchema,
	createApiRouteHandler,
	createSessionFormRouteHandler,
	createSessionRouteHandler,
} from "../route-handler";

vi.mock("../logger", () => ({
	logger: { warn: vi.fn(), error: vi.fn() },
}));

const mockGetUser = vi.fn();
vi.mock("../auth", () => ({
	getUser: () => mockGetUser(),
}));

beforeEach(() => {
	mockGetUser.mockResolvedValue({
		id: "user-1",
		app_metadata: { api_access: true },
	});
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
	handle?: Parameters<typeof createApiRouteHandler>[0]["handle"],
) {
	return createApiRouteHandler({
		schema,
		label: "TestRoute",
		handle:
			handle ??
			(async ({ input }) =>
				NextResponse.json({ ok: true, prompt: input.prompt })),
	});
}

describe("createApiRouteHandler", () => {
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
				user: expect.objectContaining({ id: "user-1" }),
				input: expect.objectContaining({ prompt: "hello", model: "slug-a" }),
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
		const res = await makeUserHandler()(makeRequest({ prompt: "hello" }));
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ prompt: "hello" });
	});

	it("returns 400 for an invalid body", async () => {
		const res = await makeUserHandler()(makeRequest({}));
		expect(res.status).toBe(400);
	});
});

describe("createSessionFormRouteHandler", () => {
	const MAX_BYTES = 8;
	const handler = createSessionFormRouteHandler({
		schema: z.object({ file: imageFile(MAX_BYTES) }, { error: "No file" }),
		label: "TestFormRoute",
		handle: async ({ input }) => NextResponse.json({ name: input.file.name }),
	});

	function makeFormRequest(entries: Record<string, string | File>) {
		const form = new FormData();
		for (const [key, value] of Object.entries(entries)) form.append(key, value);
		return new NextRequest("http://localhost/api/test", {
			method: "POST",
			body: form,
		});
	}

	const imageOfSize = (bytes: number) =>
		new File([new Uint8Array(bytes)], "cat.png", { type: "image/png" });

	it("passes the validated file to handle", async () => {
		const res = await handler(makeFormRequest({ file: imageOfSize(4) }));
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ name: "cat.png" });
	});

	it("returns 400 when the file field is missing", async () => {
		const res = await handler(makeFormRequest({ other: "x" }));
		expect(res.status).toBe(400);
		expect((await res.json()).error).toBe("No file provided");
	});

	it("returns 400 for a non-image file", async () => {
		const notes = new File(["hi"], "notes.txt", { type: "text/plain" });
		const res = await handler(makeFormRequest({ file: notes }));
		expect(res.status).toBe(400);
		expect((await res.json()).error).toBe("File must be an image");
	});

	it("returns 400 when the file exceeds the size limit", async () => {
		const res = await handler(makeFormRequest({ file: imageOfSize(64) }));
		expect(res.status).toBe(400);
		expect((await res.json()).error).toContain("File must be under");
	});

	it("returns 401 when the user is not authenticated", async () => {
		mockGetUser.mockResolvedValue(null);
		const res = await handler(makeFormRequest({ file: imageOfSize(4) }));
		expect(res.status).toBe(401);
	});
});
