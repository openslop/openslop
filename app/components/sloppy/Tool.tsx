"use client";

import type { ToolResultPart } from "ai";
import { AlertCircle, CornerDownRight } from "@/components/ui/icon";
import { Disclosure, DisclosureJson } from "@/components/ui/disclosure";
import { isToolFailure, toolResultText } from "@/lib/agent/types";
import { toolPresentation } from "./toolPresentation";

export function Tool({
	toolName,
	input,
}: {
	toolName: string;
	input: unknown;
}) {
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

export function ToolOutput({ output }: { output: ToolResultPart["output"] }) {
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
