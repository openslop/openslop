import { describe, expect, it } from "vitest";
import { formatSSE, createSSEResponse, readSSE } from "../sse";

describe("formatSSE", () => {
  it("serializes data as a JSON SSE line", () => {
    expect(formatSSE({ type: "done", url: "/v.mp4" })).toBe(
      'data: {"type":"done","url":"/v.mp4"}\n\n',
    );
  });

  it("handles string data", () => {
    expect(formatSSE("hello")).toBe('data: "hello"\n\n');
  });

  it("handles numeric data", () => {
    expect(formatSSE(42)).toBe("data: 42\n\n");
  });

  it("handles null", () => {
    expect(formatSSE(null)).toBe("data: null\n\n");
  });
});

describe("createSSEResponse", () => {
  it("returns a Response with SSE headers", () => {
    const response = createSSEResponse(async () => {});
    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
    expect(response.headers.get("Cache-Control")).toBe("no-cache");
    expect(response.headers.get("Connection")).toBe("keep-alive");
  });

  it("has a readable body", () => {
    const response = createSSEResponse(async () => {});
    expect(response.body).toBeTruthy();
  });

  it("streams messages sent via the send callback", async () => {
    const response = createSSEResponse(async (send) => {
      await send({ phase: "bundling", progress: 0.5 });
      await send({ phase: "rendering", progress: 1.0 });
    });

    const reader = response.body?.getReader();
    if (!reader) throw new Error("expected readable body");

    const decoder = new TextDecoder();
    let text = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
    }

    expect(text).toContain('data: {"phase":"bundling","progress":0.5}\n\n');
    expect(text).toContain('data: {"phase":"rendering","progress":1}\n\n');
  });
});

describe("readSSE", () => {
  function makeStream(chunks: string[]): ReadableStream {
    const encoder = new TextEncoder();
    return new ReadableStream({
      start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      },
    });
  }

  it("parses complete SSE messages", async () => {
    const stream = makeStream([
      'data: {"type":"phase","progress":0.5}\n\n',
      'data: {"type":"done","url":"/v.mp4"}\n\n',
    ]);
    const messages: unknown[] = [];
    for await (const msg of readSSE(stream)) {
      messages.push(msg);
    }
    expect(messages).toEqual([
      { type: "phase", progress: 0.5 },
      { type: "done", url: "/v.mp4" },
    ]);
  });

  it("handles messages split across chunks", async () => {
    const stream = makeStream([
      'data: {"type":',
      '"phase","pr',
      'ogress":1}\n\ndata: {"type":"done"}\n\n',
    ]);
    const messages: unknown[] = [];
    for await (const msg of readSSE(stream)) {
      messages.push(msg);
    }
    expect(messages).toEqual([
      { type: "phase", progress: 1 },
      { type: "done" },
    ]);
  });

  it("skips malformed JSON", async () => {
    const stream = makeStream([
      "data: not-json\n\n",
      'data: {"valid":true}\n\n',
    ]);
    const messages: unknown[] = [];
    for await (const msg of readSSE(stream)) {
      messages.push(msg);
    }
    expect(messages).toEqual([{ valid: true }]);
  });

  it("skips event blocks that do not start with data:", async () => {
    const stream = makeStream(["event: update\n\n", 'data: {"ok":true}\n\n']);
    const messages: unknown[] = [];
    for await (const msg of readSSE(stream)) {
      messages.push(msg);
    }
    expect(messages).toEqual([{ ok: true }]);
  });

  it("returns nothing for an empty stream", async () => {
    const stream = makeStream([]);
    const messages: unknown[] = [];
    for await (const msg of readSSE(stream)) {
      messages.push(msg);
    }
    expect(messages).toEqual([]);
  });

  it("handles multiple messages in a single chunk", async () => {
    const stream = makeStream([
      'data: {"a":1}\n\ndata: {"b":2}\n\ndata: {"c":3}\n\n',
    ]);
    const messages: unknown[] = [];
    for await (const msg of readSSE(stream)) {
      messages.push(msg);
    }
    expect(messages).toEqual([{ a: 1 }, { b: 2 }, { c: 3 }]);
  });

  it("ignores trailing incomplete message without double newline", async () => {
    const stream = makeStream([
      'data: {"complete":true}\n\ndata: {"incomplete":true}',
    ]);
    const messages: unknown[] = [];
    for await (const msg of readSSE(stream)) {
      messages.push(msg);
    }
    expect(messages).toEqual([{ complete: true }]);
  });
});
