// src/pages/api/statistics/remove-csv-row.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const nodeServerUrl = process.env.NEXT_PUBLIC_SCRIPT_SERVER_URL;

  if (!nodeServerUrl) {
    return res.status(500).json({ error: 'Server URL not configured' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch(`${nodeServerUrl}/api/statistics/remove-csv-row`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('API route error:', error);
    res.status(500).json({ error: 'Failed to remove CSV row' });
  }
}
