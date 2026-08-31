"use client";

import { isStaticToolUIPart, isTextUIPart } from "ai";
import type { SloppyMessage } from "@/lib/agent/types";
import { PanelCard } from "../canvas/panel/PanelCard";
import { Reasoning } from "./Reasoning";
import { Tool } from "./Tool";
import { WorkedStatus } from "./TurnStatus";
import { reasoningOpen, userText, type TurnPart } from "./turnDisplay";

export function UserMessage({ message }: { message: SloppyMessage }) {
	return (
		<p className="ml-auto w-fit max-w-[88%] shrink-0 break-words rounded-xl rounded-br-sm bg-primary px-3 py-2 text-label text-primary-foreground">
			{userText(message)}
		</p>
	);
}

function ReplyText({ text }: { text: string }) {
	return (
		<PanelCard>
			<p className="whitespace-pre-wrap break-words text-label text-foreground">
				{text}
			</p>
		</PanelCard>
	);
}

function Step({
	part,
	live,
	superseded,
}: {
	part: TurnPart;
	/** A restored transcript is never live, however its parts were stored. */
	live: boolean;
	superseded: boolean;
}) {
	if (isTextUIPart(part)) return <ReplyText text={part.text} />;
	if (part.type === "reasoning") {
		return (
			<Reasoning
				text={part.text}
				streaming={live && part.state === "streaming"}
				open={reasoningOpen(live, superseded, part.text)}
			/>
		);
	}
	if (isStaticToolUIPart(part)) return <Tool part={part} />;
	return null;
}

export function AgentTurn({
	message,
	streaming,
}: {
	message: SloppyMessage;
	streaming: boolean;
}) {
	const newest = message.parts.at(-1);
	const worked = message.parts.some((part) => !isTextUIPart(part));

	return (
		<>
			{message.parts.map((part, index) => (
				<Step
					key={`${message.id}-${index}`}
					part={part}
					live={streaming}
					superseded={part !== newest}
				/>
			))}
			{!streaming && worked && (
				<WorkedStatus seconds={message.metadata?.workSeconds} />
			)}
		</>
	);
}
