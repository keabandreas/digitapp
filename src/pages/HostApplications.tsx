import React from 'react'
import Link from 'next/link'

export default function HostApplications() {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Link href="/" className="text-blue-600 hover:text-blue-800 mb-6 inline-block">
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Host Applications</h1>
        <p className="text-xl text-gray-600 mb-8">Manage your host applications here.</p>
        {/* Add more content for the Host Applications page */}
      </div>
    </div>
  )
}
