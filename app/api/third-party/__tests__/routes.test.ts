import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mockCreateJob = vi.fn();
const mockEnqueueJob = vi.fn();
vi.mock("@/lib/api/jobs", () => ({
	createJob: (...args: unknown[]) => mockCreateJob(...args),
	enqueueJob: (...args: unknown[]) => mockEnqueueJob(...args),
	getJob: vi.fn(),
}));

vi.mock("@/lib/api/logger", () => ({
	logger: { error: vi.fn(), warn: vi.fn() },
}));

const mockGetUser = vi.fn();
vi.mock("@/lib/api/auth", () => ({ getUser: () => mockGetUser() }));

const post = async (body: Record<string, unknown>) => {
	const { POST } = await import("@/app/api/third-party/image/route");
	return POST(
		new NextRequest(new URL("http://localhost:3000/api/third-party/image"), {
			method: "POST",
			body: JSON.stringify(body),
		}),
	);
};

describe("POST /api/third-party/image", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetUser.mockResolvedValue({ id: "user-1", app_metadata: {} });
		mockCreateJob.mockResolvedValue({ id: "job-abc" });
	});

	const BYOK_BODY = {
		prompt: "cat",
		provider: "runware",
		model: "Seedream 5 Lite",
	};

	// A signed-in user generating on their own key needs no API grant from us.
	it("takes a session without the api_access grant", async () => {
		const res = await post(BYOK_BODY);
		expect(res.status).toBe(200);
	});

	// The key is read once, by the worker, when the job runs; the route only
	// records whose key that will be.
	it("queues the job with the provider and model the caller named", async () => {
		await post(BYOK_BODY);

		expect(mockCreateJob).toHaveBeenCalledWith(
			expect.objectContaining({
				userId: "user-1",
				connectorType: "image",
				request: expect.objectContaining({
					provider: "runware",
					model: "Seedream 5 Lite",
				}),
			}),
		);
		expect(mockEnqueueJob).toHaveBeenCalledWith("job-abc", "image");
	});

	it("refuses a model OpenSlop hosts, which has its own route", async () => {
		const res = await post({
			prompt: "cat",
			provider: "openslop",
			model: "Slop Image v1",
		});

		expect(res.status).toBe(400);
		expect(mockCreateJob).not.toHaveBeenCalled();
	});

	it("refuses a model without the provider that serves it", async () => {
		const res = await post({ prompt: "cat", model: "Seedream 5 Lite" });

		expect(res.status).toBe(400);
		expect(mockCreateJob).not.toHaveBeenCalled();
	});
});
