import type { VendorParams } from "@/lib/connectors/models";
import type { Caption } from "@remotion/captions";
import type { SourcedSTTParams } from "@/lib/connectors/types";
import type { RawResult } from "../base";

export type STTRequest = VendorParams<SourcedSTTParams>;

export type RawSTT = { textTimestamps: Caption[] } & RawResult;
