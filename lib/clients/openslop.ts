import { createClient } from "@/lib/supabase/client";

export class OpenSlopClient {
  private baseUrl: string;
  private supabase = createClient();

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || "";
  }

  private async headers(): Promise<Record<string, string>> {
    const h: Record<string, string> = { "content-type": "application/json" };
    const {
      data: { session },
    } = await this.supabase.auth.getSession();
    if (session?.access_token)
      h["authorization"] = `Bearer ${session.access_token}`;
    return h;
  }

  private async request(
    method: string,
    url: string,
    body?: unknown,
  ): Promise<Response> {
    const res = await fetch(url, {
      method,
      headers: await this.headers(),
      ...(body !== undefined && { body: JSON.stringify(body) }),
    });
    if (!res.ok)
      throw new Error(`OpenSlop API error: ${res.status} ${res.statusText}`);
    return res;
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const res = await this.request("POST", `${this.baseUrl}${path}`, body);
    return res.json() as Promise<T>;
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    let url = `${this.baseUrl}${path}`;
    if (params) {
      const qs = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined),
      ).toString();
      if (qs) url += `?${qs}`;
    }
    const res = await this.request("GET", url);
    return res.json() as Promise<T>;
  }

  async postBinary(path: string, body: unknown): Promise<ArrayBuffer> {
    const res = await this.request("POST", `${this.baseUrl}${path}`, body);
    return res.arrayBuffer();
  }

  async postStream(path: string, body: unknown): Promise<Response> {
    return this.request("POST", `${this.baseUrl}${path}`, body);
  }
}
