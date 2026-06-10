import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetUser = vi.fn();
vi.mock("@/lib/api/auth", () => ({
	getUser: () => mockGetUser(),
}));

const mockRenderMediaOnLambda = vi.fn();
vi.mock("@remotion/lambda/client", () => ({
	renderMediaOnLambda: (...args: unknown[]) => mockRenderMediaOnLambda(...args),
	speculateFunctionName: () => "remotion-render-fn",
}));

vi.mock("@/lib/api/logger", () => ({
	logger: { error: vi.fn(), warn: vi.fn() },
}));

const { POST } = await import("@/app/api/render/route");

function makeRequest(body: unknown) {
	return new NextRequest(new URL("/api/render", "http://localhost:3000"), {
		method: "POST",
		body: JSON.stringify(body),
	});
}

describe("POST /api/render", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetUser.mockResolvedValue({ id: "user-1" });
	});

	it("returns 401 when unauthenticated", async () => {
		mockGetUser.mockResolvedValue(null);

		const res = await POST(makeRequest({ inputProps: {} }));

		expect(res.status).toBe(401);
	});

	it("returns 400 for an invalid body", async () => {
		const res = await POST(makeRequest({ inputProps: "not-an-object" }));

		expect(res.status).toBe(400);
	});

	it("kicks off a lambda render and returns its identifiers", async () => {
		mockRenderMediaOnLambda.mockResolvedValue({
			renderId: "render-1",
			bucketName: "bucket-1",
		});

		const res = await POST(makeRequest({ inputProps: { scenes: [] } }));

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({
			renderId: "render-1",
			bucketName: "bucket-1",
		});
		expect(mockRenderMediaOnLambda).toHaveBeenCalledWith(
			expect.objectContaining({
				codec: "h264",
				functionName: "remotion-render-fn",
				inputProps: { scenes: [] },
			}),
		);
	});
});
