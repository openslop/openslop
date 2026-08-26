import { afterEach, describe, expect, it } from "vitest";
import { supabaseAnonKey, supabaseSecretKey, supabaseUrl } from "../env";

const CASES = [
	["NEXT_PUBLIC_SUPABASE_URL", supabaseUrl],
	["NEXT_PUBLIC_SUPABASE_ANON_KEY", supabaseAnonKey],
	["SUPABASE_SECRET_KEY", supabaseSecretKey],
] as const;

const original = Object.fromEntries(
	CASES.map(([name]) => [name, process.env[name]]),
);

afterEach(() => {
	for (const [name, value] of Object.entries(original)) {
		if (value === undefined) delete process.env[name];
		else process.env[name] = value;
	}
});

describe("supabase env", () => {
	it.each(CASES)("names %s when it is missing", (name, read) => {
		delete process.env[name];
		expect(read).toThrow(name);
	});

	it.each(CASES)("returns %s when it is set", (name, read) => {
		process.env[name] = "value";
		expect(read()).toBe("value");
	});
});
