import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mockCreateJob = vi.fn();
const mockEnqueueJob = vi.fn();
vi.mock("@/lib/api/jobs", () => ({
	createJob: (...args: unknown[]) => mockCreateJob(...args),
	enqueueJob: (...args: unknown[]) => mockEnqueueJob(...args),
	getJob: vi.fn(),
}));

const mockRequireConnector = vi.fn();
vi.mock("@/lib/api/connectorKeys", async (importOriginal) => ({
	...(await importOriginal<typeof import("@/lib/api/connectorKeys")>()),
	requireConnector: (...args: unknown[]) => mockRequireConnector(...args),
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
		mockRequireConnector.mockResolvedValue(undefined);
	});

	// A signed-in user generating on their own key needs no API grant from us.
	it("takes a session without the api_access grant", async () => {
		const res = await post({ prompt: "cat", model: "Seedream 5 Lite" });
		expect(res.status).toBe(200);
	});

	// The model is the whole routing decision, so the job records the name and
	// nothing about who serves it.
	it("checks the key of the provider the model names", async () => {
		await post({ prompt: "cat", model: "Seedream 5 Lite" });

		expect(mockRequireConnector).toHaveBeenCalledWith("user-1", "runware");
		expect(mockCreateJob).toHaveBeenCalledWith(
			expect.objectContaining({
				userId: "user-1",
				connectorType: "image",
				// The name, not the vendor's id: it is what the worker resolves both
				// the provider and the id from.
				request: expect.objectContaining({ model: "Seedream 5 Lite" }),
			}),
		);
		expect(mockEnqueueJob).toHaveBeenCalledWith("job-abc", "image");
	});

	it("refuses a model OpenSlop hosts, which has its own route", async () => {
		const res = await post({ prompt: "cat", model: "Slop Image v1" });

		expect(res.status).toBe(400);
		expect(mockCreateJob).not.toHaveBeenCalled();
	});

	// No key means the job could only fail, so it is never created.
	it("refuses before queueing when the provider is not connected", async () => {
		const { MissingConnectorKeyError } =
			await import("@/lib/api/connectorKeys");
		mockRequireConnector.mockRejectedValue(
			new MissingConnectorKeyError("runware"),
		);

		const res = await post({ prompt: "cat", model: "Seedream 5 Lite" });

		expect(res.status).toBe(400);
		expect(await res.json()).toEqual({
			error: "Connect Runware to use this model.",
		});
		expect(mockCreateJob).not.toHaveBeenCalled();
	});
});
