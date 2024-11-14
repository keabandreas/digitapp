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
        
        {/* Main content container with consistent padding and width */}
        <div className="relative w-full min-h-screen px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl w-full"> {/* Constrain width for ultra-wide screens */}
            <header className="py-8">
              <div className="w-full">
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-sm">Alt + 1-3</kbd> to open apps or{' '}
                  <kbd className="px-1.5 py-0.5 rounded bg-muted text-sm">?</kbd> for shortcuts
                </p>
              </div>
            </header>

            {/* Grid container with consistent spacing */}
            <div className="w-full pb-8">
              <BentoGrid />
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: hsl(var(--muted));
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground));
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--primary));
        }
      `}</style>
    </>
  );
}