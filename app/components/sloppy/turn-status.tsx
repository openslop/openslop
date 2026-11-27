"use client";

import { useState } from "react";
import { Disclosure } from "@/components/ui/disclosure";
import { Sparkles } from "@/components/ui/icon";
import type { StepPart } from "@/lib/agent/step-runs";
import { useElapsedSeconds } from "@/lib/components/use-elapsed-seconds";
import OrbLoader from "../orb-loader";
import { Reasoning } from "./reasoning";
import { Tool } from "./tool";
import { stepPresentation } from "./tool-presentation";
import { namingStep, reasoningOpen, runLabel } from "./turn-display";

function StepList({ steps, live }: { steps: StepPart[]; live: boolean }) {
	return (
		<div className="flex flex-col gap-2">
			{steps.map((step, index) =>
				step.type === "reasoning" ? (
					<Reasoning
						key={index}
						text={step.text}
						streaming={live && step.state === "streaming"}
						open={reasoningOpen(live, index < steps.length - 1, step.text)}
					/>
				) : (
					<Tool key={index} part={step} />
				),
			)}
		</div>
	);
}

function StepName({ step }: { step: StepPart | undefined }) {
	const { icon: Icon, label } = step
		? stepPresentation(step)
		: { icon: undefined, label: "Slopping" };
	return (
		<span className="flex items-center gap-1.5">
			{Icon && <Icon className="h-3 w-3" />}
			<span className="shimmer">{`${label}…`}</span>
		</span>
	);
}

/** Each new step folds the last one up out of view and rises into its place. */
function LiveLabel({ steps }: { steps: StepPart[] }) {
	const [startedAt] = useState(Date.now);
	const elapsed = useElapsedSeconds(startedAt);
	const [fold, setFold] = useState({
		current: steps.length,
		leaving: null as number | null,
	});
	if (fold.current !== steps.length) {
		setFold({ current: steps.length, leaving: fold.current });
	}

	return (
		<span className="flex items-center gap-1.5">
			<span className="fold-stack">
				{fold.leaving !== null && (
					<span
						key={fold.leaving}
						className="fold-out"
						aria-hidden="true"
						onAnimationEnd={() =>
							setFold((current) => ({ ...current, leaving: null }))
						}
					>
						<StepName step={steps[fold.leaving - 1]} />
					</span>
				)}
				<span
					key={steps.length}
					className={fold.leaving === null ? undefined : "fold-in"}
				>
					<StepName step={steps.at(-1)} />
				</span>
			</span>
			<span className="shimmer">{`· ${elapsed}s`}</span>
		</span>
	);
}

/** The working status while Sloppy is on the run, then its summary in the same place. */
export function StepRun({
	steps,
	live,
	seconds,
}: {
	steps: StepPart[];
	live: boolean;
	seconds?: number;
}) {
	const latest = namingStep(steps);
	const face = latest && stepPresentation(latest);
	return (
		<Disclosure
			marker={live ? <OrbLoader /> : undefined}
			icon={!live && face && <face.icon className="h-3 w-3" />}
			disabled={!latest}
			label={live ? <LiveLabel steps={steps} /> : runLabel(steps, seconds)}
		>
			<StepList steps={steps} live={live} />
		</Disclosure>
	);
}

export function WorkedStatus({ seconds }: { seconds: number | undefined }) {
	return (
		<div className="flex items-center gap-1.5 self-start px-1 py-0.5 text-label-xs text-muted-foreground">
			<Sparkles className="h-3 w-3" />
			<span>{seconds === undefined ? "Worked" : `Worked for ${seconds}s`}</span>
		</div>
	);
}
