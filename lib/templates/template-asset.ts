import { BLOB_BASE_URL } from "@/lib/blob";

export const templateAsset = (name: string) =>
	`${BLOB_BASE_URL}/assets/upload/template/${name}`;
