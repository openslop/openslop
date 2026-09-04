import { v5 as uuidv5 } from "uuid";
import { z } from "zod";
import { CanvasElementTypeSchema } from "@/lib/canvas/types";
import { ASSET_CONNECTOR_TYPES } from "@/lib/connectors/types";
import type { ElementVersionStorage } from "@/lib/generation/history";
import { GenerationInputsSchema } from "@/lib/generation/inputs";
import { AssetResultSchema } from "@/lib/generation/snapshots";
import { versionKey, type ElementVersion } from "@/lib/generation/versions";
import { createClient } from "@/lib/supabase/client";
import { toastError } from "@/lib/toastError";

const TABLE = "element_history";

const RowSchema = z.object({
	element_id: z.string(),
	created_at: z.string(),
	connector_type: z.enum(ASSET_CONNECTOR_TYPES),
	element_type: CanvasElementTypeSchema.nullish(),
	inputs: GenerationInputsSchema,
	result: AssetResultSchema,
	pinned: z.boolean(),
});

const toVersion = (row: z.infer<typeof RowSchema>): ElementVersion => ({
	elementId: row.element_id,
	createdAt: row.created_at,
	connectorType: row.connector_type,
	elementType: row.element_type ?? undefined,
	inputs: row.inputs,
	result: row.result,
	pinned: row.pinned,
});

const toRow = (projectId: string, version: ElementVersion) => ({
	id: versionRowId(projectId, version),
	project_id: projectId,
	element_id: version.elementId,
	connector_type: version.connectorType,
	element_type: version.elementType ?? null,
	inputs: version.inputs,
	result: version.result,
	pinned: version.pinned,
});

const COLUMNS =
	"element_id, created_at, connector_type, element_type, inputs, result, pinned";

/** Changing this re-keys every row, so it is fixed for the table's lifetime. */
const ROW_ID_NAMESPACE = "5673ca03-e04d-4279-b92d-df493e2b9150";

/**
 * A version's row is identified by what made it, so the same version always
 * lands on the same row however little the client happens to have read back.
 */
const versionRowId = (projectId: string, version: ElementVersion): string =>
	uuidv5(
		[projectId, version.elementId, versionKey(version)].join("\u0000"),
		ROW_ID_NAMESPACE,
	);

export function parseElementVersions(rows: unknown): ElementVersion[] {
	return z
		.array(RowSchema)
		.parse(rows ?? [])
		.map(toVersion);
}

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
 * Regenerating an unchanged element overwrites the row that version already has.
 * `created_at` is left to the column default so a remake keeps its original
 * date rather than jumping to the top of the list.
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

export const elementHistoryStorage = (
	projectId: string,
): ElementVersionStorage => ({
	read: (elementId) => fetchElementVersions(projectId, elementId),
	write: (version) =>
		saveElementVersion(projectId, version).catch((err: unknown) =>
			toastError(err, "Saving this version failed"),
		),
});
