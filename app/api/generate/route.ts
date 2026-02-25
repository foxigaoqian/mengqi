import { NextResponse } from 'next/server';
import { generateFromGemini } from '@/lib/gemini';
import { insertGeneratedNote } from '@/lib/supabase';
import type { CrawlResult } from '@/types/note';

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      source?: CrawlResult;
      style?: string;
      imageMode?: 'generate' | 'similar' | 'keep-original';
    };

    if (!payload.source?.url || !payload.source?.title) {
      return NextResponse.json({ error: '缺少 source 数据' }, { status: 400 });
    }

    const result = await generateFromGemini({
      source: payload.source,
      style: payload.style,
      imageMode: payload.imageMode
    });

    try {
      const saved = await insertGeneratedNote({
        source_note_id: payload.source.id,
        ...result
      });
      return NextResponse.json({ generated: saved });
    } catch (error) {
      return NextResponse.json(
        { generated: result, warning: 'Supabase 写入失败，返回内存结果', error: error instanceof Error ? error.message : '' },
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
