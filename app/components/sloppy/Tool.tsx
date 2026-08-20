"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ToolUIPart } from "ai";
import { cn } from "@/lib/utils";
import {
	Disclosure,
	DisclosureJson,
	DisclosureText,
} from "@/components/ui/disclosure";
import type { SloppyTools } from "@/lib/agent/types";
import { toolPresentation } from "./toolPresentation";

function Outcome({ failed = false, text }: { failed?: boolean; text: string }) {
	const [expanded, setExpanded] = useState(false);
	const [clipped, setClipped] = useState(false);
	const bodyId = useId();
	const bodyRef = useRef<HTMLParagraphElement>(null);

	useEffect(() => {
		const body = bodyRef.current;
		if (body) setClipped(body.scrollHeight > body.clientHeight);
	}, [text]);

	const clips = clipped || expanded;

	return (
		<div
			className={cn(
				"ml-2.5 flex min-w-0 flex-col items-start gap-0.5 border-l pl-3 text-label-xs",
				failed
					? "border-destructive/40 text-destructive"
					: "border-border text-muted-foreground/70",
			)}
		>
			<p
				ref={bodyRef}
				id={bodyId}
				className={cn("wrap-anywhere", !expanded && "line-clamp-1")}
			>
				{text}
			</p>
			{clips && (
				<button
					type="button"
					onClick={() => setExpanded((prev) => !prev)}
					aria-expanded={expanded}
					aria-controls={bodyId}
					className="-ml-1 rounded-md px-1 py-0.5 text-label-xs text-muted-foreground transition-colors hover:text-foreground focus-ring"
				>
					{expanded ? "Show less" : "Show more"}
				</button>
			)}
		</div>
	);
}

/** Structured outputs speak to the model; the transcript shows them as JSON. */
const outputText = (output: unknown): string =>
	typeof output === "string" ? output : JSON.stringify(output);

export function Tool({ part }: { part: ToolUIPart<SloppyTools> }) {
	const { icon: Icon, label } = toolPresentation(part);
	return (
		<>
			<Disclosure
				icon={<Icon className="h-3 w-3 shrink-0" aria-hidden="true" />}
				label={label}
			>
				<div className="flex flex-col gap-1.5">
					<DisclosureJson value={part.input} />
					{part.state === "output-available" &&
						(typeof part.output === "string" ? (
							<DisclosureText>{part.output}</DisclosureText>
						) : (
							<DisclosureJson value={part.output} />
						))}
					{part.state === "output-error" && (
						<DisclosureText>{part.errorText}</DisclosureText>
					)}
				</div>
			</Disclosure>
			{part.state === "output-available" && (
				<Outcome text={outputText(part.output)} />
			)}
			{part.state === "output-error" && (
				<Outcome failed text={part.errorText} />
			)}
		</>
	);
}
