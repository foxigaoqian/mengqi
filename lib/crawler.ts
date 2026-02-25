import type { CrawlResult } from '@/types/note';

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function matchMetaContent(html: string, property: string) {
  const byProperty = new RegExp(`<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']+)["'][^>]*>`, 'i');
  const match = html.match(byProperty);
  return match?.[1] ?? '';
}

function matchTitle(html: string) {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match?.[1] ?? '未命名笔记';
}

function matchAllImages(html: string) {
  const regex = /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/gi;
  const images: string[] = [];
  let current = regex.exec(html);
  while (current) {
    images.push(current[1]);
    current = regex.exec(html);
  }
  return images;
}

export async function crawlXhsNote(url: string): Promise<CrawlResult> {
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });

  if (!response.ok) {
    throw new Error(`抓取失败：HTTP ${response.status}`);
  }

  const html = await response.text();
  const title = matchMetaContent(html, 'og:title') || matchTitle(html);
  const description = matchMetaContent(html, 'description') || matchMetaContent(html, 'og:description');
  const images = matchAllImages(html);

  return {
    url,
    title: normalizeText(title),
    content: normalizeText(description),
    images
  };
}
