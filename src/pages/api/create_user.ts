import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const userData = req.body

  try {
    // Here, you would typically interact with your SFTP server or database
    // For this example, we'll just log the data and return a success message
    console.log('Received user data:', userData)

    // Simulate an API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Return a success response
    res.status(200).json({ message: 'User created successfully' })
  } catch (error) {
    console.error('Error creating user:', error)
    res.status(500).json({ error: 'Failed to create user' })
  }
}
