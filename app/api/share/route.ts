import { NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

const TTL_SECONDS = 60 * 60 * 24 * 7; // 7日
const MAX_BYTES = 1_000_000; // 約1MBまで
const ID_ALPHABET =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function genId(len = 10): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ID_ALPHABET[b % ID_ALPHABET.length]).join('');
}

export async function POST(req: Request) {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: 'storage_unconfigured' }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const memos = (body as { memos?: unknown })?.memos;
  if (!Array.isArray(memos) || memos.length === 0) {
    return NextResponse.json({ error: 'no_memos' }, { status: 400 });
  }
  if (JSON.stringify(memos).length > MAX_BYTES) {
    return NextResponse.json({ error: 'too_large' }, { status: 413 });
  }

  const id = genId();
  await redis.set(`share:${id}`, memos, { ex: TTL_SECONDS });

  return NextResponse.json({ id, expiresInDays: 7 });
}
