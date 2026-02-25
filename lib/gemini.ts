import type { GenerationRequest, GeneratedResult } from '@/types/note';

function fallbackGenerate({ source, style, imageMode }: GenerationRequest): GeneratedResult {
  const tags = ['#小红书', '#内容创作', '#AI写作'];
  const generatedText = [
    `【${style ?? '真实分享风'}】`,
    `最近体验了一个和「${source.title}」同主题的新思路，整理成更易发布的版本给你：`,
    '',
    source.content || '这是一篇根据原笔记主题重写的内容，语义保持一致，表达更具结构化。',
    '',
    '📌 重点总结：',
    '1. 保持核心观点不变',
    '2. 使用更清晰的小标题和分段',
    '3. 补充可执行建议与互动引导'
  ].join('\n');

  return {
    generated_text: generatedText,
    generated_images: imageMode === 'keep-original' ? source.images : [],
    tags,
    style: style ?? '真实分享风'
  };
}

export async function generateFromGemini(request: GenerationRequest): Promise<GeneratedResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return fallbackGenerate(request);
  }

  const prompt = `你是小红书内容创作助手，请在不改变主题的前提下重写内容，并输出 JSON：\n{
  "generated_text": string,
  "tags": string[],
  "style": string
}\n重写风格：${request.style ?? '真实分享风'}\n原始标题：${request.source.title}\n原始正文：${request.source.content}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }]
        })
      }
    );

    if (!response.ok) {
      return fallbackGenerate(request);
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return fallbackGenerate(request);
    }

    const jsonText = text.replace(/^```json\n?/, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(jsonText) as {
      generated_text: string;
      tags: string[];
      style: string;
    };

    return {
      generated_text: parsed.generated_text,
      generated_images: request.imageMode === 'keep-original' ? request.source.images : [],
      tags: parsed.tags,
      style: parsed.style
    };
  } catch {
    return fallbackGenerate(request);
  }
}
