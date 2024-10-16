import React from 'react'
import Head from 'next/head'

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>Dashboard | Your App Name</title>
        <meta name="description" content="Welcome to your dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
        <main className="flex-1 overflow-auto p-6">
        </main>
      </div>
    </>
  )
}
