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
import { Disclosure, DisclosureJson } from "./Disclosure";
import { toolPresentation } from "./toolPresentation";

/** A turn with no duration to report reads as done rather than as still running. */
function thoughtLabel(seconds: number | null | undefined): string {
	if (seconds === undefined) return "Thought";
	return seconds === null ? "Thinking…" : `Thought for ${seconds}s`;
}

/** Left open: watching Sloppy think is the point of showing the thought at all. */
function Thought({
	text,
	seconds,
}: {
	text: string;
	seconds: number | null | undefined;
}) {
	return (
		<div className="flex flex-col gap-1">
			<p className="flex items-center gap-1.5 text-label-xs text-muted-foreground">
				<Sparkles className="h-3 w-3 shrink-0" aria-hidden="true" />
				<span className={seconds === null ? "shimmer" : undefined}>
					{thoughtLabel(seconds)}
				</span>
			</p>
			<p className="whitespace-pre-wrap break-words pl-4 text-label-xs text-muted-foreground">
				{text}
			</p>
		</div>
	);
}

/** The input is reference detail, so it stays behind a chevron. */
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
}: {
	part: AgentContentPart;
	thoughtSeconds: number | null | undefined;
}) {
	switch (part.type) {
		case "reasoning":
			return <Thought text={part.text} seconds={thoughtSeconds} />;
		case "tool-call":
			return <ToolCall toolName={part.toolName} input={part.input} />;
		case "tool-result":
			return <ToolOutcome output={part.output} />;
		default:
			return null;
	}
}

/** Counts up while a turn runs, so a slow one still looks alive. */
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
 * Everything a turn did, under one header. Open while the work runs and shut
 * once it lands: the live block and the stored one are separate mounts, so
 * finishing collapses it without overriding a reader who closed it early.
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
