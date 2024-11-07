// src/pages/_app.tsx
import type { AppProps } from 'next/app'
import Layout from '@/components/layout'
import { ThemeProvider } from 'next-themes';
import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ThemeProvider>
  )
}
