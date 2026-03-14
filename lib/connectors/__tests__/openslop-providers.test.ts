import { describe, expect, it, vi, beforeEach } from "vitest";
import { OpenSlopLLM } from "../llm/openslop";
import { OpenSlopMusic } from "../music/openslop";
import { OpenSlopSFX } from "../sfx/openslop";
import { OpenSlopImage } from "../image/openslop";
import { OpenSlopTTS } from "../tts/openslop";
import { OpenSlopVideo } from "../video/openslop";

const config = { provider: "openslop", model: "test-model", apiKey: "test" };

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function binaryResponse(data: number[]) {
  return new Response(new Uint8Array(data).buffer, {
    status: 200,
    headers: { "content-type": "audio/mpeg" },
  });
}

describe("OpenSlop connectors (via providers)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("LLM: generate calls /api/v1/llm", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({
        text: "Hello",
        model: "test-model",
        usage: { inputTokens: 5, outputTokens: 3 },
      }),
    );

    const c = new OpenSlopLLM(config);
    const result = await c.generate({ prompt: "hello" });

    expect(result.text).toBe("Hello");
    expect(result.model).toBe("test-model");
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/llm",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("LLM: stream calls /api/v1/llm with stream=true", async () => {
    const sseData =
      'data: {"text":"Hi","done":false}\n\ndata: {"text":"","done":true}\n\n';
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(sseData, {
        status: 200,
        headers: { "content-type": "text/event-stream" },
      }),
    );

    const c = new OpenSlopLLM(config);
    const chunks: { text: string; done: boolean }[] = [];
    for await (const chunk of c.stream({ prompt: "hi" })) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual([
      { text: "Hi", done: false },
      { text: "", done: true },
    ]);
  });

  it("Music: generate returns ArrayBuffer", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(binaryResponse([1, 2, 3]));

    const c = new OpenSlopMusic(config);
    const result = await c.generate({ prompt: "jazz" });

    expect(result).toBeInstanceOf(ArrayBuffer);
    expect(new Uint8Array(result)).toEqual(new Uint8Array([1, 2, 3]));
  });

  it("SFX: generate returns ArrayBuffer", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(binaryResponse([4, 5]));

    const c = new OpenSlopSFX(config);
    const result = await c.generate({ prompt: "boom" });

    expect(result).toBeInstanceOf(ArrayBuffer);
  });

  it("Image: generate returns ImageResult", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({
        data: "base64img",
        format: "png",
        width: 512,
        height: 512,
      }),
    );

    const c = new OpenSlopImage(config);
    const result = await c.generate({ prompt: "mountain" });

    expect(result.data).toBe("base64img");
    expect(result.format).toBe("png");
  });

  it("TTS: generate returns TTSResult", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({
        data: "audio-base64",
        textTimestamps: [{ text: "hello", start: 0, end: 0.5 }],
      }),
    );

    const c = new OpenSlopTTS(config);
    const result = await c.generate({ prompt: "hello", voiceId: "v1" });

    expect(result.data).toBe("audio-base64");
    expect(result.textTimestamps).toHaveLength(1);
    expect(result.textTimestamps[0].text).toBe("hello");
  });

  it("TTS: searchVoices calls /api/v1/tts/voices", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ voices: [{ id: "v1", name: "Voice 1", language: "en" }] }),
    );

    const c = new OpenSlopTTS(config);
    const voices = await c.searchVoices({ query: "test" });

    expect(voices).toHaveLength(1);
    expect(voices[0].id).toBe("v1");
  });

  it("Video: generate submits and polls job", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        jsonResponse({ jobId: "j1", status: "processing" }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          jobId: "j1",
          status: "completed",
          resultUrl: "https://v.mp4",
        }),
      );

    const c = new OpenSlopVideo(config);
    const job = await c.generate({ prompt: "sunset" });

    expect(job.jobId).toBe("j1");
    expect(job.status).toBe("completed");
  });

  it("Video: poll returns job status", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({
        jobId: "j1",
        status: "completed",
        resultUrl: "https://v.mp4",
      }),
    );

    const c = new OpenSlopVideo(config);
    const polled = await c.poll("j1");

    expect(polled.status).toBe("completed");
    expect(polled.resultUrl).toBe("https://v.mp4");
  });
});
