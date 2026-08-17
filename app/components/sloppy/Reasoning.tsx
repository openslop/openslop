"use client";

import { Sparkles } from "@/components/ui/icon";
import { Disclosure, DisclosureText } from "@/components/ui/disclosure";
import { reasoningOpen } from "./turnDisplay";

export function Reasoning({
	text,
	streaming,
	superseded,
}: {
	text: string;
	streaming: boolean;
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
			label={streaming ? "Slopping…" : "Done slopping"}
			pending={streaming}
		>
			<DisclosureText>{text}</DisclosureText>
		</Disclosure>
	);
}
