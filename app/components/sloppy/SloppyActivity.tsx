"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { ToolResultPart } from "ai";
import { AlertCircle, CornerDownRight, Sparkles } from "@/components/ui/icon";
import {
	isToolFailure,
	toolResultText,
	type AgentContentPart,
} from "@/lib/agent/types";
import OrbLoader from "../OrbLoader";
import { Disclosure, DisclosureJson, DisclosureText } from "./Disclosure";
import { toolPresentation } from "./toolPresentation";
import { thoughtOpen } from "./turnDisplay";

/** No duration to report reads as done, not as still running. */
function thoughtLabel(seconds: number | null | undefined): string {
	if (seconds === undefined) return "Thought";
	return seconds === null ? "Thinking…" : `Thought for ${seconds}s`;
}

function Thought({
	text,
	seconds,
	superseded,
}: {
	text: string;
	seconds: number | null | undefined;
	superseded: boolean;
}) {
	const open = thoughtOpen(superseded, text);
	return (
		<Disclosure
			// Keyed on the auto state so a thought that streams in open shuts itself
			// once Sloppy moves on, while a reader's own toggle still sticks.
			key={String(open)}
			defaultOpen={open}
			icon={<Sparkles className="h-3 w-3 shrink-0" aria-hidden="true" />}
			label={thoughtLabel(seconds)}
			pending={seconds === null}
		>
			<DisclosureText>{text}</DisclosureText>
		</Disclosure>
	);
}

function ToolCall({ toolName, input }: { toolName: string; input: unknown }) {
	const { icon: Icon, summarize } = toolPresentation(toolName);
	return (
		<Disclosure
			icon={<Icon className="h-3 w-3 shrink-0" aria-hidden="true" />}
			label={summarize(input)}
		>
			<DisclosureJson value={input} />
		</Disclosure>
	);
}

function ToolOutcome({ output }: { output: ToolResultPart["output"] }) {
	const failed = isToolFailure(output);
	const Icon = failed ? AlertCircle : CornerDownRight;
	return (
		<p
			className={`flex items-start gap-1.5 pl-4 text-label-xs ${
				failed ? "text-destructive" : "text-muted-foreground"
			}`}
		>
			<Icon className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
			<span>{toolResultText(output)}</span>
		</p>
	);
}

export function WorkPart({
	part,
	thoughtSeconds,
	superseded,
}: {
	part: AgentContentPart;
	thoughtSeconds: number | null | undefined;
	superseded: boolean;
}) {
	switch (part.type) {
		case "reasoning":
			return (
				<Thought
					text={part.text}
					seconds={thoughtSeconds}
					superseded={superseded}
				/>
			);
		case "tool-call":
			return <ToolCall toolName={part.toolName} input={part.input} />;
		case "tool-result":
			return <ToolOutcome output={part.output} />;
		default:
			return null;
	}
}

function useElapsed(running: boolean): number {
	const [seconds, setSeconds] = useState(0);

	useEffect(() => {
		if (!running) return;
		const id = setInterval(() => setSeconds((prev) => prev + 1), 1000);
		return () => clearInterval(id);
	}, [running]);

	return seconds;
}

function workLabel(seconds: number | undefined): string {
	return seconds === undefined ? "Worked" : `Worked for ${seconds}s`;
}

/**
 * The live block and the stored one are separate mounts, so finishing a turn
 * collapses it without overriding a reader who closed it early.
 */
export function ActivityBlock({
	streaming,
	status,
	seconds,
	children,
}: {
	streaming: boolean;
	status: string;
	seconds: number | undefined;
	children: ReactNode;
}) {
	const elapsed = useElapsed(streaming);

	return (
		<Disclosure
			defaultOpen={streaming}
			pending={streaming}
			icon={
				streaming ? (
					<OrbLoader />
				) : (
					<Sparkles className="h-3 w-3 shrink-0" aria-hidden="true" />
				)
			}
			label={streaming ? `${status} · ${elapsed}s` : workLabel(seconds)}
		>
			<div className="flex flex-col gap-2">{children}</div>
		</Disclosure>
	);
}
