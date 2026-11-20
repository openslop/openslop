import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../local-render", () => ({ localRender: { name: "local" } }));
vi.mock("../lambda-render", () => ({ lambdaRender: { name: "lambda" } }));

const { renderBackend } = await import("../render-backend");

describe("renderBackend", () => {
	afterEach(() => vi.unstubAllEnvs());

	it("renders on Lambda when hosted", async () => {
		expect(await renderBackend()).toEqual({ name: "lambda" });
	});

	it("renders on this machine in local mode", async () => {
		vi.stubEnv("NEXT_PUBLIC_OPENSLOP_LOCAL", "1");
		expect(await renderBackend()).toEqual({ name: "local" });
	});
});
