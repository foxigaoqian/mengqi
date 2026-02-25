import type { CrawlResult, GeneratedResult } from '@/types/note';

async function getData() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/notes`, { cache: 'no-store' });

  if (!response.ok) {
    return { source: [], generated: [] } as { source: CrawlResult[]; generated: GeneratedResult[] };
  }

  return (await response.json()) as { source: CrawlResult[]; generated: GeneratedResult[] };
}

export default async function HistoryPage() {
  const data = await getData();

  return (
    <main>
      <h1>历史记录</h1>
      <div style={{ display: 'grid', gap: '1rem' }}>
        <section className="card">
          <h2>抓取记录</h2>
          <ul>
            {data.source?.map((item) => (
              <li key={item.id ?? item.url}>
                {item.title} - {item.url}
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2>生成记录</h2>
          <ul>
            {data.generated?.map((item) => (
              <li key={item.id ?? item.generated_text.slice(0, 12)}>
                {item.style} - {item.tags?.join(' ')}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
