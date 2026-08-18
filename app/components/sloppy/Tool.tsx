"use client";

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

function Outcome({
	icon: Icon,
	tone,
	text,
}: {
	icon: IconComponent;
	tone: string;
	text: string;
}) {
	return (
		<p className={cn("flex items-start gap-1.5 pl-4 text-label-xs", tone)}>
			<Icon className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
			<span className="line-clamp-2">{text}</span>
		</p>
	);
}

const Returned = ({ text }: { text: string }) => (
	<Outcome icon={CornerDownRight} tone="text-muted-foreground" text={text} />
);

const Failed = ({ text }: { text: string }) => (
	<Outcome icon={AlertCircle} tone="text-destructive" text={text} />
);

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
					{part.state === "output-available" && (
						<DisclosureText>{part.output}</DisclosureText>
					)}
					{part.state === "output-error" && (
						<DisclosureText>{part.errorText}</DisclosureText>
					)}
				</div>
			</Disclosure>
			{part.state === "output-available" && <Returned text={part.output} />}
			{part.state === "output-error" && <Failed text={part.errorText} />}
		</>
	);
}
