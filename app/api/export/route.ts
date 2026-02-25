import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      text?: string;
      tags?: string[];
      images?: string[];
    };

    if (!payload.text) {
      return NextResponse.json({ error: 'text 不能为空' }, { status: 400 });
    }

    const tags = payload.tags ?? [];
    const images = payload.images ?? [];

    const markdown = [payload.text, '', tags.join(' '), '', ...images.map((url) => `![image](${url})`].join('\n');

    return NextResponse.json({
      markdown,
      json: {
        text: payload.text,
        tags,
        images
      }
    });
  } catch {
    return NextResponse.json({ error: '导出失败' }, { status: 500 });
  }
}
