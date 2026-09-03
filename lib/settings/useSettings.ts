"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { z } from "zod";
import { PROVIDERS, type Provider } from "@/lib/connectors/types";

const tabSchema = z.enum(["models"]);

export type SettingsTab = z.infer<typeof tabSchema>;

/** Which provider the tab should open on, so a "connect" link lands on it. */
const providerSchema = z.enum(PROVIDERS);

const TAB_PARAM = "settings";
const PROVIDER_PARAM = "provider";

export type SettingsRoute = {
	tab: SettingsTab | null;
	provider: Provider | null;
	open: (tab: SettingsTab, provider?: Provider) => void;
	close: () => void;
};

const parse = <T>(schema: z.ZodType<T>, value: string | null): T | null =>
	schema.safeParse(value).data ?? null;

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
			provider: parse(providerSchema, params.get(PROVIDER_PARAM)),
			open: (tab, provider) => {
				const next = new URLSearchParams(params);
				next.set(TAB_PARAM, tab);
				if (provider) next.set(PROVIDER_PARAM, provider);
				else next.delete(PROVIDER_PARAM);
				navigate(next);
			},
			close: () => {
				const next = new URLSearchParams(params);
				next.delete(TAB_PARAM);
				next.delete(PROVIDER_PARAM);
				navigate(next);
			},
		}),
		[params, navigate],
	);
}
