"use client";

import { isStaticToolUIPart, isTextUIPart } from "ai";
import { BookOpen } from "@/components/ui/icon";
import partition from "lodash/partition";
import { Disclosure, DisclosureText } from "@/components/ui/disclosure";
import type { SloppyMessage } from "@/lib/agent/types";
import { PanelCard } from "../canvas/panel/PanelCard";
import { Reasoning } from "./Reasoning";
import { Task } from "./Task";
import { Tool } from "./Tool";
import { turnStatus, userText, type TurnPart } from "./turnDisplay";

export function UserMessage({ message }: { message: SloppyMessage }) {
	return (
		<p className="ml-auto w-fit max-w-[88%] shrink-0 break-words rounded-xl rounded-br-sm bg-primary px-3 py-2 text-label text-primary-foreground">
			{userText(message)}
		</p>
	);
}

export function PendingTurn() {
	return (
		<Task streaming status={turnStatus([])} seconds={undefined}>
			{null}
		</Task>
	);
}

function Step({ part, superseded }: { part: TurnPart; superseded: boolean }) {
	if (part.type === "reasoning") {
		return (
			<Reasoning
				text={part.text}
				streaming={part.state === "streaming"}
				superseded={superseded}
			/>
		);
	}
	if (isStaticToolUIPart(part)) return <Tool part={part} />;
	return null;
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
	message,
	streaming,
}: {
	message: SloppyMessage;
	streaming: boolean;
}) {
	const [said, steps] = partition(message.parts, isTextUIPart);
	const newest = message.parts.at(-1);
	const { request, usage } = message.metadata ?? {};

	return (
		<>
			{(streaming || request || steps.length > 0) && (
				<Task
					streaming={streaming}
					status={turnStatus(message.parts)}
					seconds={usage?.workSeconds}
				>
					{request && (
						<Disclosure
							icon={
								<BookOpen className="h-3 w-3 shrink-0" aria-hidden="true" />
							}
							label="System prompt"
						>
							<DisclosureText>{request.system}</DisclosureText>
						</Disclosure>
					)}
					{steps.map((part, index) => (
						<Step
							key={`${message.id}-${index}`}
							part={part}
							superseded={part !== newest}
						/>
					))}
				</Task>
			)}
			{said.length > 0 && (
				<PanelCard>
					{said.map((part, index) => (
						<ReplyText key={`${message.id}-text-${index}`} text={part.text} />
					))}
				</PanelCard>
			)}
		</>
	);
}
