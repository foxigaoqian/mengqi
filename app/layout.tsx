import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI XHS Recreator',
  description: '抓取小红书笔记并一键生成可发布的新内容'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
