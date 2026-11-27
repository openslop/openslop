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
import type { SloppyMessage, SloppyMetadata, SloppyTools } from "./types";

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

type StreamPartType = TextStreamPart<typeof SLOPPY_TOOLS>["type"];

const STEP_STARTS = new Set<StreamPartType>([
	"reasoning-start",
	"tool-input-start",
	"tool-call",
]);

/** Times run from saved start times, so they include the editor running calls between requests, as the reader saw it. */
export function turnClock(message: SloppyMessage, now: number) {
	const startedAt = message.metadata?.startedAt ?? now;
	const runs = [...(message.metadata?.stepSeconds ?? [])];
	let runStartedAt = message.metadata?.runStartedAt ?? null;
	// Before anything streams, the working status counts from the start of the turn.
	let replied = runs.length > 0;

	return {
		onPart(type: StreamPartType, at: number): SloppyMetadata | undefined {
			if (STEP_STARTS.has(type) && runStartedAt === null) {
				runStartedAt = replied ? at : startedAt;
				runs.push(0);
			}
			if (type !== "text-start" && type !== "finish") return;
			if (runStartedAt !== null)
				runs[runs.length - 1] = (at - runStartedAt) / 1000;
			if (type === "text-start") {
				runStartedAt = null;
				replied = true;
			}
			return {
				startedAt,
				runStartedAt,
				stepSeconds: [...runs],
				...(type === "finish" && {
					workSeconds: Math.round((at - startedAt) / 1000),
				}),
			};
		},
	};
}
