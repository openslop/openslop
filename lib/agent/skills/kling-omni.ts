import { dedent } from "@/lib/dedent";
import { nameRef } from "@/lib/connectors/name-refs";
import type { Skill } from "./registry";

// Based on https://kling.ai/quickstart/klingai-video-3-omni-model-user-guide, https://kling.ai/blog/kling-ai-prompt-guide, https://kling.ai/blog/kling-video-3-omni-reference-workflows-multi-element and, for 4 Omni, https://kling.ai/blog/hitting-redline-make-cinematic-racing-kling4
export const klingOmni = {
	name: "kling-omni",
	description:
		"How Kling Omni video models (3 Omni, 3 Omni Pro, 4 Omni) read a <video> prompt: camera words, light, motion and speech. Load it when read_model_attributes names it.",
	content: dedent`
		Kling Omni films several shots in one clip and speaks the dialogue itself. Write the prompt as video-prompts says, with these additions:

		- Cover all six of Kling's elements in every shot: subject, action, scene, camera, lighting and mood.
		- Name the camera the way a viewer would see it: close-up, medium close-up, wide shot, establishing wide shot, low angle, slow push-in, pan, tilt, tracking shot, dolly-in, handheld. Say how fast: slow, steady or quick. Join shots with "Cut to" and film a conversation as shot-reverse-shot.
		- Describe only what moves on screen, like "smoke drifting upward" or "fabric pulled by the wind", never effects or mood words like "magic". Break a jump or fall into stages: takeoff, the arc of the body, landing.
		- Name the light sources and the surfaces they hit, like "neon signs reflecting on wet asphalt", not just "cinematic night".
		- Give a character an emotional beat: what they feel, what sets it off, and how it shows.
		- Keep the speaker's name, delivery and line together, as in ${nameRef("Mia")} (quietly, with a small smile): "line", and keep the face of whoever speaks in frame. Kling 3 Omni speaks Chinese, English, Japanese, Korean and Spanish, and can mix them in one scene.
		- Each character's voice comes with their picture, so never describe how a voice sounds.
		- For on-screen text, keep it short and give the exact words, where they sit, on what surface, and how close the camera is.
		- Keep writing ${nameRef("Name")}. OpenSlop turns each into Kling's own reference, so never write @Image, @Element or similar tags yourself.

		Kling 4 Omni: plan shot by shot, not the whole film in one sweep. Give each shot its camera angle, its movement, its subject and the effect it's going for. It handles fast action well: tracking, orbiting and close-ups inside moving scenes.
	`,
} as const satisfies Skill;
