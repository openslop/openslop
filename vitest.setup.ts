import { vi } from "vitest";

vi.mock("@/lib/supabase/client", () => ({
	createClient: () => ({
		auth: {
			getSession: () => Promise.resolve({ data: { session: null } }),
		},
	}),
}));

vi.mock("next/headers", async (importOriginal) => ({
	...(await importOriginal<typeof import("next/headers")>()),
	headers: async () => new Headers(),
}));
