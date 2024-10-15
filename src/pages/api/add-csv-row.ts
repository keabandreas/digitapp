import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const csvFilePath = path.join(process.cwd(), 'completions.csv')
  const newRow = Object.values(req.body).join(',') + '\n'

  fs.appendFile(csvFilePath, newRow, (err) => {
    if (err) {
      console.error('Error appending to file:', err)
      return res.status(500).json({ error: 'Error adding row to CSV' })
    }
    res.status(200).json({ message: 'Row added successfully' })
  })
}
