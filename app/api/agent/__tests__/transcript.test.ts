import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetUser = vi.fn();
vi.mock("@/lib/api/auth", () => ({
	getUser: () => mockGetUser(),
}));

const mockFindConversation = vi.fn();
const mockListConversationMessages = vi.fn();
vi.mock("@/lib/api/conversations", () => ({
	findConversation: (...args: unknown[]) => mockFindConversation(...args),
	listConversationMessages: (...args: unknown[]) =>
		mockListConversationMessages(...args),
}));

const { GET } = await import("@/app/api/agent/transcript/route");

const PROJECT_ID = "00000000-0000-4000-8000-000000000000";
const MESSAGES = [{ id: "m1", role: "user", parts: [] }];

const getTranscript = () =>
	GET(
		new NextRequest(
			new URL(
				`/api/agent/transcript?projectId=${PROJECT_ID}`,
				"http://localhost:3000",
			),
		),
	);

describe("GET /api/agent/transcript", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetUser.mockResolvedValue({ id: "user-1", app_metadata: {} });
		mockFindConversation.mockResolvedValue("conversation-1");
		mockListConversationMessages.mockResolvedValue(MESSAGES);
	});

	it("returns the caller's transcript for the project without the api_access grant", async () => {
		const res = await getTranscript();

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ messages: MESSAGES });
		expect(mockFindConversation).toHaveBeenCalledWith(PROJECT_ID, "user-1");
		expect(mockListConversationMessages).toHaveBeenCalledWith("conversation-1");
	});

	it("returns an empty transcript before the first turn", async () => {
		mockFindConversation.mockResolvedValue(null);

		expect(await (await getTranscript()).json()).toEqual({ messages: [] });
	});

	it("returns 401 when unauthenticated", async () => {
		mockGetUser.mockResolvedValue(null);

		expect((await getTranscript()).status).toBe(401);
	});
});
