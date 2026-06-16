import { NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: 'storage_unconfigured' }, { status: 503 });
  }

  const { id } = await params;
  if (!id || !/^[A-Za-z0-9]{4,32}$/.test(id)) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400 });
  }

  const memos = await redis.get(`share:${id}`);
  if (!memos) {
    // 期限切れ or 存在しない
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  return NextResponse.json({ memos });
}
