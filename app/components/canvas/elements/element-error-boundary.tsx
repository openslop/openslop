"use client";

import { catchError, type ErrorInfo } from "next/error";
import type { RenderElementProps } from "slate-react";
import { RenderErrorFallback } from "@/app/components/toast-error-boundary";
import { splitTextDirection } from "../utils/text-direction";

interface ElementErrorBoundaryProps {
	label: string;
	attributes: RenderElementProps["attributes"];
	/** The element's text leaves; Slate needs them in the DOM to keep resolving the node. */
	leaves: RenderElementProps["children"];
}

function ElementErrorFallback(
	{ label, attributes, leaves }: ElementErrorBoundaryProps,
	info: ErrorInfo,
) {
	const { nodeAttributes } = splitTextDirection(attributes);
	return (
		<div
			{...nodeAttributes}
			contentEditable={false}
			className="mb-1.5 rounded-2xl border border-border bg-element-card"
		>
			<RenderErrorFallback label={label} {...info} />
			<span className="hidden">{leaves}</span>
		</div>
	);
}

export const ElementErrorBoundary = catchError(ElementErrorFallback);
