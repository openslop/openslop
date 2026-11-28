import type { StaticImageData } from "next/image";
import amp from "@/assets/agents/amp.svg";
import antigravity from "@/assets/agents/antigravity.svg";
import claude from "@/assets/agents/claude.svg";
import codex from "@/assets/agents/codex.svg";
import codexWhite from "@/assets/agents/codex-white.svg";
import copilot from "@/assets/agents/copilot.svg";
import copilotWhite from "@/assets/agents/copilot-white.svg";
import cursor from "@/assets/agents/cursor.svg";
import devin from "@/assets/agents/devin.svg";
import devinWhite from "@/assets/agents/devin-white.svg";
import droid from "@/assets/agents/droid.svg";
import droidWhite from "@/assets/agents/droid-white.svg";
import fx from "@/assets/agents/fx.svg";
import fxWhite from "@/assets/agents/fx-white.svg";
import gemini from "@/assets/agents/gemini.svg";
import grok from "@/assets/agents/grok.svg";
import grokWhite from "@/assets/agents/grok-white.svg";
import hermes from "@/assets/agents/hermes.svg";
import hermesWhite from "@/assets/agents/hermes-white.svg";
import kimi from "@/assets/agents/kimi.svg";
import kimiWhite from "@/assets/agents/kimi-white.svg";
import kiro from "@/assets/agents/kiro.svg";
import mastracode from "@/assets/agents/mastracode.svg";
import mastracodeWhite from "@/assets/agents/mastracode-white.svg";
import muse from "@/assets/agents/muse.svg";
import museWhite from "@/assets/agents/muse-white.svg";
import openai from "@/assets/agents/openai.svg";
import openaiWhite from "@/assets/agents/openai-white.svg";
import opencode from "@/assets/agents/opencode.svg";
import opencodeWhite from "@/assets/agents/opencode-white.svg";
import pi from "@/assets/agents/pi.svg";
import piWhite from "@/assets/agents/pi-white.svg";
import vibe from "@/assets/agents/vibe.svg";
import vscode from "@/assets/agents/vscode.svg";
import windsurf from "@/assets/agents/windsurf.svg";
import windsurfWhite from "@/assets/agents/windsurf-white.svg";
import zed from "@/assets/agents/zed.svg";
import zedWhite from "@/assets/agents/zed-white.svg";

/** An agent's logo, with its own file for dark mode when the light one would vanish there. */
export type AgentMark = { light: StaticImageData; dark?: StaticImageData };

/** First match wins, so names that contain another agent's word come first. */
const AGENT_MARKS: [RegExp, AgentMark][] = [
	[/codex/i, { light: codex, dark: codexWhite }],
	[/opencode/i, { light: opencode, dark: opencodeWhite }],
	[/mastra/i, { light: mastracode, dark: mastracodeWhite }],
	[/copilot/i, { light: copilot, dark: copilotWhite }],
	[/antigravity/i, { light: antigravity }],
	[/claude/i, { light: claude }],
	[/cursor/i, { light: cursor }],
	[/chatgpt|openai/i, { light: openai, dark: openaiWhite }],
	[/gemini/i, { light: gemini }],
	[/visual studio code|vs ?code/i, { light: vscode }],
	[/windsurf/i, { light: windsurf, dark: windsurfWhite }],
	[/\bzed\b/i, { light: zed, dark: zedWhite }],
	[/\bamp\b/i, { light: amp }],
	[/devin/i, { light: devin, dark: devinWhite }],
	[/droid|factory/i, { light: droid, dark: droidWhite }],
	[/\bfx\b/i, { light: fx, dark: fxWhite }],
	[/grok/i, { light: grok, dark: grokWhite }],
	[/hermes/i, { light: hermes, dark: hermesWhite }],
	[/kimi/i, { light: kimi, dark: kimiWhite }],
	[/kiro/i, { light: kiro }],
	[/muse/i, { light: muse, dark: museWhite }],
	[/vibe|mistral/i, { light: vibe }],
	[/\bpi\b/i, { light: pi, dark: piWhite }],
];

/** The logo for an agent from the name it signed in with, if we know it. */
export const agentMark = (name: string): AgentMark | undefined =>
	AGENT_MARKS.find(([pattern]) => pattern.test(name))?.[1];
