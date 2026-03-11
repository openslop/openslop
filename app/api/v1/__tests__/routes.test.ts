import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockImageGenerate = vi.fn();
const mockVideoSubmit = vi.fn();
const mockVideoPoll = vi.fn();
const mockMusicGenerate = vi.fn();
const mockSFXGenerate = vi.fn();
const mockLLMGenerate = vi.fn();
const mockLLMStream = vi.fn();
const mockTTSGenerate = vi.fn();
const mockTTSSearch = vi.fn();

vi.mock("@/lib/api/providers", () => ({
  getImageProvider: () => ({ generate: mockImageGenerate }),
  getVideoProvider: () => ({ submit: mockVideoSubmit, poll: mockVideoPoll }),
  getMusicProvider: () => ({ generate: mockMusicGenerate }),
  getSFXProvider: () => ({ generate: mockSFXGenerate }),
  getLLMProvider: () => ({
    generate: mockLLMGenerate,
    stream: mockLLMStream,
  }),
  getTTSProvider: () => ({
    generate: mockTTSGenerate,
    search: mockTTSSearch,
  }),
}));

vi.mock("@/lib/api/logger", () => ({
  logger: { error: vi.fn() },
}));

function makeRequest(
  url: string,
  body?: Record<string, unknown>,
  method = "POST",
) {
  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

describe("API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/v1/image", () => {
    it("returns image result on success", async () => {
      const { POST } = await import("@/app/api/v1/image/route");
      mockImageGenerate.mockResolvedValue({
        data: "base64img",
        format: "png",
        width: 512,
        height: 512,
      });

      const res = await POST(makeRequest("/api/v1/image", { prompt: "cat" }));
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data).toBe("base64img");
    });

    it("returns 400 when prompt missing", async () => {
      const { POST } = await import("@/app/api/v1/image/route");
      const res = await POST(makeRequest("/api/v1/image", {}));
      expect(res.status).toBe(400);
    });

    it("returns 400 for invalid model", async () => {
      const { POST } = await import("@/app/api/v1/image/route");
      const res = await POST(
        makeRequest("/api/v1/image", { prompt: "cat", model: "bad-model" }),
      );
      expect(res.status).toBe(400);
      expect((await res.json()).error).toContain("Invalid model");
    });

    it("returns 500 on provider error", async () => {
      const { POST } = await import("@/app/api/v1/image/route");
      mockImageGenerate.mockRejectedValue(new Error("fail"));

      const res = await POST(makeRequest("/api/v1/image", { prompt: "cat" }));
      expect(res.status).toBe(500);
    });
  });

  describe("POST /api/v1/video", () => {
    it("submits video job", async () => {
      const { POST } = await import("@/app/api/v1/video/route");
      mockVideoSubmit.mockResolvedValue({
        jobId: "j1",
        status: "processing",
      });

      const res = await POST(
        makeRequest("/api/v1/video", { prompt: "sunset" }),
      );
      expect(res.status).toBe(200);
      expect((await res.json()).jobId).toBe("j1");
    });

    it("returns 400 for invalid referenceImage", async () => {
      const { POST } = await import("@/app/api/v1/video/route");
      const res = await POST(
        makeRequest("/api/v1/video", {
          prompt: "test",
          referenceImage: "not-a-data-uri",
        }),
      );
      expect(res.status).toBe(400);
      expect((await res.json()).error).toContain("data URI");
    });

    it("accepts valid referenceImage data URI", async () => {
      const { POST } = await import("@/app/api/v1/video/route");
      mockVideoSubmit.mockResolvedValue({ jobId: "j2", status: "processing" });

      const res = await POST(
        makeRequest("/api/v1/video", {
          prompt: "animate",
          referenceImage: "data:image/png;base64,iVBORw0KGgo",
        }),
      );
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/v1/video/[jobId]", () => {
    it("polls video job status", async () => {
      const { GET } = await import("@/app/api/v1/video/[jobId]/route");
      mockVideoPoll.mockResolvedValue({
        jobId: "j1",
        status: "completed",
        resultUrl: "https://v.mp4",
      });

      const req = makeRequest("/api/v1/video/j1", undefined, "GET");
      const res = await GET(req, { params: Promise.resolve({ jobId: "j1" }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.status).toBe("completed");
      expect(json.resultUrl).toBe("https://v.mp4");
    });

    it("returns 500 on poll error", async () => {
      const { GET } = await import("@/app/api/v1/video/[jobId]/route");
      mockVideoPoll.mockRejectedValue(new Error("not found"));

      const req = makeRequest("/api/v1/video/j1", undefined, "GET");
      const res = await GET(req, { params: Promise.resolve({ jobId: "j1" }) });
      expect(res.status).toBe(500);
    });
  });

  describe("POST /api/v1/music", () => {
    it("returns binary audio response", async () => {
      const { POST } = await import("@/app/api/v1/music/route");
      mockMusicGenerate.mockResolvedValue(new ArrayBuffer(4));

      const res = await POST(makeRequest("/api/v1/music", { prompt: "jazz" }));
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toBe("audio/mpeg");
      const buf = await res.arrayBuffer();
      expect(buf.byteLength).toBe(4);
    });

    it("returns 400 for missing prompt", async () => {
      const { POST } = await import("@/app/api/v1/music/route");
      const res = await POST(makeRequest("/api/v1/music", {}));
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/v1/sfx", () => {
    it("returns binary audio response", async () => {
      const { POST } = await import("@/app/api/v1/sfx/route");
      mockSFXGenerate.mockResolvedValue(new ArrayBuffer(3));

      const res = await POST(
        makeRequest("/api/v1/sfx", { prompt: "explosion" }),
      );
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toBe("audio/mpeg");
      const buf = await res.arrayBuffer();
      expect(buf.byteLength).toBe(3);
    });

    it("returns 400 for invalid model", async () => {
      const { POST } = await import("@/app/api/v1/sfx/route");
      const res = await POST(
        makeRequest("/api/v1/sfx", { prompt: "boom", model: "invalid" }),
      );
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/v1/llm", () => {
    it("returns generate result", async () => {
      const { POST } = await import("@/app/api/v1/llm/route");
      mockLLMGenerate.mockResolvedValue({
        text: "Hello",
        model: "claude-sonnet-4-5-20250929",
        usage: { inputTokens: 5, outputTokens: 3 },
      });

      const res = await POST(makeRequest("/api/v1/llm", { prompt: "hi" }));
      expect(res.status).toBe(200);
      expect((await res.json()).text).toBe("Hello");
    });

    it("returns SSE stream when stream=true", async () => {
      const { POST } = await import("@/app/api/v1/llm/route");
      mockLLMStream.mockReturnValue(
        (async function* () {
          yield { text: "Hi", done: false };
          yield { text: "", done: true };
        })(),
      );

      const res = await POST(
        makeRequest("/api/v1/llm", { prompt: "hi", stream: true }),
      );

      expect(res.headers.get("content-type")).toBe("text/event-stream");
      const text = await res.text();
      expect(text).toContain("data:");
      expect(text).toContain('"text":"Hi"');
    });

    it("returns 400 for missing prompt", async () => {
      const { POST } = await import("@/app/api/v1/llm/route");
      const res = await POST(makeRequest("/api/v1/llm", {}));
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/v1/tts", () => {
    it("generates tts with timestamps", async () => {
      const { POST } = await import("@/app/api/v1/tts/route");
      mockTTSGenerate.mockResolvedValue({
        data: "audio",
        textTimestamps: [{ text: "hi", start: 0, end: 0.5 }],
      });

      const res = await POST(
        makeRequest("/api/v1/tts", { prompt: "hi", voiceId: "v1" }),
      );
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.textTimestamps[0].text).toBe("hi");
    });

    it("returns 400 when voiceId missing", async () => {
      const { POST } = await import("@/app/api/v1/tts/route");
      const res = await POST(makeRequest("/api/v1/tts", { prompt: "hello" }));
      expect(res.status).toBe(400);
      expect((await res.json()).error).toContain("voiceId");
    });

    it("returns 400 when prompt missing", async () => {
      const { POST } = await import("@/app/api/v1/tts/route");
      const res = await POST(makeRequest("/api/v1/tts", { voiceId: "v1" }));
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/v1/tts/voices", () => {
    it("returns voices list", async () => {
      const { GET } = await import("@/app/api/v1/tts/voices/route");
      mockTTSSearch.mockResolvedValue([
        { id: "v1", name: "Voice 1", language: "en" },
      ]);

      const req = makeRequest(
        "/api/v1/tts/voices?query=english",
        undefined,
        "GET",
      );
      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.voices).toHaveLength(1);
      expect(json.voices[0].name).toBe("Voice 1");
    });

    it("returns 500 on error", async () => {
      const { GET } = await import("@/app/api/v1/tts/voices/route");
      mockTTSSearch.mockRejectedValue(new Error("api down"));

      const req = makeRequest("/api/v1/tts/voices", undefined, "GET");
      const res = await GET(req);
      expect(res.status).toBe(500);
    });
  });
});
