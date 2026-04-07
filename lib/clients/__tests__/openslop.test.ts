import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getSession: () =>
        Promise.resolve({
          data: { session: { access_token: "test-token" } },
        }),
    },
  }),
}));

import { OpenSlopClient } from "../openslop";

describe("OpenSlopClient", () => {
  let client: OpenSlopClient;

  beforeEach(() => {
    client = new OpenSlopClient("https://api.test");
    vi.restoreAllMocks();
  });

  describe("post", () => {
    it("sends POST with JSON body and auth header", async () => {
      const spy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(Response.json({ id: 1 }));

      const result = await client.post<{ id: number }>("/items", {
        name: "test",
      });

      expect(result).toEqual({ id: 1 });
      expect(spy).toHaveBeenCalledWith("https://api.test/items", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer test-token",
        },
        body: JSON.stringify({ name: "test" }),
      });
    });

    it("throws with error message from response body", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        Response.json({ error: "not found" }, { status: 404 }),
      );

      await expect(client.post("/items", {})).rejects.toThrow("not found");
    });

    it("throws with status text when body has no error field", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response("", { status: 500, statusText: "Internal Server Error" }),
      );

      await expect(client.post("/items", {})).rejects.toThrow(
        "500 Internal Server Error",
      );
    });
  });

  describe("get", () => {
    it("sends GET with query params", async () => {
      const spy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(Response.json([]));

      await client.get("/items", { type: "audio", limit: "10" });

      expect(spy).toHaveBeenCalledWith(
        "https://api.test/items?type=audio&limit=10",
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("omits undefined query params", async () => {
      const spy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(Response.json([]));

      await client.get("/items", {
        type: "audio",
        sort: undefined as unknown as string,
      });

      const url = spy.mock.calls[0][0] as string;
      expect(url).toBe("https://api.test/items?type=audio");
    });

    it("sends GET without query string when no params", async () => {
      const spy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(Response.json({ ok: true }));

      await client.get("/health");

      expect(spy).toHaveBeenCalledWith(
        "https://api.test/health",
        expect.objectContaining({ method: "GET" }),
      );
    });
  });

  describe("postStream", () => {
    it("returns the raw Response for streaming", async () => {
      const mockResponse = new Response("stream data", { status: 200 });
      vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse);

      const res = await client.postStream("/stream", { prompt: "hello" });

      expect(res).toBe(mockResponse);
    });

    it("throws on non-ok response", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        Response.json({ error: "unauthorized" }, { status: 401 }),
      );

      await expect(
        client.postStream("/stream", { prompt: "hello" }),
      ).rejects.toThrow("unauthorized");
    });
  });

  describe("auth", () => {
    it("includes authorization header when session exists", async () => {
      const spy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(Response.json({}));

      await client.get("/test");

      const headers = (spy.mock.calls[0][1] as RequestInit).headers as Record<
        string,
        string
      >;
      expect(headers.authorization).toBe("Bearer test-token");
    });
  });
});
