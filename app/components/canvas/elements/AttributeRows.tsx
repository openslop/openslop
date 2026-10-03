import type { ScriptElement } from "@/lib/canvas/types";
import type { AttributeSpec } from "@/lib/connectors/attributes/schema";
import { AttributeBadge } from "./AttributeBadge";

export function AttributeRows({
	element,
	specs,
}: {
	element: ScriptElement;
	specs: Record<string, AttributeSpec>;
}) {
	return (
		<div className="flex flex-col gap-2">
			{Object.entries(specs).map(([key, spec]) => (
				<div key={key} className="flex items-center justify-between gap-3">
					<span className="shrink-0 text-label">{spec.label}</span>
					<AttributeBadge
						element={element}
						attrKey={key}
						spec={spec}
						hideLabel
					/>
				</div>
			))}
		</div>
	);
}
