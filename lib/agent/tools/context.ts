import type { RefineOp } from "@/lib/script/refine/types";

/** What a tool can do to the canvas, never the parts it is built from. */
export type AgentToolContext = {
	readScript: () => string;
	clearScript: () => void;
	editScript: (ops: RefineOp[]) => { applied: number; failures: string[] };
	writeScript: (brief: string) => Promise<void>;
};
