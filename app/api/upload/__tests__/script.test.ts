import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetUser = vi.fn();
vi.mock("@/lib/api/auth", () => ({
	getUser: () => mockGetUser(),
}));

const mockExtractText = vi.fn();
vi.mock("unpdf", () => ({
	getDocumentProxy: async (data: Uint8Array) => ({ data }),
	extractText: (...args: unknown[]) => mockExtractText(...args),
}));

const { POST } = await import("@/app/api/upload/script/route");

function makeRequest(formData: FormData) {
	return new NextRequest(
		new URL("/api/upload/script", "http://localhost:3000"),
		{ method: "POST", body: formData },
	);
}

function makeFile(
	name = "script.pdf",
	type = "application/pdf",
	size = 1024,
): File {
	return new File([new Uint8Array(size)], name, { type });
}

function withFile(file: File) {
	const formData = new FormData();
	formData.set("file", file);
	return makeRequest(formData);
}

describe("POST /api/upload/script", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetUser.mockResolvedValue({ id: "user-1" });
		mockExtractText.mockResolvedValue({ totalPages: 1, text: "EXT. NIGHT" });
	});

	it("returns 401 when unauthenticated", async () => {
		mockGetUser.mockResolvedValue(null);

		expect((await POST(makeRequest(new FormData()))).status).toBe(401);
	});

	it("returns 400 when no file is provided", async () => {
		const res = await POST(makeRequest(new FormData()));

		expect(res.status).toBe(400);
		expect(await res.json()).toEqual({ error: "No file provided" });
	});

	it("returns 400 for non-PDF files", async () => {
		const res = await POST(withFile(makeFile("photo.png", "image/png")));

		expect(res.status).toBe(400);
		expect(await res.json()).toEqual({ error: "File must be a PDF" });
	});

	it("returns 400 for files over 10 MB", async () => {
		const res = await POST(
			withFile(makeFile("big.pdf", "application/pdf", 10 * 1024 * 1024 + 1)),
		);

		expect(res.status).toBe(400);
		expect(await res.json()).toEqual({ error: "File must be under 10 MB" });
	});

	it("returns the extracted text", async () => {
		mockExtractText.mockResolvedValue({
			totalPages: 2,
			text: "\n EXT. NIGHT STARRY SKY \n",
		});

		const res = await POST(withFile(makeFile()));

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ text: "EXT. NIGHT STARRY SKY" });
		expect(mockExtractText).toHaveBeenCalledWith(expect.anything(), {
			mergePages: true,
		});
	});

	it("rejects a PDF with no readable text instead of returning an empty script", async () => {
		mockExtractText.mockResolvedValue({ totalPages: 1, text: "  \n  " });

		const res = await POST(withFile(makeFile()));

		expect(res.status).toBe(400);
		expect((await res.json()).error).toMatch(/No text found/);
	});
});
