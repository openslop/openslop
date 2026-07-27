import { apiFetch } from "@/lib/clients/http";

/** Dev-only: signs the current browser in as `email` via the impersonate route. */
export async function impersonateUser(email: string): Promise<void> {
	await apiFetch("/api/dev/impersonate", { params: { email } });
}
