import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetUser = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}));

import { updateSession } from "../middleware";

function makeRequest(path: string, headers?: Record<string, string>) {
  return new NextRequest(new URL(path, "http://localhost:3000"), {
    headers: headers || {},
  });
}

describe("middleware - API auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  });

  it("returns 401 for /api/v1/* without Authorization header", async () => {
    const res = await updateSession(makeRequest("/api/v1/image"));

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  it("returns 401 for /api/v1/* with non-Bearer auth", async () => {
    const res = await updateSession(
      makeRequest("/api/v1/image", { authorization: "Basic abc123" }),
    );

    expect(res.status).toBe(401);
  });

  it("returns 401 for /api/v1/* with invalid Bearer token", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: "invalid token" },
    });

    const res = await updateSession(
      makeRequest("/api/v1/image", { authorization: "Bearer bad-token" }),
    );

    expect(res.status).toBe(401);
    expect(mockGetUser).toHaveBeenCalledWith("bad-token");
  });

  it("passes through for /api/v1/* with valid Bearer token", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });

    const res = await updateSession(
      makeRequest("/api/v1/llm", { authorization: "Bearer valid-token" }),
    );

    expect(res.status).toBe(200);
    expect(mockGetUser).toHaveBeenCalledWith("valid-token");
  });

  it("does not interfere with non-API routes", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const res = await updateSession(makeRequest("/"));
    expect(res.status).toBe(200);
  });

  it("redirects authenticated user from /login", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });

    const res = await updateSession(makeRequest("/login"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/");
  });
});
