import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { readSSE } from "@/lib/api/sse";

const mockCreateSandbox = vi.fn();
const mockAddBundleToSandbox = vi.fn();
const mockRenderMediaOnVercel = vi.fn();
const mockUploadToVercelBlob = vi.fn();
const mockBundleRemotionProject = vi.fn();
const mockRestoreSnapshot = vi.fn();
const mockSandboxStop = vi.fn();

vi.mock("@remotion/vercel", () => ({
	createSandbox: (...args: unknown[]) => mockCreateSandbox(...args),
	addBundleToSandbox: (...args: unknown[]) => mockAddBundleToSandbox(...args),
	renderMediaOnVercel: (...args: unknown[]) => mockRenderMediaOnVercel(...args),
	uploadToVercelBlob: (...args: unknown[]) => mockUploadToVercelBlob(...args),
}));

vi.mock("../helpers", () => ({
	bundleRemotionProject: (...args: unknown[]) =>
		mockBundleRemotionProject(...args),
}));

vi.mock("../restore-snapshot", () => ({
	restoreSnapshot: (...args: unknown[]) => mockRestoreSnapshot(...args),
}));

vi.mock("@/lib/api/logger", () => ({
	logger: { error: vi.fn(), warn: vi.fn() },
}));

const mockGetUser = vi.fn();
vi.mock("@/lib/api/auth", () => ({
	getUser: () => mockGetUser(),
}));

function makeRequest(body?: unknown, opts: { rawBody?: string } = {}) {
	return new Request("http://localhost:3000/api/render", {
		method: "POST",
		body: opts.rawBody ?? (body !== undefined ? JSON.stringify(body) : ""),
	});
}

async function collectSSE(res: Response) {
	if (!res.body) throw new Error("expected SSE body");
	const events: unknown[] = [];
	for await (const ev of readSSE(res.body)) events.push(ev);
	return events;
}

describe("POST /api/render", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubEnv("BLOB_READ_WRITE_TOKEN", "blob-token");
		vi.stubEnv("VERCEL", "");
		mockGetUser.mockResolvedValue({ id: "user-1" });
		mockSandboxStop.mockResolvedValue(undefined);
		mockCreateSandbox.mockResolvedValue({ stop: mockSandboxStop });
		mockRestoreSnapshot.mockResolvedValue({ stop: mockSandboxStop });
		mockRenderMediaOnVercel.mockResolvedValue({
			sandboxFilePath: "/tmp/out.mp4",
			contentType: "video/mp4",
		});
		mockUploadToVercelBlob.mockResolvedValue({
			url: "https://blob.example/out.mp4",
			size: 1024,
		});
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("returns 401 when the user is not authenticated", async () => {
		mockGetUser.mockResolvedValue(null);
		const { POST } = await import("../route");

		const res = await POST(makeRequest({ inputProps: {} }));
		expect(res.status).toBe(401);
		expect(mockCreateSandbox).not.toHaveBeenCalled();
	});

	it("returns 500 when BLOB_READ_WRITE_TOKEN is missing", async () => {
		vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
		const { POST } = await import("../route");

		const res = await POST(makeRequest({ inputProps: {} }));
		expect(res.status).toBe(500);
		expect((await res.json()).error).toContain("BLOB_READ_WRITE_TOKEN");
	});

	it("returns 400 for invalid JSON body", async () => {
		const { POST } = await import("../route");
		const res = await POST(makeRequest(undefined, { rawBody: "not-json" }));
		expect(res.status).toBe(400);
		expect((await res.json()).error).toBe("Invalid JSON");
	});

	it("returns 400 when inputProps is missing", async () => {
		const { POST } = await import("../route");
		const res = await POST(makeRequest({}));
		expect(res.status).toBe(400);
		expect((await res.json()).error).toBe("Missing inputProps");
	});

	it("streams phase and done events on successful render (local)", async () => {
		const { POST } = await import("../route");
		const res = await POST(makeRequest({ inputProps: { foo: "bar" } }));

		expect(res.headers.get("content-type")).toBe("text/event-stream");
		const events = (await collectSSE(res)) as Array<Record<string, unknown>>;

		const phases = events.filter((e) => e.type === "phase");
		const done = events.find((e) => e.type === "done");

		expect(phases.length).toBeGreaterThan(0);
		expect(phases[0]).toMatchObject({
			phase: "Creating sandbox...",
			progress: 0,
		});
		expect(done).toMatchObject({
			type: "done",
			url: "https://blob.example/out.mp4",
			size: 1024,
		});

		expect(mockCreateSandbox).toHaveBeenCalled();
		expect(mockBundleRemotionProject).toHaveBeenCalledWith(".remotion");
		expect(mockAddBundleToSandbox).toHaveBeenCalled();
		expect(mockRestoreSnapshot).not.toHaveBeenCalled();
		expect(mockSandboxStop).toHaveBeenCalled();
	});

	it("uses restoreSnapshot and skips bundling on Vercel", async () => {
		vi.stubEnv("VERCEL", "1");
		const { POST } = await import("../route");

		const res = await POST(makeRequest({ inputProps: { foo: "bar" } }));
		await collectSSE(res);

		expect(mockRestoreSnapshot).toHaveBeenCalled();
		expect(mockCreateSandbox).not.toHaveBeenCalled();
		expect(mockBundleRemotionProject).not.toHaveBeenCalled();
		expect(mockAddBundleToSandbox).not.toHaveBeenCalled();
	});

	it("emits known stage labels from render progress", async () => {
		mockRenderMediaOnVercel.mockImplementation(async ({ onProgress }) => {
			await onProgress({ stage: "render-progress", overallProgress: 0.42 });
			await onProgress({ stage: "unknown-stage", overallProgress: 0.5 });
			return { sandboxFilePath: "/tmp/o.mp4", contentType: "video/mp4" };
		});

		const { POST } = await import("../route");
		const res = await POST(makeRequest({ inputProps: {} }));
		const events = (await collectSSE(res)) as Array<Record<string, unknown>>;

		const renderPhase = events.find(
			(e) => e.type === "phase" && e.phase === "Rendering video...",
		);
		const unknownPhase = events.find(
			(e) => e.type === "phase" && e.phase === "unknown-stage",
		);
		expect(renderPhase).toMatchObject({ progress: 0.42 });
		expect(unknownPhase).toBeUndefined();
	});

	it("emits an error event and stops sandbox when render fails", async () => {
		mockRenderMediaOnVercel.mockRejectedValue(new Error("render boom"));

		const { POST } = await import("../route");
		const res = await POST(makeRequest({ inputProps: {} }));
		const events = (await collectSSE(res)) as Array<Record<string, unknown>>;

		const error = events.find((e) => e.type === "error") as {
			type: string;
			message: string;
		};
		expect(error.type).toBe("error");
		expect(JSON.parse(error.message)).toMatchObject({ message: "render boom" });
		expect(mockSandboxStop).toHaveBeenCalled();
	});

	it("serializes non-Error throws", async () => {
		mockRenderMediaOnVercel.mockRejectedValue("string failure");

		const { POST } = await import("../route");
		const res = await POST(makeRequest({ inputProps: {} }));
		const events = (await collectSSE(res)) as Array<Record<string, unknown>>;

		const error = events.find((e) => e.type === "error") as { message: string };
		expect(JSON.parse(error.message)).toMatchObject({
			message: expect.stringContaining("string failure"),
		});
	});

	it("forwards createSandbox progress with development subtitle", async () => {
		mockCreateSandbox.mockImplementation(async ({ onProgress }) => {
			await onProgress({ progress: 0.3, message: "Booting sandbox..." });
			return { stop: mockSandboxStop };
		});

		const { POST } = await import("../route");
		const res = await POST(makeRequest({ inputProps: {} }));
		const events = (await collectSSE(res)) as Array<Record<string, unknown>>;

		const sandboxPhase = events.find(
			(e) => e.type === "phase" && e.phase === "Booting sandbox...",
		);
		expect(sandboxPhase).toMatchObject({
			progress: 0.3,
			subtitle: "This is only needed during development.",
		});
	});
});
