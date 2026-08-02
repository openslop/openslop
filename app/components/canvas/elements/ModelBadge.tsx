import { Codesandbox } from "@/components/ui/icon";
import { useConfig } from "@/lib/config/ConfigProvider";
import { resolveElementConnector } from "@/lib/canvas/elementConnector";
import { resolveAttributeSchema } from "@/lib/connectors/factory";
import { reconcileAttributes } from "@/lib/connectors/attributes/reconcile";
import { AttributeBadge } from "./AttributeBadge";
import { useElementGeneration } from "./ElementGenerationContext";

export function ModelBadge() {
	const { element } = useElementGeneration();
	const { connectorConfig } = useConfig();
	const { type, provider, model, config } = resolveElementConnector(
		element,
		connectorConfig,
	);

	const spec = {
		label: "Model",
		icon: Codesandbox,
		edit: { kind: "enum", options: config.models },
	} as const;

	// NOTE: every connector's attributesFor currently ignores `model`, so
	// oldSchema/newSchema are always identical for a given (connector, provider)
	// and this reconciliation is a no-op today — it's the seam for when
	// per-model attribute sets land, not yet exercised. It also only diffs key
	// presence, not enum-value validity (e.g. a value valid on the old model
	// but not the new one survives the switch); worth revisiting once per-model
	// schemas actually differ.
	const reconcileForModel = (next: string) =>
		reconcileAttributes(
			resolveAttributeSchema(type, provider, model),
			resolveAttributeSchema(type, provider, next),
			element.customAttributes ?? {},
		);

	return (
		<AttributeBadge
			element={element}
			attrKey="model"
			spec={spec}
			deriveExtraAttrs={reconcileForModel}
		/>
	);
}
