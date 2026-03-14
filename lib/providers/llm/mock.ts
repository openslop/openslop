import type {
  LLMGenerateParams,
  LLMGenerateResult,
} from "@/lib/connectors/types";
import { BaseProvider } from "../base";

const MOCK_SCRIPT = `<image animate="true" animation="slow pan across the village to the forest path" art_style="In the art style of a whimsical storybook illustration with soft watercolors, gentle brush strokes, and warm lighting.">A peaceful village at the edge of a lush green forest on a sunny morning. A cozy cottage with a red door sits near the forest path. Birds fly overhead. Flowers bloom along the dirt path leading into the woods.</image>

<music length="medium">Gentle, playful orchestral music with flutes and strings, lighthearted and cheerful</music>

<narration gender="female" age="adult" pitch="medium" accent="american" texture="warm, grandmotherly, kind" emotion="cheerful">Once upon a time, in a village at the edge of a great forest, there lived a kind girl named Red.</narration>

<image animate="true" animation="slow zoom in on Red at her cottage door" art_style="In the art style of a whimsical storybook illustration with soft watercolors, gentle brush strokes, and warm lighting.">Red (a cheerful girl with brown skin, dark curly hair in two puffs, brown eyes, wearing a bright red hooded cloak and a white dress) stands at her cottage door holding a wicker basket filled with fresh vegetables including carrots, lettuce, and tomatoes. She smiles warmly. Morning sunlight streams through nearby trees.</image>

<narration gender="female" age="adult" pitch="medium" accent="american" texture="warm, grandmotherly, kind" emotion="happy">Red got her name from the beautiful red cloak she wore everywhere. Today, she was taking a basket of fresh vegetables to her grandmother, who lived deep in the woods.</narration>

<sound type="ambient">birds chirping</sound>

<narration gender="female" age="adult" pitch="medium" accent="american" texture="warm, grandmotherly, kind" emotion="content">Red skipped along the forest path, humming a cheerful tune.</narration>

<sound type="transient">footsteps on dirt path</sound>

<image animate="true" animation="gentle pan through the berry bushes" art_style="In the art style of a whimsical storybook illustration with soft watercolors, gentle brush strokes, and warm lighting.">A different part of the forest with thick berry bushes full of ripe red berries. Wolf (a large gray wolf with kind amber eyes, soft fur, wearing a worn brown vest) carefully picks berries and places them in a wicker basket. Dappled sunlight filters through the forest canopy above.</image>

<narration gender="female" age="adult" pitch="medium" accent="american" texture="warm, grandmotherly, kind" emotion="mysterious">Not far away, someone else was in the forest that morning. Wolf was gathering wild berries near the path.</narration>

<sound type="ambient">rustling leaves</sound>

<narration gender="female" age="adult" pitch="medium" accent="american" texture="warm, grandmotherly, kind" emotion="sympathetic">Now, Wolf looked scary with his big teeth and sharp claws, but he had a secret. He didn't eat meat at all! He was a vegetarian who loved berries, nuts, and vegetables.</narration>

<character name="Wolf" gender="male" age="adult" pitch="low" accent="american" texture="gentle, soft-spoken, kind" emotion="content">"These berries will make Mother feel so much better. She loves berry soup."</character>

<narration gender="female" age="adult" pitch="medium" accent="american" texture="warm, grandmotherly, kind" emotion="calm">Wolf's mother had a terrible cold, and he wanted to bring her something special.</narration>
`;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockLLM extends BaseProvider<
  LLMGenerateParams,
  LLMGenerateResult
> {
  async generate(): Promise<LLMGenerateResult> {
    return {
      text: MOCK_SCRIPT,
      model: "mock",
      usage: { inputTokens: 0, outputTokens: 0 },
    };
  }

  async *stream(): AsyncGenerator<{ text: string; done: boolean }> {
    await delay(1000);
    const words = MOCK_SCRIPT.split(/(?<=\s)/);
    for (const word of words) {
      await delay(50);
      yield { text: word, done: false };
    }
    yield { text: "", done: true };
  }
}
