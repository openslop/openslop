"use client";

import { BookOpen } from "@/components/ui/icon";
import { Disclosure, DisclosureText } from "@/components/ui/disclosure";
import type { Turn } from "@/lib/agent/turns";
import { messageParts, type MessagePart } from "@/lib/agent/types";
import { PanelCard } from "../canvas/panel/PanelCard";
import { Reasoning } from "./Reasoning";
import { Task } from "./Task";
import { Tool, ToolOutput } from "./Tool";
import { turnStatus } from "./turnDisplay";
import type { ModelMessage } from "ai";

export function UserMessage({ message }: { message: ModelMessage }) {
	return (
		<p className="ml-auto w-fit max-w-[88%] shrink-0 break-words rounded-xl rounded-br-sm bg-primary px-3 py-2 text-label text-primary-foreground">
			{userText(message)}
		</p>
	);
}

function userText(message: ModelMessage): string {
	return messageParts(message)
		.filter((part) => part.type === "text")
		.map((part) => part.text)
		.join("\n");
}

function Step({
	part,
	reasoningSeconds,
	superseded,
}: {
	part: MessagePart;
	reasoningSeconds: number | null | undefined;
	superseded: boolean;
}) {
	switch (part.type) {
		case "reasoning":
			return (
				<Reasoning
					text={part.text}
					seconds={reasoningSeconds}
					superseded={superseded}
				/>
			);
		case "tool-call":
			return <Tool toolName={part.toolName} input={part.input} />;
		case "tool-result":
			return <ToolOutput output={part.output} />;
		default:
			return null;
	}
}

function ReplyText({ text }: { text: string }) {
	return (
		<p className="whitespace-pre-wrap break-words text-label text-foreground">
			{text}
		</p>
	);
}

/**
 * How the turn went sits in one collapsible task; what Sloppy said sits in the
 * card below it, so the reply survives the task closing.
 */
export function AgentTurn({
	turn,
	thoughtSeconds = turn.usage?.thoughtSeconds,
	streaming = false,
}: {
	turn: Turn;
	/** Unknown on a turn recorded before thinking time was; null while still thinking. */
	thoughtSeconds?: number | null;
	streaming?: boolean;
}) {
	const parts = turn.messages.flatMap(messageParts);
	const steps = parts.filter((part) => part.type !== "text");
	const said = parts.filter((part) => part.type === "text");
	const newest = parts.at(-1);

	return (
		<>
			{(streaming || turn.request || steps.length > 0) && (
				<Task
					streaming={streaming}
					status={turnStatus(parts)}
					seconds={turn.usage?.workSeconds}
				>
					{turn.request && (
						<Disclosure
							icon={
								<BookOpen className="h-3 w-3 shrink-0" aria-hidden="true" />
							}
							label="System prompt"
						>
							<DisclosureText>{turn.request.system}</DisclosureText>
						</Disclosure>
					)}
					{steps.map((part, index) => (
						<Step
							key={`${turn.id}-${index}`}
							part={part}
							reasoningSeconds={thoughtSeconds}
							superseded={part !== newest}
						/>
					))}
				</Task>
			)}
			{said.length > 0 && (
				<PanelCard>
					{said.map((part, index) => (
						<ReplyText key={`${turn.id}-text-${index}`} text={part.text} />
					))}
				</PanelCard>
			)}
		</>
	);
}
