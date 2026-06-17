import React from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <header className="border-b border-zinc-800 p-4">
        <h1 className="text-xl font-bold text-amber-500">PR Store Admin ERP</h1>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
