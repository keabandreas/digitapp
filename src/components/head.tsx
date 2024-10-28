import Head from 'next/head'

export default function CustomHead() {
  return (
    <Head>
      <title>Wiki</title>
      <link
        rel="stylesheet"
        href="https://unpkg.com/@tailwindcss/typography@0.5.9/dist/typography.min.css"
      />
    </Head>
  )
}
