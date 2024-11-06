// pages/api/create_user.ts
import type { NextApiRequest, NextApiResponse } from 'next'

const PYTHON_SERVER = process.env.NEXT_PUBLIC_SFTP_PYTHON_API_URL || 'http://172.20.96.22:5000'

interface UserInfo {
  'First name': string;
  'Last name': string;
  'User Type': string;
  Department: string;
  Email: string;
  'Responsible internally email'?: string;
}

interface UserData {
  username: string;
  user_info: UserInfo;
  deletion_time?: string;
}

async function getToken() {
  try {
    const response = await fetch(`${PYTHON_SERVER}/generate_token`)
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to get authentication token: ${error}`)
    }
    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error('Token generation error:', error)
    throw error
  }
}

function validateUserData(data: any): { isValid: boolean; error?: string } {
  if (!data) {
    return { isValid: false, error: 'No data provided' }
  }

  // Validate username
  if (!data.username || typeof data.username !== 'string') {
    return { isValid: false, error: 'Username is required and must be a string' }
  }

  if (!/^[a-z0-9-_]+$/.test(data.username)) {
    return { isValid: false, error: 'Username can only contain lowercase letters, numbers, hyphens, and underscores' }
  }

  // Validate user_info
  if (!data.user_info || typeof data.user_info !== 'object') {
    return { isValid: false, error: 'user_info is required and must be an object' }
  }

  const requiredFields = ['First name', 'Last name', 'User Type', 'Department', 'Email']
  for (const field of requiredFields) {
    if (!data.user_info[field] || typeof data.user_info[field] !== 'string') {
      return { isValid: false, error: `${field} is required in user_info and must be a string` }
    }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.user_info.Email)) {
    return { isValid: false, error: 'Invalid email format' }
  }

  // Validate user type
  if (!['internal', 'external'].includes(data.user_info['User Type'].toLowerCase())) {
    return { isValid: false, error: 'User Type must be either "internal" or "external"' }
  }

  // Validate deletion_time if provided
  if (data.deletion_time !== undefined) {
    const deletion_time = parseInt(data.deletion_time)
    if (isNaN(deletion_time) || deletion_time < 0) {
      return { isValid: false, error: 'deletion_time must be a non-negative number or "0"' }
    }
  }

  return { isValid: true }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')

  // Method check
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Content-Type check
  if (!req.headers['content-type']?.includes('application/json')) {
    return res.status(400).json({ error: 'Content-Type must be application/json' })
  }

  try {
    const userData = req.body as UserData

    // Validate input data
    const validation = validateUserData(userData)
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error })
    }

    console.log('Attempting to get token...')
    const token = await getToken()
    console.log('Token received successfully')

    // Sanitize data before logging (remove password if present)
    const sanitizedData = { ...userData }
    if ('password' in sanitizedData) {
      delete (sanitizedData as any).password
    }
    console.log('Sending request to Python server with data:', sanitizedData)

    const response = await fetch(`${PYTHON_SERVER}/create_user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    })

    const data = await response.json()
    console.log('Python server response:', {
      ...data,
      // Remove sensitive data from logs
      details: data.details ? { ...data.details, password: undefined } : undefined
    })

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Python server error',
        details: data.error || data.message || 'Unknown error',
        pythonResponse: data
      })
    }

    // Success response
    res.status(200).json(data)

  } catch (error) {
    console.error('Error in create_user handler:', error)
    
    // Determine if error is network-related
    const isNetworkError = error instanceof Error && 
      (error.message.includes('fetch') || error.message.includes('network'))

    res.status(isNetworkError ? 503 : 500).json({ 
      error: isNetworkError ? 'Service temporarily unavailable' : 'Failed to create user',
      details: (error as Error).message,
      ...(process.env.NODE_ENV === 'development' && { stack: (error as Error).stack })
    })
  }
}
