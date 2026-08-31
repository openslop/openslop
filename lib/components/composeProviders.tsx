"use client";

import type { ComponentType, ReactNode } from "react";

type ProviderComponent = ComponentType<{ children: ReactNode }>;

/**
 * Nests context providers into one component, outermost first, so a provider
 * stack reads as a list instead of a pyramid. Providers that need props are
 * wrapped at their use site; this takes only the prop-free ones.
 */
export function composeProviders(
	...providers: ProviderComponent[]
): ProviderComponent {
	return function ComposedProviders({ children }: { children: ReactNode }) {
		return providers.reduceRight<ReactNode>(
			(tree, Provider) => <Provider>{tree}</Provider>,
			children,
		);
	};
}
