import {
	isReasoningUIPart,
	isStaticToolUIPart,
	isTextUIPart,
	type ReasoningUIPart,
	type TextStreamPart,
	type TextUIPart,
	type ToolUIPart,
} from "ai";
import type { SLOPPY_TOOLS } from "./tools/registry";
import type { SloppyMessage, SloppyTools } from "./types";

export type TurnPart = SloppyMessage["parts"][number];

export type StepPart = ReasoningUIPart | ToolUIPart<SloppyTools>;

const isStepPart = (part: TurnPart): part is StepPart =>
	isReasoningUIPart(part) || isStaticToolUIPart(part);

/** `run` indexes the run's time in `stepSeconds`. */
export type TurnBlock =
	| { kind: "reply"; part: TextUIPart }
	| { kind: "steps"; run: number; steps: StepPart[] };

export function turnBlocks(parts: TurnPart[]): TurnBlock[] {
	const blocks: TurnBlock[] = [];
	let run = 0;
	for (const part of parts) {
		const last = blocks.at(-1);
		if (isTextUIPart(part)) {
			blocks.push({ kind: "reply", part });
		} else if (isStepPart(part)) {
			if (last?.kind === "steps") last.steps.push(part);
			else {
				blocks.push({ kind: "steps", run, steps: [part] });
				run += 1;
			}
		}
	}
	return blocks;
}

const endsInSteps = (message: SloppyMessage): boolean => {
	const last = message.parts.findLast(
		(part) => isTextUIPart(part) || isStepPart(part),
	);
	return message.role === "assistant" && !!last && !isTextUIPart(last);
};

type StreamPartType = TextStreamPart<typeof SLOPPY_TOOLS>["type"];

const STEP_STARTS = new Set<StreamPartType>([
	"reasoning-start",
	"tool-input-start",
	"tool-call",
]);

/** A request that picks up after the editor ran a call is still inside that run, so it keeps timing it. */
export function stepClock(message: SloppyMessage, startedAt: number) {
	const runs = [...(message.metadata?.stepSeconds ?? [])];
	let open: { index: number; since: number } | null = endsInSteps(message)
		? { index: Math.max(runs.length - 1, 0), since: startedAt }
		: null;

	return {
		onPart(type: StreamPartType, now: number): number[] | undefined {
			if (STEP_STARTS.has(type)) {
				open ??= { index: runs.push(0) - 1, since: now };
				return;
			}
			if (type !== "text-start" && type !== "finish") return;
			if (open)
				runs[open.index] = (runs[open.index] ?? 0) + (now - open.since) / 1000;
			open = null;
			return [...runs];
		},
	};
}
