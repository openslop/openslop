"use client";

import type { ToolUIPart } from "ai";
import { Brain, Robot } from "@/components/ui/icon";
import {
	presentToolCall,
	type ToolPresentation,
} from "@/lib/agent/tools/registry";
import type { StepPart } from "@/lib/agent/step-runs";
import type { SloppyTools } from "@/lib/agent/types";

/** A stored transcript can hold a tool this build has renamed away, and it still has to render. */
export function toolPresentation(
	part: ToolUIPart<SloppyTools>,
): ToolPresentation {
	const name = part.type.replace(/^tool-/, "");
	return (
		presentToolCall(name, part.input) ?? {
			icon: Robot,
			label: name.replaceAll("_", " "),
		}
	);
}

const THINKING: ToolPresentation = { icon: Brain, label: "Thinking" };

export const stepPresentation = (step: StepPart): ToolPresentation =>
	step.type === "reasoning" ? THINKING : toolPresentation(step);
