import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const csvFilePath = path.join(process.cwd(), 'completions.csv')
  const { index } = req.body

  fs.readFile(csvFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err)
      return res.status(500).json({ error: 'Error reading CSV file' })
    }
    const rows = data.split('\n')
    if (index < 1 || index >= rows.length) {
      return res.status(400).json({ error: 'Invalid row index' })
    }
    rows.splice(index, 1)
    const updatedCsv = rows.join('\n')
    fs.writeFile(csvFilePath, updatedCsv, (err) => {
      if (err) {
        console.error('Error writing file:', err)
        return res.status(500).json({ error: 'Error updating CSV file' })
      }
      res.status(200).json({ message: 'Row removed successfully' })
    })
  })
}
