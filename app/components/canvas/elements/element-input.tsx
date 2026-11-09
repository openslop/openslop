import type { ReactNode } from "react";
import { ZERO_WIDTH_SPACE } from "@/lib/canvas/constants";
import { getElementText } from "@/lib/canvas/osml-serializer";
import type { ContentElement } from "@/lib/canvas/types";
import { cn } from "@/lib/utils";
import { ELEMENT_CONFIGS } from "./element-configs";

const LOOKS = {
	card: "bg-element-input",
	panel: "bg-input",
} as const;

/** The box an element's prompt is typed in, with its placeholder while empty; `panel` matches the side panel's fields. */
export function ElementInput({
	element,
	look = "card",
	dir,
	children,
}: {
	element: ContentElement;
	look?: keyof typeof LOOKS;
	dir?: string;
	children: ReactNode;
}) {
	return (
		<div
			dir={dir}
			className={cn(
				"relative min-w-0 rounded-xl border border-transparent px-3 py-2.5 transition-colors hover:border-element-input-border-hover focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30",
				LOOKS[look],
			)}
		>
			{getElementText(element) === ZERO_WIDTH_SPACE && (
				<div className="pointer-events-none absolute top-2.5 start-3 text-start text-label text-muted-foreground select-none">
					{ELEMENT_CONFIGS[element.type].placeholder}
				</div>
			)}
			<div className="overflow-hidden text-start text-label leading-relaxed text-foreground transition-[max-height,opacity] duration-200">
				{children}
			</div>
		</div>
	);
}
