import type { ImageGenerateParams } from "@/lib/connectors/types";
import { BLOB_BASE_URL } from "@/lib/blob";
import { MockProvider } from "../mock-base";

const BLOB_BASE = `${BLOB_BASE_URL}/assets/image/mock`;

export class MockImage extends MockProvider<ImageGenerateParams> {
	protected readonly delayMs = 2000;
	protected readonly variants = [
		{ id: "1", result: { image: `${BLOB_BASE}/1/output.webp` } },
		{ id: "2", result: { image: `${BLOB_BASE}/2/output.jpg` } },
		{ id: "3", result: { image: `${BLOB_BASE}/3/output.png` } },
	];
}
