import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const csvFilePath = path.join(process.cwd(), 'completions.csv')

  fs.readFile(csvFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err)
      return res.status(500).json({ error: 'Error reading file' })
    }
    res.status(200).send(data)
  })
}
