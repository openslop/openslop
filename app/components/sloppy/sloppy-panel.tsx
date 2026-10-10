"use client";

import { memo, useEffect, useRef, useState } from "react";
import { scrollIntoContainer } from "@/lib/components/scroll-into-container";
import { cn } from "@/lib/utils";
import { trailingAssistant } from "@/lib/agent/messages";
import type { SloppyMessage } from "@/lib/agent/types";
import { AgentTurn, UserMessage } from "./sloppy-message";
import { useSloppy, useSloppyMessages } from "./sloppy-provider";
import { TranscriptSkeleton } from "./transcript-skeleton";
import { turnStatus } from "./turn-display";
import { WorkingStatus } from "./turn-status";

const EMPTY_HINT = "Ask Sloppy to change the script however you want.";

/** A settled message never changes, so only the one being streamed re-renders. */
const Row = memo(function Row({
	message,
	streaming,
	entering,
}: {
	message: SloppyMessage;
	streaming: boolean;
	entering: boolean;
}) {
	return (
		<li className={cn("flex flex-col gap-2", entering && "animate-fadeInUp")}>
			<span className="sr-only">
				{message.role === "user" ? "You said" : "Sloppy said"}
			</span>
			{message.role === "user" ? (
				<UserMessage message={message} />
			) : (
				<AgentTurn message={message} streaming={streaming} />
			)}
		</li>
	);
});

function Transcript({
	messages,
	working,
}: {
	messages: SloppyMessage[];
	working: boolean;
}) {
	const [restoredCount] = useState(messages.length);

	if (messages.length === 0) {
		return (
			<p className="px-1 text-label text-muted-foreground">{EMPTY_HINT}</p>
		);
	}

	return (
		<ol className="flex flex-col gap-3">
			{messages.map((message, index) => (
				<Row
					key={message.id}
					message={message}
					streaming={working && index === messages.length - 1}
					entering={index >= restoredCount}
				/>
			))}
			{working && (
				<li>
					<WorkingStatus
						status={turnStatus(trailingAssistant(messages)?.parts ?? [])}
					/>
				</li>
			)}
		</ol>
	);
}

export function SloppyPanel() {
	const messages = useSloppyMessages();
	const { loading } = useSloppy();
	const endRef = useRef<HTMLDivElement>(null);
	const lastSentId = useRef<string>(undefined);

	// Jump to the bottom once per sent message (and once for a restored
	// transcript), then leave scrolling to the user while the reply streams.
	const sentId = messages?.findLast((message) => message.role === "user")?.id;
	useEffect(() => {
		if (!endRef.current || sentId === lastSentId.current) return;
		const restoring = lastSentId.current === undefined;
		lastSentId.current = sentId;
		scrollIntoContainer(endRef.current, "end", restoring ? "auto" : "smooth");
	}, [sentId]);

	return (
		<div
			role="log"
			aria-busy={messages === null || loading}
			className="flex flex-col gap-3"
		>
			{messages === null ? (
				<TranscriptSkeleton />
			) : (
				<Transcript messages={messages} working={loading} />
			)}
			<div ref={endRef} />
		</div>
	);
}
