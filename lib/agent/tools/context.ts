import type { RefineOp } from "@/lib/script/refine/types";
import type {
	DeepPartial,
	Metadata,
	MetadataCharacter,
} from "@/lib/project/types";

/** What a tool can do to the canvas, never the parts it is built from. */
export type AgentToolContext = {
	readScript: () => string;
	readMetadata: () => Metadata;
	clearScript: () => void;
	editScript: (ops: RefineOp[]) => { applied: number; failures: string[] };
	writeScript: (brief: string) => Promise<void>;
	setMetadata: (patch: DeepPartial<Metadata>) => void;
	setCharacter: (
		name: string,
		patch: Partial<MetadataCharacter>,
	) => { name: string; created: boolean };
};
