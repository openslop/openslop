"use client";

import { createElement, type ComponentProps, type JSX } from "react";
import { Streamdown, type AnimateOptions, type Components } from "streamdown";

/** An element in the given classes, minus the hast `node` Streamdown hands every override. */
const styled = <T extends keyof JSX.IntrinsicElements>(
	tag: T,
	className?: string,
) =>
	function Styled({
		node: _node,
		...props
	}: ComponentProps<T> & { node?: unknown }) {
		return createElement(tag, { className, ...props });
	};

const heading = styled("h3", "font-semibold");

/** Markdown at the reply's own size, in the type tokens, so a reply never outgrows the panel. */
const COMPONENTS: Components = {
	strong: styled("strong", "font-semibold"),
	ul: styled("ul", "list-disc space-y-1 pl-4"),
	ol: styled("ol", "list-decimal space-y-1 pl-4"),
	li: styled("li"),
	h1: heading,
	h2: heading,
	h3: heading,
	h4: heading,
	h5: heading,
	h6: heading,
	inlineCode: styled("code", "rounded bg-foreground/10 px-1 font-numeric"),
	pre: styled(
		"pre",
		"whitespace-pre-wrap wrap-break-word rounded-md bg-surface-recessed p-2 font-numeric [&>code]:bg-transparent [&>code]:p-0",
	),
	blockquote: styled("blockquote", "border-l-2 pl-3 text-muted-foreground"),
	hr: styled("hr"),
	table: ({ node: _node, ...props }) => (
		<div className="overflow-x-auto">
			<table className="w-full border-collapse text-left" {...props} />
		</div>
	),
	th: styled("th", "border-b px-2 py-1 font-semibold"),
	td: styled("td", "px-2 py-1"),
	a: ({ node: _node, ...props }) => (
		<a
			{...props}
			target="_blank"
			rel="noreferrer"
			className="focus-ring rounded-sm text-accent underline underline-offset-2 hover:decoration-2"
		/>
	),
};

const FADE_IN: AnimateOptions = { easing: "var(--ease-casual)" };

/** A link still streaming its URL shows as plain text, never as a dead link. */
const REMEND = { linkMode: "text-only" } as const;

export function ReplyMarkdown({
	text,
	streaming,
}: {
	text: string;
	streaming: boolean;
}) {
	return (
		<Streamdown
			className="space-y-2 wrap-break-word"
			components={COMPONENTS}
			remend={REMEND}
			animated={FADE_IN}
			isAnimating={streaming}
		>
			{text}
		</Streamdown>
	);
}
