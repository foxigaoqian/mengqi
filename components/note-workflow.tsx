'use client';

import { useMemo, useState } from 'react';
import type { CrawlResult, GeneratedResult } from '@/types/note';

const defaultStyle = '真实分享风';

export function NoteWorkflow() {
  const [url, setUrl] = useState('');
  const [style, setStyle] = useState(defaultStyle);
  const [imageMode, setImageMode] = useState<'generate' | 'similar' | 'keep-original'>('keep-original');
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<CrawlResult | null>(null);
  const [generated, setGenerated] = useState<GeneratedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => url.trim().startsWith('http'), [url]);

  async function onGenerate() {
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    try {
      const crawlResp = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const crawlData = (await crawlResp.json()) as { note?: CrawlResult; error?: string };

      if (!crawlResp.ok || !crawlData.note) {
        throw new Error(crawlData.error ?? '抓取失败');
      }
      setSource(crawlData.note);

      const genResp = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: crawlData.note, style, imageMode })
      });
      const genData = (await genResp.json()) as { generated?: GeneratedResult; error?: string };

      if (!genResp.ok || !genData.generated) {
        throw new Error(genData.error ?? '生成失败');
      }

      setGenerated(genData.generated);
    } catch (err) {
      setError(err instanceof Error ? err.message : '流程失败');
    } finally {
      setLoading(false);
    }
  }

  async function copyResult() {
    if (!generated) return;
    const fullText = `${generated.generated_text}\n\n${generated.tags.join(' ')}`;
    await navigator.clipboard.writeText(fullText);
  }

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <section className="card">
        <h2>1) 输入小红书链接</h2>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <div>
            <label htmlFor="url">笔记链接</label>
            <input
              id="url"
              placeholder="https://www.xiaohongshu.com/..."
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="style">重写风格</label>
            <input id="style" value={style} onChange={(event) => setStyle(event.target.value)} />
          </div>
          <div>
            <label htmlFor="imageMode">图像策略</label>
            <select
              id="imageMode"
              value={imageMode}
              onChange={(event) => setImageMode(event.target.value as 'generate' | 'similar' | 'keep-original')}
            >
              <option value="generate">Gemini 重新生成图像</option>
              <option value="similar">基于原图风格相似生成</option>
              <option value="keep-original">保留原图用于参考</option>
            </select>
          </div>
          <button
            style={{
              background: '#111827',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '0.75rem 1rem'
            }}
            disabled={!canSubmit || loading}
            onClick={onGenerate}
          >
            {loading ? '处理中...' : '抓取并生成'}
          </button>
          {error && <p style={{ color: '#dc2626' }}>{error}</p>}
        </div>
      </section>

      {source && (
        <section className="card">
          <h2>2) 抓取结果</h2>
          <p>
            <strong>标题：</strong>
            {source.title}
          </p>
          <p>
            <strong>正文：</strong>
            {source.content || '未抓取到正文，可继续尝试生成'}
          </p>
          <p>
            <strong>图片数量：</strong>
            {source.images.length}
          </p>
        </section>
      )}

      {generated && (
        <section className="card">
          <h2>3) 生成结果（可直接发布）</h2>
          <pre style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{generated.generated_text}</pre>
          <p>
            <strong>推荐标签：</strong>
            {generated.tags.join(' ')}
          </p>
          <button
            onClick={copyResult}
            style={{
              border: '1px solid #111827',
              background: 'transparent',
              borderRadius: 10,
              padding: '0.5rem 0.8rem'
            }}
          >
            复制文案
          </button>
        </section>
      )}
    </div>
  );
}
