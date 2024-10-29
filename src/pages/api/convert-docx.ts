import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import mammoth from 'mammoth'
import TurndownService from 'turndown'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const form = formidable()

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err)
      return res.status(500).json({ error: 'Error processing file upload' })
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    try {
      // Convert DOCX to HTML
      const result = await mammoth.convertToHtml({ path: file.filepath })
      const htmlContent = result.value

      // Configure Turndown service
      const turndownService = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced',
        bulletListMarker: '-',
        emDelimiter: '_'
      })

      // Add a custom rule to handle bold text and line breaks
      turndownService.addRule('handleBoldAndLineBreaks', {
        filter: ['strong', 'b', 'p'],
        replacement: function(content, node, options) {
          if (node.nodeName === 'P') {
            // For paragraphs, ensure there's no extra line break at the end
            return content.trim() + '\n\n'
          } else {
            // For bold text, ensure it's on the same line
            return options.strongDelimiter + content.trim() + options.strongDelimiter + ' '
          }
        }
      })

      // Convert HTML to Markdown
      let markdownContent = turndownService.turndown(htmlContent)

      // Post-processing to fix any remaining issues
      markdownContent = markdownContent
        .replace(/\*\*\n/g, '**') // Remove line breaks immediately after bold opening
        .replace(/\n\*\*/g, '**') // Remove line breaks immediately before bold closing
        .replace(/\n\n+/g, '\n\n') // Replace multiple consecutive line breaks with just two

      res.status(200).json({ 
        message: 'File converted successfully', 
        content: markdownContent
      })
    } catch (error) {
      console.error('Error converting file:', error)
      res.status(500).json({ error: 'Error converting file' })
    }
  })
}
