import type { CrawlResult, GeneratedResult } from '@/types/note';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

type TableName = 'source_notes' | 'generated_notes';

async function callSupabase<T>(table: TableName, method: 'GET' | 'POST', body?: unknown) {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase env vars are missing');
  }

  const url = method === 'GET' ? `${supabaseUrl}/rest/v1/${table}?select=*` : `${supabaseUrl}/rest/v1/${table}`;

  const response = await fetch(url, {
    method,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: method === 'POST' ? 'return=representation' : 'count=exact'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const payload = await response.json();

  if (!response.ok) {
    const message = typeof payload?.message === 'string' ? payload.message : 'Supabase API 请求失败';
    throw new Error(message);
  }

  return payload as T;
}

export async function insertSourceNote(note: CrawlResult) {
  const rows = await callSupabase<CrawlResult[]>('source_notes', 'POST', note);
  return rows[0];
}

export async function insertGeneratedNote(note: GeneratedResult & { source_note_id?: string }) {
  const rows = await callSupabase<GeneratedResult[]>('generated_notes', 'POST', note);
  return rows[0];
}

export async function getRecentNotes() {
  const [source, generated] = await Promise.all([
    callSupabase<CrawlResult[]>('source_notes', 'GET'),
    callSupabase<GeneratedResult[]>('generated_notes', 'GET')
  ]);

  return { source, generated };
}
