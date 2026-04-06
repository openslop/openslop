import { describe, expect, it, vi, beforeEach } from "vitest";
import { OpenSlopClient } from "../openslop";

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

describe("OpenSlopClient", () => {
  let client: OpenSlopClient;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    client = new OpenSlopClient("https://api.test.com");
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  describe("post", () => {
    it("sends POST with auth header and JSON body", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ result: "ok" }),
      });

      const result = await client.post("/api/v1/image", { prompt: "a cat" });

      expect(result).toEqual({ result: "ok" });
      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.test.com/api/v1/image",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: "Bearer test-token",
          },
          body: JSON.stringify({ prompt: "a cat" }),
        },
      );
    });
  });

  describe("get", () => {
    it("sends GET with query params", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ voices: [] }),
      });

      await client.get("/api/v1/tts/voices", { gender: "female" });

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.test.com/api/v1/tts/voices?gender=female",
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("omits query string when no params given", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      });

      await client.get("/api/v1/tts/voices");

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.test.com/api/v1/tts/voices",
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("filters out undefined param values", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await client.get("/api/v1/tts/voices", {
        gender: "male",
        age: undefined as unknown as string,
      });

      const url = fetchMock.mock.calls[0][0] as string;
      expect(url).toContain("gender=male");
      expect(url).not.toContain("age");
    });
  });

  describe("postStream", () => {
    it("returns the raw response for streaming", async () => {
      const mockResponse = { ok: true, body: "stream" };
      fetchMock.mockResolvedValue(mockResponse);

      const result = await client.postStream("/api/v1/llm", { prompt: "hi" });
      expect(result).toBe(mockResponse);
    });
  });

  describe("error handling", () => {
    it("throws with error message from JSON response", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: () => Promise.resolve({ error: "prompt is required" }),
      });

      await expect(client.post("/api/v1/image", {})).rejects.toThrow(
        "prompt is required",
      );
    });

    it("falls back to status text when response is not JSON", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: () => Promise.reject(new Error("not json")),
      });

      await expect(client.post("/api/v1/image", {})).rejects.toThrow(
        "500 Internal Server Error",
      );
    });

    it("falls back to status text when JSON has no error field", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: () => Promise.resolve({ message: "no access" }),
      });

      await expect(client.post("/api/v1/image", {})).rejects.toThrow(
        "403 Forbidden",
      );
    });
  });

  describe("auth", () => {
    it("omits authorization header when no session", async () => {
      vi.resetModules();

      vi.doMock("@/lib/supabase/client", () => ({
        createClient: () => ({
          auth: {
            getSession: () => Promise.resolve({ data: { session: null } }),
          },
        }),
      }));

      const { OpenSlopClient: FreshClient } = await import("../openslop");
      const noAuthClient = new FreshClient("https://api.test.com");

      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await noAuthClient.post("/test", {});

      const headers = fetchMock.mock.calls[0][1].headers as Record<
        string,
        string
      >;
      expect(headers.authorization).toBeUndefined();
      expect(headers["content-type"]).toBe("application/json");
    });
  });
});
