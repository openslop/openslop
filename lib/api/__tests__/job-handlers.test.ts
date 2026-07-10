import { describe, expect, it, vi } from "vitest";

vi.mock("../providers", () => {
	const noopProvider = () => ({ generate: vi.fn(), poll: vi.fn() });
	return {
		getVideoProvider: noopProvider,
		getImageProvider: noopProvider,
		getMusicProvider: noopProvider,
		getSFXProvider: noopProvider,
		getTTSProvider: noopProvider,
	};
});

import { rowView } from "../job-handlers";
import type { JobRow } from "../jobs";

function makeRow(overrides: Partial<JobRow>): JobRow {
	return {
		id: "job-1",
		user_id: "u1",
		project_id: null,
		connector_type: "video",
		status: "failed",
		request: {},
		result: null,
		metadata: {},
		error: "Upload failed",
		created_at: "",
		updated_at: "",
		...overrides,
	};
}

describe("rowView", () => {
	it("surfaces errorDetail persisted in the job's metadata", () => {
		const errorDetail = { error: { code: "invalidValueUploadFailed" } };
		const view = rowView(makeRow({ metadata: { errorDetail } }));

		expect(view.error).toBe("Upload failed");
		expect(view.errorDetail).toBe(errorDetail);
	});

	it("leaves errorDetail undefined when metadata has none", () => {
		const view = rowView(makeRow({ metadata: { providerJobId: "p1" } }));
		expect(view.errorDetail).toBeUndefined();
	});
});
