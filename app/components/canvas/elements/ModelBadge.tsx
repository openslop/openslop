import { useMemo } from "react";
import { Codesandbox } from "@/components/ui/icon";
import { useConfig } from "@/lib/config/ConfigProvider";
import {
	isKnownProvider,
	resolveAttributeSchema,
} from "@/lib/connectors/factory";
import { reconcileAttributes } from "@/lib/connectors/attributes/reconcile";
import { ELEMENT_TYPES, type CanvasContentElement } from "@/lib/canvas/types";
import { AttributeBadge } from "./AttributeBadge";

export function ModelBadge({ element }: { element: CanvasContentElement }) {
	const { connectorConfig } = useConfig();
	const { model, provider } = element.customAttributes ?? {};
	const connector = ELEMENT_TYPES[element.type].connector;

	const resolved = useMemo(() => {
		if (!model || !provider || !isKnownProvider(connector, provider)) {
			return null;
		}
		const options = connectorConfig[connector]?.[provider]?.models ?? [];
		return {
			model,
			provider,
			spec: {
				label: "Model",
				icon: Codesandbox,
				edit: { kind: "enum", options },
			} as const,
		};
	}, [connector, connectorConfig, model, provider]);

	if (!resolved) return null;

	// NOTE: every connector's attributesFor currently ignores `model`, so
	// oldSchema/newSchema are always identical for a given (connector, provider)
	// and this reconciliation is a no-op today — it's the seam for when
	// per-model attribute sets land, not yet exercised. It also only diffs key
	// presence, not enum-value validity (e.g. a value valid on the old model
	// but not the new one survives the switch); worth revisiting once per-model
	// schemas actually differ.
	const reconcileForModel = (next: string) =>
		reconcileAttributes(
			resolveAttributeSchema(connector, resolved.provider, resolved.model),
			resolveAttributeSchema(connector, resolved.provider, next),
			element.customAttributes ?? {},
		);

	return (
		<AttributeBadge
			element={element}
			attrKey="model"
			spec={resolved.spec}
			deriveExtraAttrs={reconcileForModel}
		/>
	);
}
