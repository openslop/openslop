import type {
  LLMGenerateParams,
  LLMGenerateResult,
} from "@/lib/connectors/types";
import { BaseProvider } from "../base";

const MOCK_SCRIPT = `<image animate="true" animation="slow pan across the village to the forest path" art_style="In the art style of a whimsical storybook illustration with soft watercolors, gentle brush strokes, and warm lighting.">A peaceful village at the edge of a lush green forest on a sunny morning. A cozy cottage with a red door sits near the forest path. Birds fly overhead. Flowers bloom along the dirt path leading into the woods.</image>

<music length="medium">Gentle, playful orchestral music with flutes and strings, lighthearted and cheerful</music>

<narrator gender="female" age="adult" pitch="medium" accent="american" texture="warm, grandmotherly, kind" emotion="cheerful">Once upon a time, in a village at the edge of a great forest, there lived a kind girl named Red.</narrator>

<image animate="true" animation="slow zoom in on Red at her cottage door" art_style="In the art style of a whimsical storybook illustration with soft watercolors, gentle brush strokes, and warm lighting.">Red (a cheerful girl with brown skin, dark curly hair in two puffs, brown eyes, wearing a bright red hooded cloak and a white dress) stands at her cottage door holding a wicker basket filled with fresh vegetables including carrots, lettuce, and tomatoes. She smiles warmly. Morning sunlight streams through nearby trees.</image>

<narrator gender="female" age="adult" pitch="medium" accent="american" texture="warm, grandmotherly, kind" emotion="happy">Red got her name from the beautiful red cloak she wore everywhere. Today, she was taking a basket of fresh vegetables to her grandmother, who lived deep in the woods.</narrator>

<sound type="ambient">birds chirping</sound>

<narrator gender="female" age="adult" pitch="medium" accent="american" texture="warm, grandmotherly, kind" emotion="content">Red skipped along the forest path, humming a cheerful tune.</narrator>

<sound type="transient">footsteps on dirt path</sound>

<image animate="true" animation="gentle pan through the berry bushes" art_style="In the art style of a whimsical storybook illustration with soft watercolors, gentle brush strokes, and warm lighting.">A different part of the forest with thick berry bushes full of ripe red berries. Wolf (a large gray wolf with kind amber eyes, soft fur, wearing a worn brown vest) carefully picks berries and places them in a wicker basket. Dappled sunlight filters through the forest canopy above.</image>

<narrator gender="female" age="adult" pitch="medium" accent="american" texture="warm, grandmotherly, kind" emotion="mysterious">Not far away, someone else was in the forest that morning. Wolf was gathering wild berries near the path.</narrator>

<sound type="ambient">rustling leaves</sound>

<narrator gender="female" age="adult" pitch="medium" accent="american" texture="warm, grandmotherly, kind" emotion="sympathetic">Now, Wolf looked scary with his big teeth and sharp claws, but he had a secret. He didn't eat meat at all! He was a vegetarian who loved berries, nuts, and vegetables.</narrator>

<character name="Wolf" gender="male" age="adult" pitch="low" accent="american" texture="gentle, soft-spoken, kind" emotion="content">"These berries will make Mother feel so much better. She loves berry soup."</character>

<narrator gender="female" age="adult" pitch="medium" accent="american" texture="warm, grandmotherly, kind" emotion="calm">Wolf's mother had a terrible cold, and he wanted to bring her something special.</narrator>

<image animate="true" animation="slow motion as the collision happens" art_style="In the art style of a whimsical storybook illustration with soft watercolors, gentle brush strokes, and warm lighting.">The forest path where it curves sharply. Red (a cheerful girl with brown skin, dark curly hair in two puffs, brown eyes, wearing a bright red hooded cloak and a white dress) comes around the bend from one direction carrying her vegetable basket. Wolf (a large gray wolf with kind amber eyes, soft fur, wearing a worn brown vest) comes from the other direction with his berry basket. They're about to collide. Surprised expressions on both faces. Sunlight streams between the trees.</image>

<music length="short">Sudden comedic percussion, playful and surprising</music>

<narrator gender="female" age="adult" pitch="medium" accent="accent="american" texture="warm, grandmotherly, kind" emotion="alarmed">Just then, Red came around a sharp bend in the path, and... CRASH!</narrator>

<sound type="transient">collision thump</sound>

<narrator gender="female" age="adult" pitch="medium" accent="american" texture="warm, grandmotherly, kind" emotion="surprised">She bumped right into Wolf!</narrator>

<character name="Red" gender="female" age="child" pitch="high" accent="american" texture="sweet, bright, youthful" emotion="scared">"Oh no!"</character>

<character name="Wolf" gender="male" age="adult" pitch="low" accent="american" texture="gentle, soft-spoken, kind" emotion="panicked">"Watch out!"</character>

<image animate="true" animation="baskets spinning in the air, slow zoom out" art_style="In the art style of a whimsical storybook illustration with soft watercolors, gentle brush strokes, and warm lighting.">Two wicker baskets flying through the air above the forest path. Vegetables (carrots, lettuce, tomatoes) and red berries scatter and tumble through the air. Red (a cheerful girl with brown skin, dark curly hair in two puffs, brown eyes, wearing a bright red hooded cloak and a white dress) and Wolf (a large gray wolf with kind amber eyes, soft fur, wearing a worn brown vest) have fallen on opposite sides of the path with startled expressions. Forest surroundings with dappled sunlight.</image>

<sound type="transient">items scattering and falling</sound>

<narrator gender="female" age="adult" pitch="medium" accent="american" texture="warm, grandmotherly, kind" emotion="anxious">Their baskets flew into the air! Vegetables and berries scattered everywhere across the path.</narrator>

<narrator gender="female" age="adult" pitch="medium" accent="american" texture="warm, grandmotherly, kind" emotion="concerned">Red and Wolf scrambled to pick everything up, both in a terrible hurry.</narrator>

<sound type="ambient">hurried movements</sound>

<character name="Red" gender="female" age="child" pitch="high" accent="american" texture="sweet, bright, youthful" emotion="anxious">"I'm so sorry! I need to get to Grandma's quickly!"</character>

<character name="Wolf" gender="male" age="adult" pitch="low" accent="american" texture="gentle, soft-spoken, kind" emotion="frustrated">"No, no, it's my fault! I must get home to my mother!"</character>

<image animate="true" animation="zoom in on the two baskets side by side" art_style="In the art style of a whimsical storybook illustration with soft watercolors, gentle brush strokes, and warm lighting.">Two identical wicker baskets sitting side by side on the forest path. Both are now filled with a mix of vegetables and berries jumbled together. Red (a cheerful girl with brown skin, dark curly hair in two puffs, brown eyes, wearing a bright red hooded cloak and a white dress) reaches for one basket while Wolf (a large gray wolf with kind amber eyes, soft fur, wearing a worn brown vest) reaches for the other. Forest path with scattered leaves around them.</image>

<narrator gender="female" age="adult" pitch="medium" accent="american" texture="warm, grandmotherly, kind" emotion="neutral">In their rush, each grabbed a basket and hurried off in opposite directions.</narrator>
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
    await delay(2000);
    const words = MOCK_SCRIPT.split(/(?<=\s)/);
    for (const word of words) {
      await delay(80);
      yield { text: word, done: false };
    }
    yield { text: "", done: true };
  }
}
