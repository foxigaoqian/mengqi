import { NextResponse } from 'next/server';
import { crawlXhsNote } from '@/lib/crawler';
import { insertSourceNote } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { url?: string };
    if (!payload.url || !payload.url.startsWith('http')) {
      return NextResponse.json({ error: '请提供合法 URL' }, { status: 400 });
    }

    const note = await crawlXhsNote(payload.url);

    try {
      const saved = await insertSourceNote(note);
      return NextResponse.json({ note: saved });
    } catch (error) {
      return NextResponse.json(
        { note, warning: 'Supabase 写入失败，返回内存结果', error: error instanceof Error ? error.message : '' },
        { status: 207 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
