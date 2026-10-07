import type { AssetElement, ElementType } from "@/lib/canvas/types";
import type { GenerationStatus } from "@/lib/generation/snapshots";
import type { ElementState } from "../elementState";
import type { ElementLength } from "@/lib/render/elementLengths";
import type { RefineOp } from "@/lib/script/refine/types";
import type { ProjectContext, ProjectData } from "@/lib/project/store";

/** An element's pictures and the prompt behind them, never the rest of the result. */
export type ElementImage = {
	type: ElementType;
	prompt: string;
	/** Absent when the element's type holds no picture, so there is never one to wait for. */
	pictures: { status: GenerationStatus; urls: string[] } | undefined;
};

/** What a tool can do to the project, never the parts it is built from. */
export type AgentToolContext = Pick<
	ProjectContext,
	"setTitle" | "updateScriptSettings" | "updateVideoSettings"
> & {
	readScript: () => string;
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
};
