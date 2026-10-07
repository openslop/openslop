import type { ElementType, ScriptElement } from "@/lib/canvas/types";
import type { ConnectorRegistry } from "@/lib/connectors/registry";
import type {
	AssetConnectorType,
	AssetWrite,
	ConnectorConfig,
	ModelRef,
} from "@/lib/connectors/types";
import type { ProjectData } from "@/lib/project/store";
import type { NodeInputs } from "./inputs";

export type NodeId = string;

/** How a node runs: the connector and its configuration. */
export type GenerationJob = {
	elementId: string;
	elementType: ElementType;
	connectorType: AssetConnectorType;
	model: ModelRef;
	config: ConnectorConfig;
};

/** A unit of generation: one element, what it reads, and how it runs. */
export type GenerationNode = {
	id: NodeId;
	inputs: NodeInputs;
	/** Keyed by the label the declaring plugin gave the dependency, which is how its result reaches that plugin. */
	dependsOn: Record<string, GenerationNode>;
	job: GenerationJob;
};

/** What a build reads, and the writer `prepare` puts its assets through. */
export type BuildContext = {
	state: Omit<ProjectData, "title">;
	canvas: ScriptElement[];
	registry: ConnectorRegistry;
	setAsset: (write: AssetWrite) => void;
};

/** A node with no prompt has nothing to generate from. */
export const hasPrompt = (node: GenerationNode) => Boolean(node.inputs.prompt);

/** Every node reachable from `roots`, dependencies before their dependents. */
export function flattenGraph(roots: GenerationNode[]): GenerationNode[] {
	const ordered: GenerationNode[] = [];
	const seen = new Set<NodeId>();
	const visit = (node: GenerationNode) => {
		if (seen.has(node.id)) return;
		seen.add(node.id);
		for (const dep of Object.values(node.dependsOn)) visit(dep);
		ordered.push(node);
	};
	for (const root of roots) visit(root);
	return ordered;
}
