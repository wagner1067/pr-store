import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PR Store',
  description: 'PR Store — Moda Masculina e Acessórios Premium',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
