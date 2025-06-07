import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Morph Demo - Document Editor',
  description: 'A Notion-like document editor with AI transformations powered by Plate.js and Morph',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-notion antialiased bg-white text-notion-gray-900">
        {children}
      </body>
    </html>
  );
} 