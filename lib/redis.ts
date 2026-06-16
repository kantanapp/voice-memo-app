import { Redis } from '@upstash/redis';

/**
 * Upstash Redis クライアント。
 * Vercel Marketplace の Upstash 連携は環境変数を自動注入する。
 * 命名が KV_REST_API_* / UPSTASH_REDIS_REST_* のどちらでも動くよう両対応。
 * 未接続（env 無し）の場合は null を返し、API 側で 503 を返す。
 */
export function getRedis(): Redis | null {
  const url =
    process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}
