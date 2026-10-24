import type { VendorParams } from "@/lib/connectors/models";
import type { SourcedSTTParams, TextTimestamp } from "@/lib/connectors/types";
import type { RawResult } from "../base";

export type STTRequest = VendorParams<SourcedSTTParams>;

export type RawSTT = { textTimestamps: TextTimestamp[] } & RawResult;
