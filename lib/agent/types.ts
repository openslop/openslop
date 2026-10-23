import { z } from "zod";
import type { InferUIDataParts, InferUITools, UIMessage } from "ai";
import { handEditsSchema } from "./hand-edits";
import { SLOPPY_TOOLS } from "./tools/registry";

/** Carried on the message, so one turn stays one row however many steps it took. */
export const sloppyMetadataSchema = z.object({
	/** Every step of the turn, end to end. Excludes the edits, which the client runs. */
	workSeconds: z.number().optional(),
});
export type SloppyMetadata = z.infer<typeof sloppyMetadataSchema>;

export type SloppyTools = InferUITools<typeof SLOPPY_TOOLS>;

/** What the editor attaches to a user message besides its text. */
export const SLOPPY_DATA = { "hand-edits": handEditsSchema };
export type SloppyData = InferUIDataParts<typeof SLOPPY_DATA>;

/** The transcript's message, in the one shape both the panel and storage take. */
export type SloppyMessage = UIMessage<SloppyMetadata, SloppyData, SloppyTools>;
