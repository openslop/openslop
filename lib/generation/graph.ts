import pick from "lodash/pick";
import type {
	ElementRef,
	ElementType,
	CanvasElement,
} from "@/lib/canvas/types";
import type { ConnectorRegistry } from "@/lib/connectors/registry";
import type {
	AssetConnectorType,
	AssetResult,
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

/** A node that lands keeps no result of its own. */
export type Landing = {
	on: ElementRef;
	revise: (current: AssetResult, result: AssetResult) => AssetResult;
};

export type GenerationNode = {
	id: NodeId;
	inputs: NodeInputs;
	/** Keyed by the label the declaring plugin gave the dependency, which is how its result reaches that plugin. */
	dependsOn: Record<string, GenerationNode>;
	job: GenerationJob;
	lands?: Landing;
};

/** The settings a build reads, so the live graph rebuilds when one changes. */
export const buildSettings = (state: ProjectData) =>
	pick(state, ["videoSettings", "scriptSettings"]);

export type BuildContext = {
	state: ReturnType<typeof buildSettings>;
	canvas: CanvasElement[];
	registry: ConnectorRegistry;
};

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
