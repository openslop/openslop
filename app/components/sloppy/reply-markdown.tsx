"use client";

import type { ComponentProps } from "react";
import { Streamdown, type AnimateOptions, type Components } from "streamdown";

/** Streamdown's stand-in href for a link whose URL is still streaming in. */
const INCOMPLETE_LINK = "streamdown:incomplete-link";

const heading = ({
	node: _node,
	...props
}: ComponentProps<"h3"> & { node?: unknown }) => (
	<h3 className="font-semibold" {...props} />
);

/** Markdown at the reply's own size, in the type tokens, so a reply never outgrows the panel. */
const COMPONENTS: Components = {
	p: ({ node: _node, ...props }) => <p {...props} />,
	strong: ({ node: _node, ...props }) => (
		<strong className="font-semibold" {...props} />
	),
	em: ({ node: _node, ...props }) => <em className="italic" {...props} />,
	ul: ({ node: _node, ...props }) => (
		<ul className="list-disc space-y-1 pl-4" {...props} />
	),
	ol: ({ node: _node, ...props }) => (
		<ol className="list-decimal space-y-1 pl-4" {...props} />
	),
	li: ({ node: _node, ...props }) => <li {...props} />,
	h1: heading,
	h2: heading,
	h3: heading,
	h4: heading,
	h5: heading,
	h6: heading,
	inlineCode: ({ node: _node, ...props }) => (
		<code className="rounded bg-foreground/10 px-1 font-numeric" {...props} />
	),
	pre: ({ node: _node, ...props }) => (
		<pre
			className="overflow-x-auto rounded-md bg-foreground/10 p-2 font-numeric whitespace-pre-wrap"
			{...props}
		/>
	),
	code: ({ node: _node, ...props }) => <code {...props} />,
	blockquote: ({ node: _node, ...props }) => (
		<blockquote
			className="border-l-2 border-border pl-3 text-muted-foreground"
			{...props}
		/>
	),
	hr: () => <hr className="border-border" />,
	table: ({ node: _node, ...props }) => (
		<div className="overflow-x-auto">
			<table className="w-full border-collapse text-left" {...props} />
		</div>
	),
	th: ({ node: _node, ...props }) => (
		<th className="border-b border-border px-2 py-1 font-semibold" {...props} />
	),
	td: ({ node: _node, ...props }) => (
		<td className="border-b border-border px-2 py-1" {...props} />
	),
	a: ({ node: _node, href, children, ...props }) =>
		href && href !== INCOMPLETE_LINK ? (
			<a
				{...props}
				href={href}
				target="_blank"
				rel="noreferrer"
				className="focus-ring rounded-sm text-accent underline underline-offset-2 hover:decoration-2"
			>
				{children}
			</a>
		) : (
			<span>{children}</span>
		),
};

const FADE_IN: AnimateOptions = { easing: "var(--ease-casual)" };

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
			controls={false}
			linkSafety={{ enabled: false }}
			animated={FADE_IN}
			isAnimating={streaming}
		>
			{text}
		</Streamdown>
	);
}
