import { OpenSlopClient } from "@/lib/clients/openslop";
import { BaseProvider } from "./base";

export abstract class BaseOpenSlopProvider<
  TParams = unknown,
  TResult = unknown,
> extends BaseProvider<TParams, TResult> {
  protected client: OpenSlopClient;

  constructor(baseUrl?: string) {
    super();
    this.client = new OpenSlopClient(baseUrl);
  }
}
