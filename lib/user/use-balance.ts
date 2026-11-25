"use client";

import { useLiveRead } from "@/lib/supabase/use-live-read";
import { readBalanceUsd } from "./balance";

const BALANCE_WATCHES = [
	{ table: "jobs", filter: "cost_usd=gt.0" },
	{ table: "funds" },
];

/** $0 until the first read lands, and if it can't be read. */
export const useBalance = (): number =>
	useLiveRead(readBalanceUsd, BALANCE_WATCHES) ?? 0;
