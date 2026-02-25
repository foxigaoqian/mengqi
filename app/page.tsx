import Link from 'next/link';
import { NoteWorkflow } from '@/components/note-workflow';
import { getMissingEnvVars } from '@/lib/env';

export default function HomePage() {
  const missingVars = getMissingEnvVars();

  return (
    <main>
      <header style={{ marginBottom: '1rem' }}>
        <h1>AI XHS Recreator</h1>
        <p>输入小红书链接，一键抓取并生成可发布新笔记。</p>
        <p style={{ display: 'flex', gap: 12 }}>
          <Link href="/history">查看历史记录</Link>
          <Link href="/create">数据库初始化 SQL</Link>
        </p>
      </header>

      {missingVars.length > 0 && (
        <p style={{ color: '#b45309' }}>
          当前缺失环境变量：{missingVars.join(', ')}。可以先体验 mock 流程，部署前请补齐。
        </p>
      )}

      <NoteWorkflow />
    </main>
  );
}
