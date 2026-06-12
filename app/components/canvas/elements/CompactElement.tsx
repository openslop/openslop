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
			className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 animate-fadeInUp"
			contentEditable={false}
			{...attributes}
		>
			<span
				className={`flex items-center gap-1 rounded-full ${config.bgColor} px-1.5 py-0.5 text-white`}
				contentEditable={false}
			>
				{config.icon}
			</span>
			{text && (
				<span
					className="truncate text-xs text-white/60 max-w-[800px]"
					contentEditable={false}
				>
					{text}
				</span>
			)}
			<span className="hidden">{children}</span>
		</div>
	);
}
