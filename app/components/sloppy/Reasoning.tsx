"use client";

import { Sparkles } from "@/components/ui/icon";
import { Disclosure, DisclosureText } from "@/components/ui/disclosure";
import { reasoningOpen } from "./turnDisplay";

/** No duration to report reads as done, not as still running. */
function reasoningLabel(seconds: number | null | undefined): string {
	if (seconds === undefined) return "Thought";
	return seconds === null ? "Thinking…" : `Thought for ${seconds}s`;
}

export function Reasoning({
	text,
	seconds,
	superseded,
}: {
	text: string;
	seconds: number | null | undefined;
	superseded: boolean;
}) {
	const open = reasoningOpen(superseded, text);
	return (
		<Disclosure
			// Keyed on the auto state so reasoning that streams in open shuts itself
			// once Sloppy moves on, while a reader's own toggle still sticks.
			key={String(open)}
			defaultOpen={open}
			icon={<Sparkles className="h-3 w-3 shrink-0" aria-hidden="true" />}
			label={reasoningLabel(seconds)}
			pending={seconds === null}
		>
			<DisclosureText>{text}</DisclosureText>
		</Disclosure>
	);
}
