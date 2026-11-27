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

/** A run is the steps between two replies; `index` finds its times in the turn's `runs`. */
export type TurnBlock =
	| { kind: "reply"; part: TextUIPart }
	| { kind: "run"; index: number; steps: StepPart[] };

export function turnBlocks(parts: TurnPart[]): TurnBlock[] {
	const blocks: TurnBlock[] = [];
	let index = 0;
	for (const part of parts) {
		const last = blocks.at(-1);
		if (isTextUIPart(part)) {
			blocks.push({ kind: "reply", part });
		} else if (isStepPart(part)) {
			if (last?.kind === "run") last.steps.push(part);
			else {
				blocks.push({ kind: "run", index, steps: [part] });
				index += 1;
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

/** Stamps when the turn and each run start and end; the client works out the durations. */
export function turnTimer(message: SloppyMessage, now: number) {
	const startedAt = message.metadata?.startedAt ?? now;
	let runs = message.metadata?.runs ?? [];

	return {
		onPart(type: StreamPartType, at: number): SloppyMetadata | undefined {
			const last = runs.at(-1);
			const open = last !== undefined && last.endedAt === undefined;
			if (STEP_STARTS.has(type) && !open) runs = [...runs, { startedAt: at }];
			else if (type === "text-start" && open)
				runs = runs.with(-1, { ...last, endedAt: at });
			else if (type !== "finish") return;
			return {
				startedAt,
				runs,
				...(type === "finish" && { endedAt: at }),
			};
		},
	};
}
