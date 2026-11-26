import type { ElementResult, ResultView } from "../element-result";
import type { ElementState } from "../element-state";
import type { SpeechEstimate } from "@/lib/canvas/spoken-words";
import type { VisualSpan } from "@/lib/render/visual-spans";
import type { RefineReport } from "@/lib/script/refine/apply-ops";
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
	markScriptRead: () => void;
	isScriptReadCurrent: () => boolean;
	countSpokenWords: () => number;
	estimateSpeechLengths: () => SpeechEstimate[];
	estimateVisualSpans: () => VisualSpan[];
	estimateRuntime: () => number;
	elementResult: (id: string) => Promise<ElementResult | undefined>;
	elementStates: () => ElementState[];
	readProject: () => ProjectData;
	modelDefaults: () => ModelDefaults;
	editScript: (ops: RefineOp[]) => RefineReport;
	isConnected: (provider: Provider) => boolean;
	generateCaptions: (ids?: string[]) => CaptionsReport;
	captionMedia: (item: MediaItem) => Promise<void>;
	setElementResult: (id: string, url: string) => Promise<void>;
	viewMedia: (item: MediaItem) => Promise<ResultView>;
};
