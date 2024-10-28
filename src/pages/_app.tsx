import type { AppProps } from 'next/app'
import Head from 'next/head'
import Layout from '@/components/layout'
import '@/styles/output.css'  // Changed from globals.css to output.css

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>digitAPP - Wiki</title>
        <meta name="description" content="Welcome to digitAPP's wiki system built with Next.js" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  )
}
