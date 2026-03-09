import { describe, expect, it, vi } from "vitest";
import {
  runAfterGenerate,
  runBeforeGenerate,
  runOnError,
  runTransformPrompt,
} from "../plugins";
import type { ConnectorPlugin } from "../types";

describe("plugins", () => {
  it("runs beforeGenerate sequentially", async () => {
    const order: number[] = [];
    const plugins: ConnectorPlugin[] = [
      {
        name: "first",
        beforeGenerate: (p) => {
          order.push(1);
          return { ...(p as object), tag: "first" };
        },
      },
      {
        name: "second",
        beforeGenerate: (p) => {
          order.push(2);
          return { ...(p as object), tag: "second" };
        },
      },
    ];
    const result = await runBeforeGenerate(plugins, { prompt: "hi" });
    expect(order).toEqual([1, 2]);
    expect((result as Record<string, unknown>).tag).toBe("second");
  });

  it("runs afterGenerate sequentially", async () => {
    const plugins: ConnectorPlugin[] = [
      {
        name: "upper",
        afterGenerate: (r) => ({
          ...(r as object),
          text: ((r as Record<string, string>).text ?? "").toUpperCase(),
        }),
      },
    ];
    const result = await runAfterGenerate(plugins, { text: "hello" });
    expect((result as Record<string, string>).text).toBe("HELLO");
  });

  it("runs transformPrompt sequentially", async () => {
    const plugins: ConnectorPlugin[] = [
      { name: "prefix", transformPrompt: (p) => `[prefix] ${p}` },
      { name: "suffix", transformPrompt: (p) => `${p} [suffix]` },
    ];
    const result = await runTransformPrompt(plugins, "hello");
    expect(result).toBe("[prefix] hello [suffix]");
  });

  it("runs onError for all plugins", async () => {
    const errors: string[] = [];
    const plugins: ConnectorPlugin[] = [
      { name: "a", onError: (e) => void errors.push(`a:${e.message}`) },
      { name: "b", onError: (e) => void errors.push(`b:${e.message}`) },
    ];
    await runOnError(plugins, new Error("fail"));
    expect(errors).toEqual(["a:fail", "b:fail"]);
  });

  it("skips undefined hooks", async () => {
    const plugins: ConnectorPlugin[] = [{ name: "empty" }];
    const result = await runBeforeGenerate(plugins, { x: 1 });
    expect(result).toEqual({ x: 1 });
  });

  it("propagates errors from hooks", async () => {
    const plugins: ConnectorPlugin[] = [
      {
        name: "broken",
        beforeGenerate: () => {
          throw new Error("hook failed");
        },
      },
    ];
    await expect(runBeforeGenerate(plugins, {})).rejects.toThrow("hook failed");
  });
});
