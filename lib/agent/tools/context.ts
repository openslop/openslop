import type { AssetElement } from "@/lib/canvas/types";
import type { ElementResult, ResultView } from "../element-result";
import type { ElementState } from "../element-state";
import type { DialogueEstimate } from "@/lib/canvas/spoken-words";
import type { VisualSpan } from "@/lib/render/visual-spans";
import type { RefineOp } from "@/lib/script/refine/types";
import type { ProjectContext, ProjectData } from "@/lib/project/store";
import type { MediaItem } from "@/lib/project/media";
import type { Provider } from "@/lib/connectors/types";
import type { ModelDefaults } from "@/lib/connectors/models";
import type { CaptionsReport } from "@/lib/captions/auto-captions";

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
	estimateDialogueLengths: () => DialogueEstimate[];
	estimateVisualSpans: () => VisualSpan[];
	estimateRuntime: () => number;
	elementResult: (id: string) => Promise<ElementResult | undefined>;
	elementStates: () => ElementState[];
	/** One focused LLM call, for tools whose whole job is a generation. */
	generateText: (
		prompt: string,
		options?: { maxTokens?: number; systemPrompt?: string },
	) => Promise<string>;
	readAssets: () => AssetElement[];
	readProject: () => ProjectData;
	modelDefaults: () => ModelDefaults;
	editScript: (ops: RefineOp[]) => { applied: number; failures: string[] };
	writeScript: (brief: string) => Promise<void>;
	adaptScript: (script: string, notes?: string) => Promise<void>;
	isConnected: (provider: Provider) => boolean;
	generateCaptions: (ids?: string[]) => CaptionsReport;
	setElementResult: (id: string, url: string) => Promise<void>;
	viewMedia: (item: MediaItem) => Promise<ResultView>;
};
