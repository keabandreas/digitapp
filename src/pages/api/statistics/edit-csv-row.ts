// src/pages/api/statistics/edit-csv-row.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const nodeServerUrl = process.env.NEXT_PUBLIC_SCRIPT_SERVER_URL;

  if (!nodeServerUrl) {
    return res.status(500).json({ error: 'Server URL not configured' });
  }

  try {
    const response = await fetch(`${nodeServerUrl}/api/statistics/edit-csv-row`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    
    if (!response.ok) {
      throw new Error(`Node server responded with status: ${response.status}`);
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('API route error:', error);
    res.status(500).json({ error: 'Failed to edit CSV row' });
  }
}
