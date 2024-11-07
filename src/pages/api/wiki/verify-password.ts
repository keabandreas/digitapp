import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import { decryptPassword } from '@/lib/encryption'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { password } = req.body

    // Read the encrypted password from the file
    const encryptedPasswordPath = path.join(process.cwd(), 'secret', 'encrypted_password.txt')
    const encryptedPassword = fs.readFileSync(encryptedPasswordPath, 'utf8').trim()

    // Decrypt the password
    const correctPassword = decryptPassword(encryptedPassword)

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
