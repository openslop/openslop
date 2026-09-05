import type { CanvasElementType } from "@/lib/canvas/types";
import type { GenerationStatus } from "@/lib/generation/snapshots";
import type { ElementState, ElementVersionSummary } from "../elementState";
import type { ElementLength } from "@/lib/video/elementLengths";
import type { RefineOp } from "@/lib/script/refine/types";
import type {
	DeepPartial,
	Metadata,
	MetadataCharacter,
} from "@/lib/project/types";

/** An element's generated picture and the prompt behind it, never the rest of the result. */
export type ElementImage = {
	type: CanvasElementType;
	prompt: string;
	/** Absent when the element's type makes no picture, so there is never one to wait for. */
	picture: { status: GenerationStatus; url: string | undefined } | undefined;
};

/** An element's takes, and the way to put one back. */
export type ElementHistoryRead = {
	versions: ElementVersionSummary[];
	/** Puts the numbered take back on the canvas, with the text and attributes that made it. */
	restore: (version: number) => Promise<void>;
};

/** What a tool can do to the canvas, never the parts it is built from. */
export type AgentToolContext = {
	readScript: () => string;
	countSpokenWords: () => number;
	measureElementLengths: () => ElementLength[];
	referenceImages: () => string[];
	avatarUrl: (name: string) => string | undefined;
	elementImage: (id: string) => ElementImage | undefined;
	/** Where every element on the canvas stands, in script order. */
	elementStates: () => ElementState[];
	/** Every take an element has produced, oldest first; undefined for an id not on the canvas. */
	elementHistory: (id: string) => Promise<ElementHistoryRead | undefined>;
	/** One focused LLM call, for tools whose whole job is a generation. */
	generateText: (
		prompt: string,
		options?: { maxTokens?: number },
	) => Promise<string>;
	readMetadata: () => Metadata;
	editScript: (ops: RefineOp[]) => { applied: number; failures: string[] };
	writeScript: (brief: string) => Promise<void>;
	adaptScript: (script: string, notes?: string) => Promise<void>;
	setMetadata: (patch: DeepPartial<Metadata>) => void;
	setCharacter: (
		name: string,
		patch: Partial<MetadataCharacter>,
	) => { name: string; created: boolean };
};
