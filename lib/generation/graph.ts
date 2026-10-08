import type { ElementType, CanvasElement } from "@/lib/canvas/types";
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
	elementType: ElementType;
	connectorType: AssetConnectorType;
	model: ModelRef;
	config: ConnectorConfig;
};

export type GenerationNode = {
	id: NodeId;
	inputs: NodeInputs;
	/** Keyed by the label the declaring plugin gave the dependency, which is how its result reaches that plugin. */
	dependsOn: Record<string, GenerationNode>;
	job: GenerationJob;
};

/** The settings a build reads, so the live graph rebuilds when one changes. */
export const buildSettings = ({
	videoSettings,
	scriptSettings,
}: ProjectData) => ({
	videoSettings,
	scriptSettings,
});

export type BuildContext = {
	state: ReturnType<typeof buildSettings>;
	canvas: CanvasElement[];
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
