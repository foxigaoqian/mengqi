const sql = `-- source notes
create table if not exists public.source_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  url text not null,
  title text not null,
  content text,
  images jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- generated notes
create table if not exists public.generated_notes (
  id uuid primary key default gen_random_uuid(),
  source_note_id uuid references public.source_notes(id) on delete set null,
  generated_text text not null,
  generated_images jsonb not null default '[]'::jsonb,
  tags jsonb not null default '[]'::jsonb,
  style text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_source_notes_created_at on public.source_notes(created_at desc);
create index if not exists idx_generated_notes_created_at on public.generated_notes(created_at desc);
`;

export default function CreatePage() {
  return (
    <main>
      <h1>Supabase 初始化 SQL</h1>
      <section className="card">
        <p>将以下 SQL 粘贴到 Supabase SQL Editor 执行。</p>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{sql}</pre>
      </section>
    </main>
  );
}
