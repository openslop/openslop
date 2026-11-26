"use client";

import { isStaticToolUIPart, isTextUIPart } from "ai";
import { CopyButton } from "@/components/ui/copy-button";
import type { SloppyMessage } from "@/lib/agent/types";
import { PanelCard } from "../canvas/panel/panel-card";
import { Reasoning } from "./reasoning";
import { ReplyMarkdown } from "./reply-markdown";
import { Tool } from "./tool";
import { WorkedStatus } from "./turn-status";
import { reasoningOpen, userText, type TurnPart } from "./turn-display";

export function UserMessage({ message }: { message: SloppyMessage }) {
	return (
		<p className="ml-auto w-fit max-w-[88%] shrink-0 whitespace-pre-wrap wrap-break-word rounded-xl rounded-br-sm bg-user-message px-3 py-2 text-label text-user-message-foreground">
			{userText(message)}
		</p>
	);
}

function ReplyText({ text, streaming }: { text: string; streaming: boolean }) {
	return (
		<div className="group/reply">
			<PanelCard>
				<div className="pr-6 text-label text-foreground">
					<ReplyMarkdown text={text} streaming={streaming} />
				</div>
				<CopyButton
					text={text}
					label="Copy reply"
					size="sm"
					className="absolute top-2 right-2 opacity-0 group-hover/reply:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100"
				/>
			</PanelCard>
		</div>
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
	if (isTextUIPart(part))
		return (
			<ReplyText
				text={part.text}
				streaming={live && part.state === "streaming"}
			/>
		);
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
