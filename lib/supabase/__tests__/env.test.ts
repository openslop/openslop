import { describe, expect, it, vi } from "vitest";
import { supabaseAnonKey, supabaseSecretKey, supabaseUrl } from "../env";

const CASES = [
	["NEXT_PUBLIC_SUPABASE_URL", supabaseUrl],
	["NEXT_PUBLIC_SUPABASE_ANON_KEY", supabaseAnonKey],
	["SUPABASE_SECRET_KEY", supabaseSecretKey],
] as const;

describe("supabase env", () => {
	it.each(CASES)("names %s when it is missing", (name, read) => {
		vi.stubEnv(name, undefined);
		expect(read).toThrow(name);
	});

	it.each(CASES)("returns %s when it is set", (name, read) => {
		vi.stubEnv(name, "value");
		expect(read()).toBe("value");
	});
});
