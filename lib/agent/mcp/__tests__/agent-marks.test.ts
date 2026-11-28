import { describe, expect, it } from "vitest";
import claude from "@/assets/agents/claude.svg";
import codex from "@/assets/agents/codex.svg";
import codexWhite from "@/assets/agents/codex-white.svg";
import mastracode from "@/assets/agents/mastracode.svg";
import openai from "@/assets/agents/openai.svg";
import opencode from "@/assets/agents/opencode.svg";
import pi from "@/assets/agents/pi.svg";
import vscode from "@/assets/agents/vscode.svg";
import { agentMark } from "../agent-marks";

describe("agentMark", () => {
	it.each([
		["Claude Code (openslop)", claude],
		["Codex", codex],
		["OpenCode", opencode],
		["Mastra Code", mastracode],
		["Visual Studio Code", vscode],
		["ChatGPT", openai],
		["Oh My Pi", pi],
	])("knows %s", (name, light) => {
		expect(agentMark(name)?.light).toBe(light);
	});

	it("pairs a dark logo only where one exists", () => {
		expect(agentMark("Codex")?.dark).toBe(codexWhite);
		expect(agentMark("Cursor")?.dark).toBeUndefined();
	});

	it("leaves unknown agents without a logo", () => {
		expect(agentMark("Example Agent")).toBeUndefined();
	});
});
