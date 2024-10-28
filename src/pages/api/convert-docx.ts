import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import mammoth from 'mammoth'
import fs from 'fs'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const form = new formidable.IncomingForm()
  form.uploadDir = './uploads'
  form.keepExtensions = true

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err)
      return res.status(500).json({ message: 'Error processing file' })
    }

    const file = files.file as formidable.File
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    try {
      const result = await mammoth.convertToMarkdown({ path: file.filepath })
      const title = file.originalFilename?.replace(/\.docx$/, '') || 'Untitled Document'

      // Clean up the uploaded file
      fs.unlinkSync(file.filepath)

      res.status(200).json({ title, content: result.value })
    } catch (error) {
      console.error('Error converting file:', error)
      res.status(500).json({ message: 'Error converting file' })
    }
  })
}
