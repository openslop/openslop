import { isTextUIPart } from "ai";
import compact from "lodash/compact";
import { plural } from "@/lib/format";
import type { StepPart } from "@/lib/agent/step-runs";
import type { SloppyMessage } from "@/lib/agent/types";
import { stepPresentation } from "./tool-presentation";

export const WAIT_FOR_SLOPPY = "Wait for Sloppy to finish";

/** A run is named for its latest call; a thought only names a run of thoughts. */
export const headline = (steps: StepPart[]): StepPart | undefined =>
	steps.findLast((step) => step.type !== "reasoning") ?? steps.at(-1);

export function stepsLabel(steps: StepPart[], seconds?: number): string {
	const latest = headline(steps);
	return compact([
		latest && stepPresentation(latest).label,
		`${steps.length} ${plural(steps.length, "step")}`,
		seconds !== undefined && `${Math.ceil(seconds)}s`,
		steps.some((step) => step.state === "output-error") && "failed",
	]).join(" · ");
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
