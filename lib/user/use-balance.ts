"use client";

import { useLiveRead } from "@/lib/supabase/use-live-read";
import { readBalanceUsd } from "./balance";

const BALANCE_WATCHES = [
	{ table: "jobs", filter: "cost_usd=gt.0" },
	{ table: "funds" },
];

/** Undefined until the first read lands. */
export const useBalance = (): number | undefined =>
	useLiveRead(readBalanceUsd, BALANCE_WATCHES);
