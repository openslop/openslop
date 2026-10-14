"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { useStickToBottom } from "use-stick-to-bottom";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "@/components/ui/icon";
import { scrollableAncestor } from "@/lib/components/scroll-into-container";
import { cn } from "@/lib/utils";
import { trailingAssistant } from "@/lib/agent/messages";
import type { SloppyMessage } from "@/lib/agent/types";
import { AgentTurn, UserMessage } from "./sloppy-message";
import { useSloppy, useSloppyMessages } from "./sloppy-provider";
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
	follow,
}: {
	messages: SloppyMessage[];
	working: boolean;
	follow: () => void;
}) {
	const [restoredCount] = useState(messages.length);
	const sentId = messages.findLast((message) => message.role === "user")?.id;
	const [restoredSentId] = useState(sentId);
	useEffect(() => {
		if (sentId !== restoredSentId) follow();
	}, [sentId, restoredSentId, follow]);

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
	const { scrollRef, contentRef, isAtBottom, scrollToBottom } =
		useStickToBottom({ initial: "instant" });
	const ref = useCallback(
		(element: HTMLDivElement | null) => {
			contentRef(element);
			scrollRef(element && scrollableAncestor(element));
		},
		[contentRef, scrollRef],
	);

	return (
		<div
			ref={ref}
			role="log"
			aria-busy={loading}
			className="flex flex-col gap-3"
		>
			<Transcript
				messages={messages}
				working={loading}
				follow={scrollToBottom}
			/>
			<div className="sticky bottom-2 flex h-0 justify-center">
				{!isAtBottom && (
					<Button
						variant="secondary"
						size="xs"
						className="absolute bottom-0 animate-fadeInUp shadow-elevation-3"
						onClick={() => scrollToBottom()}
					>
						<ChevronDown />
						Jump to latest
					</Button>
				)}
			</div>
		</div>
	);
}
