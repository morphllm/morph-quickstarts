import type { Metadata } from 'next';
import { Inter, Figtree } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

const figtree = Figtree({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-figtree',
  display: 'swap',
});

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
    <html lang="en" className={`${inter.variable} ${figtree.variable}`}>
      <body 
        className="antialiased bg-default-background font-inter"
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
} 