import { describe, expect, it, vi } from "vitest";
import { DEFAULT_MODELS } from "../models";

vi.mock("react", () => ({ useCallback: <T>(fn: T) => fn }));
vi.mock("@/lib/project/project-provider", () => ({
	useProjectId: () => "project-1",
}));
vi.mock("../factory", () => ({ createConnector: vi.fn() }));

import { createConnector } from "../factory";
import { useCreateConnector } from "../use-create-connector";

describe("useCreateConnector", () => {
	it("creates connectors booked to the open project", () => {
		useCreateConnector()("llm", DEFAULT_MODELS.llm);

		expect(createConnector).toHaveBeenCalledExactlyOnceWith(
			"llm",
			DEFAULT_MODELS.llm,
			"project-1",
		);
	});
});
