import { z } from "zod";
import { ASSET_CONNECTOR_TYPES } from "@/lib/connectors/types";
import type { AssetResult } from "@/lib/connectors/types";
import type { VersionStorage } from "@/lib/generation/history";
import type { GenerationInputs } from "@/lib/generation/inputs";
import type { ElementVersion } from "@/lib/generation/versions";
import { createClient } from "@/lib/supabase/client";
import { toastError } from "@/lib/toastError";

const TABLE = "element_history";

const InputsSchema = z.object({
	prompt: z.string(),
	attributes: z.record(z.string(), z.union([z.string(), z.number()])),
	dependencies: z.record(z.string(), z.string()),
}) satisfies z.ZodType<GenerationInputs>;

const ResultSchema = z.object({
	durationSec: z.number(),
	imageUrl: z.string().optional(),
	audioUrl: z.string().optional(),
	videoUrl: z.string().optional(),
	textTimestamps: z
		.array(z.object({ text: z.string(), start: z.number(), end: z.number() }))
		.optional(),
}) satisfies z.ZodType<AssetResult>;

const RowSchema = z.object({
	id: z.string(),
	element_id: z.string(),
	created_at: z.string(),
	connector_type: z.enum(ASSET_CONNECTOR_TYPES),
	inputs: InputsSchema,
	result: ResultSchema,
	pinned: z.boolean(),
});

const toVersion = (row: z.infer<typeof RowSchema>): ElementVersion => ({
	id: row.id,
	elementId: row.element_id,
	createdAt: row.created_at,
	connectorType: row.connector_type,
	inputs: row.inputs,
	result: row.result,
	pinned: row.pinned,
});

const toRow = (projectId: string, version: ElementVersion) => ({
	id: version.id,
	project_id: projectId,
	element_id: version.elementId,
	created_at: version.createdAt,
	connector_type: version.connectorType,
	inputs: version.inputs,
	result: version.result,
	pinned: version.pinned,
});

const COLUMNS =
	"id, element_id, created_at, connector_type, inputs, result, pinned";

/**
 * The `element_history` rows are untyped JSON to the client. Parse them once
 * here so the queue can trust what it hydrates from; a malformed row throws.
 */
export function parseElementVersions(rows: unknown): ElementVersion[] {
	return z
		.array(RowSchema)
		.parse(rows ?? [])
		.map(toVersion);
}

/** One element's takes, oldest first. */
export async function fetchElementVersions(
	projectId: string,
	elementId: string,
): Promise<ElementVersion[]> {
	const supabase = createClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select(COLUMNS)
		.eq("project_id", projectId)
		.eq("element_id", elementId)
		.order("created_at", { ascending: true });
	if (error) throw error;
	return parseElementVersions(data);
}

/**
 * A take is identified by the inputs that made it, so regenerating an unchanged
 * element overwrites the row it already has.
 */
export async function saveElementVersion(
	projectId: string,
	version: ElementVersion,
): Promise<void> {
	const { error } = await createClient()
		.from(TABLE)
		.upsert(toRow(projectId, version), { onConflict: "id" });
	if (error) throw error;
}

/** The project's history as the generation layer stores and reads it. */
export const elementHistoryStorage = (projectId: string): VersionStorage => ({
	read: (elementId) => fetchElementVersions(projectId, elementId),
	write: (version) =>
		saveElementVersion(projectId, version).catch((err: unknown) =>
			toastError(err, "Saving this take failed"),
		),
});
