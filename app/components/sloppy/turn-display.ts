import { isTextUIPart } from "ai";
import compact from "lodash/compact";
import { plural } from "@/lib/format";
import type { StepPart } from "@/lib/agent/step-runs";
import type { SloppyMessage, SloppyMetadata } from "@/lib/agent/types";
import { stepPresentation } from "./tool-presentation";

export const WAIT_FOR_SLOPPY = "Wait for Sloppy to finish";

/** A run is named for its latest call; a thought only names a run of thoughts. */
export const namingStep = (steps: StepPart[]): StepPart | undefined =>
	steps.findLast((step) => step.type !== "reasoning") ?? steps.at(-1);

export function runLabel(steps: StepPart[], seconds?: number): string {
	const latest = namingStep(steps);
	return compact([
		latest && stepPresentation(latest).label,
		`${steps.length} ${plural(steps.length, "step")}`,
		seconds !== undefined && `${Math.ceil(seconds)}s`,
		steps.some((step) => step.state === "output-error") && "failed",
	]).join(" · ");
}

/** A run that opens the turn counts from the turn's start, as its working status did; a run cut off ends with the turn. */
export function runSeconds(
	metadata: SloppyMetadata | undefined,
	index: number,
	opensTurn: boolean,
): number | undefined {
	const run = metadata?.runs?.[index];
	const end = run?.endedAt ?? metadata?.endedAt;
	if (metadata?.startedAt === undefined || !run || end === undefined)
		return undefined;
	return (end - (opensTurn ? metadata.startedAt : run.startedAt)) / 1000;
}

export function workedSeconds(
	metadata: SloppyMetadata | undefined,
): number | undefined {
	if (metadata?.startedAt === undefined || metadata.endedAt === undefined)
		return undefined;
	return (metadata.endedAt - metadata.startedAt) / 1000;
}

export function userText(message: SloppyMessage): string {
	return message.parts
		.filter(isTextUIPart)
		.map((part) => part.text)
		.join("\n");
}

const LONG_REASONING = 600;

/** Opening is a live-streaming affordance, so a restored thought stays shut whatever state it was stored in. */
export function reasoningOpen(
	live: boolean,
	superseded: boolean,
	text: string,
): boolean {
	return live && !superseded && text.length <= LONG_REASONING;
}
