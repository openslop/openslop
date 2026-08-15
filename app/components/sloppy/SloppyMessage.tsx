"use client";

import { BookOpen } from "@/components/ui/icon";
import { messageParts, type AgentMessage } from "@/lib/agent/types";
import { PanelCard } from "../canvas/panel/PanelCard";
import { Disclosure, DisclosureText } from "./Disclosure";
import { ActivityBlock, WorkPart } from "./SloppyActivity";
import { turnStatus } from "./turnStatus";

export function UserMessage({ message }: { message: AgentMessage }) {
	return (
		<p className="ml-auto w-fit max-w-[88%] shrink-0 break-words rounded-xl rounded-br-sm bg-primary px-3 py-2 text-label text-primary-foreground">
			{userText(message)}
		</p>
	);
}

function userText(message: AgentMessage): string {
	return messageParts(message)
		.filter((part) => part.type === "text")
		.map((part) => part.text)
		.join("\n");
}

function ReplyText({ text }: { text: string }) {
	return (
		<p className="whitespace-pre-wrap break-words text-label text-foreground">
			{text}
		</p>
	);
}

/**
 * How the turn went sits in one collapsible block; what Sloppy said sits in the
 * card below it, so the reply survives the block closing.
 */
export function AgentTurn({
	messages,
	systemPrompt,
	thoughtSeconds,
	workSeconds,
	streaming = false,
	idPrefix,
}: {
	/** The assistant message and any tool results answering it. */
	messages: AgentMessage[];
	systemPrompt?: string;
	/** Unknown on a turn recorded before thinking time was; null while still thinking. */
	thoughtSeconds?: number | null;
	workSeconds?: number;
	streaming?: boolean;
	idPrefix: string;
}) {
	const parts = messages.flatMap(messageParts);
	const work = parts.filter((part) => part.type !== "text");
	const said = parts.filter((part) => part.type === "text");

	return (
		<>
			{(streaming || systemPrompt || work.length > 0) && (
				<ActivityBlock
					streaming={streaming}
					status={turnStatus(parts)}
					seconds={workSeconds}
				>
					{systemPrompt && (
						<Disclosure
							icon={
								<BookOpen className="h-3 w-3 shrink-0" aria-hidden="true" />
							}
							label="System prompt"
						>
							<DisclosureText>{systemPrompt}</DisclosureText>
						</Disclosure>
					)}
					{work.map((part, index) => (
						<WorkPart
							key={`${idPrefix}-${index}`}
							part={part}
							thoughtSeconds={thoughtSeconds}
						/>
					))}
				</ActivityBlock>
			)}
			{said.length > 0 && (
				<PanelCard>
					{said.map((part, index) => (
						<ReplyText key={`${idPrefix}-text-${index}`} text={part.text} />
					))}
				</PanelCard>
			)}
		</>
	);
}
