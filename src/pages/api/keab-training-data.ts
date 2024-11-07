// src/pages/api/keab-training-data.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const nodeServerUrl = process.env.NEXT_PUBLIC_SCRIPT_SERVER_URL;

  if (!nodeServerUrl) {
    return res.status(500).json({ error: 'Server URL not configured' });
  }

  try {
    const response = await fetch(`${nodeServerUrl}/api/keab-training-data`)
    const data = await response.text()
    
    if (!response.ok) {
      throw new Error(`Node server responded with status: ${response.status}`)
    }
    
    res.status(200).send(data)
  } catch (error) {
    console.error('API route error:', error)
    res.status(500).json({ error: 'Failed to fetch CSV data' })
  }
}