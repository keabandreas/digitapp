// src/pages/_app.tsx
import type { AppProps } from 'next/app'
import Layout from '@/components/layout'
import { ThemeProvider } from 'next-themes'
import { WikiProvider } from '@/lib/context/WikiContext'
import { Toaster } from 'sonner';
import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <WikiProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </WikiProvider>
    </ThemeProvider>
  )
}
