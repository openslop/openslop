import type { AssetElement } from "@/lib/canvas/types";
import type { ElementImage } from "../element-image";
import type { ElementState } from "../element-state";
import type { ElementLength } from "@/lib/render/element-lengths";
import type { RefineOp } from "@/lib/script/refine/types";
import type { ProjectContext, ProjectData } from "@/lib/project/store";
import type { ModelDefaults } from "@/lib/connectors/models";
import type { Provider } from "@/lib/connectors/types";

export const PROJECT_SETTERS = [
	"setTitle",
	"updateScriptSettings",
	"updateVideoSettings",
	"updateModels",
] as const;

/** What a tool can do to the project, never the parts it is built from. */
export type AgentToolContext = Pick<
	ProjectContext,
	(typeof PROJECT_SETTERS)[number]
> & {
	readScript: () => string;
	isScriptEmpty: () => boolean;
	countSpokenWords: () => number;
	measureElementLengths: () => ElementLength[];
	measureRuntime: () => number;
	elementImage: (id: string) => ElementImage | undefined;
	elementStates: () => ElementState[];
	/** One focused LLM call, for tools whose whole job is a generation. */
	generateText: (
		prompt: string,
		options?: { maxTokens?: number; systemPrompt?: string },
	) => Promise<string>;
	readAssets: () => AssetElement[];
	readProject: () => ProjectData;
	editScript: (ops: RefineOp[]) => { applied: number; failures: string[] };
	writeScript: (brief: string) => Promise<void>;
	adaptScript: (script: string, notes?: string) => Promise<void>;
	modelChain: () => ModelDefaults;
	/** Whether the user can generate with the provider: the hosted one, or one whose key they stored. */
	isConnected: (provider: Provider) => boolean;
};
