import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { layoutOf } from "@/lib/render/__tests__/_layout";

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

const LAYOUT = layoutOf([]);
const PORTRAIT = layoutOf([], { aspectRatio: "9:16" });
const HANDLE = { renderId: "render-1", bucketName: "remotionlambda-b1" };

function makeRequest(body: unknown) {
	return new NextRequest(new URL("/api/render", "http://localhost:3000"), {
		method: "POST",
		body: JSON.stringify(body),
	});
}

describe("POST /api/render", () => {
	beforeEach(() => {
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

	it("returns 400 for a resolution outside the presets", async () => {
		const res = await POST(
			makeRequest({ inputProps: LAYOUT, resolution: "8K" }),
		);

		expect(res.status).toBe(400);
		expect(mockRenderMediaOnLambda).not.toHaveBeenCalled();
	});

	it("returns 400 without a resolution", async () => {
		const res = await POST(makeRequest({ inputProps: LAYOUT }));

		expect(res.status).toBe(400);
		expect(mockRenderMediaOnLambda).not.toHaveBeenCalled();
	});

	it.each([
		["a canvas off the aspect ratio table", { width: 7680, height: 4320 }],
		["a frame rate other than the base", { fps: 60 }],
		["a canvas with no size", { width: undefined, height: undefined }],
	])("returns 400 for %s", async (_label, canvas) => {
		const res = await POST(
			makeRequest({
				inputProps: { ...LAYOUT, ...canvas },
				resolution: "1080p",
			}),
		);

		expect(res.status).toBe(400);
		expect(mockRenderMediaOnLambda).not.toHaveBeenCalled();
	});

	it.each([
		["landscape", LAYOUT, "4K", 2],
		["portrait", PORTRAIT, "720p", 1280 / 1920],
	])(
		"kicks off a lambda render of the %s layout at the preset's scale and returns its identifiers",
		async (_label, layout, resolution, scale) => {
			mockRenderMediaOnLambda.mockResolvedValue(HANDLE);

			const res = await POST(makeRequest({ inputProps: layout, resolution }));

			expect(res.status).toBe(200);
			expect(await res.json()).toEqual(HANDLE);
			expect(mockRenderMediaOnLambda).toHaveBeenCalledWith(
				expect.objectContaining({
					codec: "h264",
					functionName: "remotion-render-fn",
					inputProps: layout,
					scale,
				}),
			);
		},
	);
});
