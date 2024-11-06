// pages/api/test_connection.ts
import type { NextApiRequest, NextApiResponse } from 'next'

const PYTHON_SERVER = 'http://172.20.96.22:5000'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const response = await fetch(PYTHON_SERVER)
    
    if (!response.ok) {
      throw new Error(`Python server returned ${response.status}`)
    }

    const data = await response.json()
    return res.status(200).json({ 
      message: 'Successfully connected to Python server', 
      serverResponse: data 
    })
  } catch (error) {
    console.error('Connection test failed:', error)
    return res.status(500).json({ 
      message: `Failed to connect to Python server: ${error}`,
      error: (error as Error).message
    })
  }
}
