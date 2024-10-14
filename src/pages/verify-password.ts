import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { password } = req.body

    // Read the password from a file on the server
    const passwordFilePath = path.join(process.cwd(), 'secret', 'password.txt')
    const correctPassword = fs.readFileSync(passwordFilePath, 'utf8').trim()

    if (password === correctPassword) {
      res.status(200).json({ message: 'Password correct' })
    } else {
      res.status(401).json({ message: 'Incorrect password' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
