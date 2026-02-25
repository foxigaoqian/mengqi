import { NextResponse } from 'next/server';
import { getRecentNotes } from '@/lib/supabase';

export async function GET() {
  try {
    const data = await getRecentNotes();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        source: [],
        generated: [],
        warning: error instanceof Error ? error.message : '未知错误'
      },
      { status: 207 }
    );
  }
}
