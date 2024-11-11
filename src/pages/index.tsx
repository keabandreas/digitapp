// src/pages/index.tsx
import Head from 'next/head';
import NordicBackground from '@/components/dashboard/NordicBackground';
import BentoGrid from '@/components/dashboard/BentoGrid';

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>DigitAPP</title>
        <meta name="description" content="Modern dashboard interface" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
  
      <div className="relative min-h-screen w-full overflow-hidden bg-background">
        <NordicBackground />
        <div className="relative w-full p-6">
          <header className="max-w-6xl mx-auto flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-[#D8DEE9]/80 mt-2">
                Press <kbd className="px-1.5 py-0.5 rounded bg-[#4C566A] text-sm">Alt + 1-3</kbd> to open apps  or <kbd className="px-1.5 py-0.5 rounded bg-[#4C566A] text-sm">?</kbd> for shortcuts
              </p>
            </div>
          </header>

          <div className="max-w-6xl mx-auto">
            <BentoGrid />
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: hsl(var(--base-200));
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--base-300));
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--primary));
        }
      `}</style>
    </>
  );
}