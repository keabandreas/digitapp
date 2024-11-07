import type { NextApiRequest, NextApiResponse } from 'next'
import { API_URL } from '@/config'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await fetch(`${API_URL}/api/statistics/keab-training-data`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.text();
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch CSV data' });
  }
}
