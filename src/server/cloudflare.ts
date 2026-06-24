import { env as runtimeEnv } from "cloudflare:workers";

export const getCloudflareEnv = (): CloudflareEnv =>
  runtimeEnv as unknown as CloudflareEnv; // oxlint-disable-line no-unsafe-type-assertion -- runtime boundary: cloudflare:workers env → CloudflareEnv
