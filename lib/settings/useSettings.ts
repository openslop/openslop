"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { z } from "zod";
import { BYOK_PROVIDERS } from "@/lib/connectors/providerCatalog";
import type { ProviderKey } from "@/lib/connectors/types";

/** The tabs account settings offers. */
const tabSchema = z.enum(["connectors"]);

export type SettingsTab = z.infer<typeof tabSchema>;

/** Which connector the tab should open on, so a "connect" link lands on it. */
const connectorSchema = z.enum(
	BYOK_PROVIDERS as [ProviderKey, ...ProviderKey[]],
);

const TAB_PARAM = "settings";
const CONNECTOR_PARAM = "connector";

export type SettingsRoute = {
	tab: SettingsTab | null;
	connector: ProviderKey | null;
	open: (tab: SettingsTab, connector?: ProviderKey) => void;
	close: () => void;
};

const parse = <T>(schema: z.ZodType<T>, value: string | null): T | null => {
	const result = schema.safeParse(value);
	return result.success ? result.data : null;
};

/**
 * Settings live in the URL, so every way in is the same way: a menu item, a
 * "connect" affordance next to a model, and a pasted link all just navigate.
 */
export function useSettings(): SettingsRoute {
	const router = useRouter();
	const pathname = usePathname();
	const params = useSearchParams();

	const navigate = useCallback(
		(next: URLSearchParams) => {
			const query = next.toString();
			router.replace(query ? `${pathname}?${query}` : pathname, {
				scroll: false,
			});
		},
		[router, pathname],
	);

	return useMemo(
		() => ({
			tab: parse(tabSchema, params.get(TAB_PARAM)),
			connector: parse(connectorSchema, params.get(CONNECTOR_PARAM)),
			open: (tab, connector) => {
				const next = new URLSearchParams(params);
				next.set(TAB_PARAM, tab);
				if (connector) next.set(CONNECTOR_PARAM, connector);
				else next.delete(CONNECTOR_PARAM);
				navigate(next);
			},
			close: () => {
				const next = new URLSearchParams(params);
				next.delete(TAB_PARAM);
				next.delete(CONNECTOR_PARAM);
				navigate(next);
			},
		}),
		[params, navigate],
	);
}
