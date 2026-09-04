/** A store's subscription list, shaped for `useSyncExternalStore`. */
export interface Emitter<T = void> {
	subscribe: (listener: (payload: T) => void) => () => void;
	notify: (payload: T) => void;
}

export function createEmitter<T = void>(): Emitter<T> {
	const listeners = new Set<(payload: T) => void>();
	return {
		subscribe: (listener) => {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		},
		notify: (payload) => {
			for (const listener of listeners) listener(payload);
		},
	};
}
