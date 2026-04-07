import { describe, expect, it } from "vitest";
import { streamToBuffer } from "../stream";

function makeStream(chunks: Uint8Array[]): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk);
      controller.close();
    },
  });
}

describe("streamToBuffer", () => {
  it("concatenates multiple chunks into a single ArrayBuffer", async () => {
    const a = new Uint8Array([1, 2, 3]);
    const b = new Uint8Array([4, 5]);
    const result = await streamToBuffer(makeStream([a, b]));

    expect(new Uint8Array(result)).toEqual(new Uint8Array([1, 2, 3, 4, 5]));
  });

  it("returns an empty buffer for an empty stream", async () => {
    const result = await streamToBuffer(makeStream([]));
    expect(result.byteLength).toBe(0);
  });

  it("handles a single chunk", async () => {
    const chunk = new Uint8Array([10, 20, 30]);
    const result = await streamToBuffer(makeStream([chunk]));

    expect(new Uint8Array(result)).toEqual(chunk);
  });

  it("handles large payloads across many chunks", async () => {
    const chunks = Array.from(
      { length: 100 },
      (_, i) => new Uint8Array(Array.from({ length: 100 }, () => i % 256)),
    );
    const result = await streamToBuffer(makeStream(chunks));

    expect(result.byteLength).toBe(10_000);
    const view = new Uint8Array(result);
    expect(view[0]).toBe(0);
    expect(view[100]).toBe(1);
    expect(view[9900]).toBe(99);
  });
});
