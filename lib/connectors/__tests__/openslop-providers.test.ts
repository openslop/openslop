import { describe, expect, it } from "vitest";
import { OpenSlopLLM } from "../llm/openslop";
import { OpenSlopMusic } from "../music/openslop";
import { OpenSlopSFX } from "../sfx/openslop";
import { OpenSlopImage } from "../image/openslop";
import { OpenSlopTTS } from "../tts/openslop";
import { OpenSlopVideo } from "../video/openslop";

const config = { provider: "openslop", apiKey: "test" };

describe("OpenSlop providers integration", () => {
  it("LLM: full lifecycle", async () => {
    const c = new OpenSlopLLM(config);
    await c.init();
    expect(await c.validate()).toBe(true);
    const models = await c.listModels();
    expect(models).toHaveLength(1);
    expect(models[0].id).toBe("openslop-default");

    const result = await c.generate({ prompt: "hello" });
    expect(result.text).toContain("hello");
    expect(result.model).toBe("openslop-default");

    const chunks: string[] = [];
    for await (const chunk of c.stream({ prompt: "hi" })) {
      chunks.push(chunk.text);
      expect(chunk.done).toBe(true);
    }
    expect(chunks).toHaveLength(1);

    await c.destroy();
  });

  it("Music: full lifecycle", async () => {
    const c = new OpenSlopMusic(config);
    await c.init();
    expect(await c.validate()).toBe(true);
    expect(await c.listModels()).toHaveLength(1);
    const result = await c.generate({ prompt: "jazz" });
    expect(result.data).toBeInstanceOf(ArrayBuffer);
    expect(result.format).toBe("mp3");
    await c.destroy();
  });

  it("SFX: full lifecycle", async () => {
    const c = new OpenSlopSFX(config);
    await c.init();
    expect(await c.validate()).toBe(true);
    expect(await c.listModels()).toHaveLength(1);
    const result = await c.generate({ prompt: "boom" });
    expect(result.data).toBeInstanceOf(ArrayBuffer);
    await c.destroy();
  });

  it("Image: full lifecycle", async () => {
    const c = new OpenSlopImage(config);
    await c.init();
    expect(await c.validate()).toBe(true);
    expect(await c.listModels()).toHaveLength(1);
    const result = await c.generate({ prompt: "mountain" });
    expect(result.type).toBe("base64");
    expect(result.data).toBeTruthy();
    await c.destroy();
  });

  it("TTS: full lifecycle with voice search", async () => {
    const c = new OpenSlopTTS(config);
    await c.init();
    expect(await c.validate()).toBe(true);
    expect(await c.listModels()).toHaveLength(1);
    const result = await c.generate({ text: "hello", voiceId: "default" });
    expect(result.data).toBeInstanceOf(ArrayBuffer);

    const voices = await c.searchVoices({ query: "test" });
    expect(voices).toHaveLength(1);
    expect(voices[0].id).toBe("openslop-voice");
    await c.destroy();
  });

  it("Video: full lifecycle with poll", async () => {
    const c = new OpenSlopVideo(config);
    await c.init();
    expect(await c.validate()).toBe(true);
    expect(await c.listModels()).toHaveLength(1);
    const job = await c.generate({ prompt: "sunset" });
    expect(job.status).toBe("completed");

    const polled = await c.poll(job.jobId);
    expect(polled.status).toBe("completed");
    expect(polled.resultUrl).toBeTruthy();
    await c.destroy();
  });
});
