"use client";

import { useSyncExternalStore } from "react";

export const noSubscription = () => () => {};

/** A value only the browser knows. The server, and hydration, render `onServer`. */
export const useClientValue = <T>(read: () => T, onServer: T): T =>
	useSyncExternalStore(noSubscription, read, () => onServer);
