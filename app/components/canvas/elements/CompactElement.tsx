import { RenderElementProps } from "slate-react";
import { Node } from "slate";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { ELEMENT_CONFIGS } from "@/lib/canvas/elementConfigs";

export function CompactElement({
	attributes,
	element,
	children,
}: {
	attributes: RenderElementProps["attributes"];
	element: CanvasContentElement;
	children: React.ReactNode;
}) {
	const config = ELEMENT_CONFIGS[element.type];
	const text = Node.string(element).trim();

	return (
		<div
			className="inline-flex items-center gap-1 rounded-md py-0.5 animate-fadeInUp"
			contentEditable={false}
			{...attributes}
		>
			<span
				className={`flex items-center gap-1 rounded-md bg-muted px-1 py-0.5 ${config.colorClass}`}
				contentEditable={false}
			>
				<config.Icon size={16} />
			</span>
			{text && (
				<span
					className="max-w-[800px] truncate text-label text-muted-foreground"
					contentEditable={false}
				>
					{text}
				</span>
			)}
			<span className="hidden">{children}</span>
		</div>
	);
}
