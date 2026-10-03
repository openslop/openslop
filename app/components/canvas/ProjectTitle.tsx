import type { RenderElementProps } from "slate-react";

export function ProjectTitle({
	attributes,
	children,
}: Pick<RenderElementProps, "attributes" | "children">) {
	return (
		<h1
			{...attributes}
			className="mb-3 font-body text-heading font-semibold text-foreground"
		>
			{children}
		</h1>
	);
}
