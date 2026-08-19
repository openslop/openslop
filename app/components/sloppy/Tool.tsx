"use client";

import { useId, useState } from "react";
import type { ToolUIPart } from "ai";
import {
	AlertCircle,
	CornerDownRight,
	type IconComponent,
} from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import {
	Disclosure,
	DisclosureJson,
	DisclosureText,
} from "@/components/ui/disclosure";
import type { SloppyTools } from "@/lib/agent/types";
import { toolPresentation } from "./toolPresentation";

const PREVIEW_LIMIT = 240;

function Outcome({
	icon: Icon,
	tone,
	text,
}: {
	icon: IconComponent;
	tone: string;
	text: string;
}) {
	const [expanded, setExpanded] = useState(false);
	const bodyId = useId();
	const clips = text.length > PREVIEW_LIMIT;

	return (
		<div className={cn("flex items-start gap-1.5 pl-4 text-label-xs", tone)}>
			<Icon className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
			<div className="flex flex-col items-start gap-0.5">
				<p
					id={bodyId}
					className={cn("break-words", clips && !expanded && "line-clamp-2")}
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
		</div>
	);
}

const Returned = ({ text }: { text: string }) => (
	<Outcome icon={CornerDownRight} tone="text-muted-foreground" text={text} />
);

const Failed = ({ text }: { text: string }) => (
	<Outcome icon={AlertCircle} tone="text-destructive" text={text} />
);

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
				<Returned text={outputText(part.output)} />
			)}
			{part.state === "output-error" && <Failed text={part.errorText} />}
		</>
	);
}
