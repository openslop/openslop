import { describe, expect, it } from "vitest";
import { formatSSE, createSSEResponse, readSSE } from "../sse";

describe("formatSSE", () => {
  it("serializes data as SSE message", () => {
    expect(formatSSE({ type: "done" })).toBe('data: {"type":"done"}\n\n');
  });

  it("handles string data", () => {
    expect(formatSSE("hello")).toBe('data: "hello"\n\n');
  });

  it("handles null", () => {
    expect(formatSSE(null)).toBe("data: null\n\n");
  });
});

describe("createSSEResponse", () => {
  it("returns a Response with SSE headers", () => {
    const res = createSSEResponse(async () => {});
    expect(res.headers.get("Content-Type")).toBe("text/event-stream");
    expect(res.headers.get("Cache-Control")).toBe("no-cache");
    expect(res.headers.get("Connection")).toBe("keep-alive");
  });

  it("streams messages written by handler", async () => {
    const res = createSSEResponse(async (send) => {
      await send({ phase: "start" });
      await send({ phase: "end" });
    });

    const text = await res.text();
    expect(text).toContain('data: {"phase":"start"}');
    expect(text).toContain('data: {"phase":"end"}');
  });
});

describe("readSSE", () => {
  function toStream(chunks: string[]): ReadableStream {
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

  it("parses a single complete SSE message", async () => {
    const stream = toStream(['data: {"a":1}\n\n']);
    const results = [];
    for await (const msg of readSSE(stream)) {
      results.push(msg);
    }
    expect(results).toEqual([{ a: 1 }]);
  });

  it("parses multiple messages in one chunk", async () => {
    const stream = toStream(['data: {"a":1}\n\ndata: {"b":2}\n\n']);
    const results = [];
    for await (const msg of readSSE(stream)) {
      results.push(msg);
    }
    expect(results).toEqual([{ a: 1 }, { b: 2 }]);
  });

  it("handles messages split across chunks", async () => {
    const stream = toStream(['data: {"a":', '1}\n\ndata: {"b":2}\n\n']);
    const results = [];
    for await (const msg of readSSE(stream)) {
      results.push(msg);
    }
    expect(results).toEqual([{ a: 1 }, { b: 2 }]);
  });

  it("skips lines that do not start with data:", async () => {
    const stream = toStream(["event: update\n\ndata: {}\n\n"]);
    const results = [];
    for await (const msg of readSSE(stream)) {
      results.push(msg);
    }
    expect(results).toEqual([{}]);
  });

  it("skips malformed JSON", async () => {
    const stream = toStream(["data: {bad json}\n\ndata: {}\n\n"]);
    const results = [];
    for await (const msg of readSSE(stream)) {
      results.push(msg);
    }
    expect(results).toEqual([{}]);
  });

  it("handles empty stream", async () => {
    const stream = toStream([]);
    const results = [];
    for await (const msg of readSSE(stream)) {
      results.push(msg);
    }
    expect(results).toEqual([]);
  });

  it("handles trailing incomplete message", async () => {
    const stream = toStream(['data: {"a":1}\n\ndata: {"incomplete']);
    const results = [];
    for await (const msg of readSSE(stream)) {
      results.push(msg);
    }
    expect(results).toEqual([{ a: 1 }]);
  });
});
