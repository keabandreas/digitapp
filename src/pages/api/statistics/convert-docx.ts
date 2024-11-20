// src/pages/api/statistics/convert-docx.ts
import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import mammoth from 'mammoth';
import path from 'path';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function convertDocxToMarkdown(filePath: string): Promise<{ value: string, messages: any[] }> {
  try {
    const result = await mammoth.convertToHtml({
      path: filePath,
      options: {
        styleMap: [
          "p[style-name='Heading 1'] => h1",
          "p[style-name='Heading 2'] => h2",
          "p[style-name='Heading 3'] => h3",
          "r[style-name='Strong'] => strong"
        ]
      }
    });

    let html = result.value;
    console.log('Initial HTML:', html);

    // Clean up HTML
    html = html
      .replace(/<p>\s*<strong>/g, '<p><strong>')
      .replace(/<\/strong>\s*<\/p>/g, '</strong></p>')
      .replace(/<strong>\s+/g, '<strong>')
      .replace(/\s+<\/strong>/g, '</strong>');

    const TurndownService = require('turndown');
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      bulletListMarker: '*'
    });

    // Custom rule for strong tags
    turndownService.addRule('strong', {
      filter: 'strong',
      replacement: (content, node) => {
        // Don't wrap in ** if it's just whitespace/empty
        if (!content.trim()) return '';
        // Check if this is the beginning of a paragraph
        const isStartOfParagraph = !node.previousSibling || node.previousSibling.textContent.trim() === '';
        return isStartOfParagraph ? `**${content.trim()}**` : content;
      }
    });

    let markdown = turndownService.turndown(html);

    // Final cleanup
    markdown = markdown
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\*\*\s+/g, '**')
      .replace(/\s+\*\*/g, '**')
      .replace(/\\\\/g, '\\')
      .trim();

    return { value: markdown, messages: result.messages };
  } catch (error) {
    console.error('Conversion error:', error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('Starting document conversion request...');

  const uploadDir = path.join(process.cwd(), 'tmp', 'uploads');
  try {
    await fs.promises.mkdir(uploadDir, { recursive: true });
  } catch (err) {
    console.error('Error creating upload directory:', err);
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB limit
  });

  let filePath: string | null = null;

  try {
    console.log('Parsing form data...');
    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Form parsing error:', err);
          reject(err);
        } else {
          resolve([fields, files]);
        }
      });
    });

    console.log('File received:', files);

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    filePath = file.filepath;
    console.log('Converting file:', {
      originalName: file.originalFilename,
      filepath: file.filepath,
      size: file.size
    });

    try {
      const result = await convertDocxToMarkdown(file.filepath);

      if (!result.value || result.value.trim().length === 0) {
        console.error('Conversion produced empty content');
        return res.status(422).json({
          error: 'Document conversion failed',
          details: 'Conversion resulted in empty content'
        });
      }

      console.log('Conversion successful:', {
        contentLength: result.value.length,
        messageCount: result.messages.length
      });

      return res.status(200).json({
        content: result.value,
        messages: result.messages
      });

    } catch (conversionError) {
      console.error('Conversion error:', conversionError);
      return res.status(500).json({
        error: 'Error converting document',
        details: conversionError instanceof Error ? conversionError.message : 'Unknown error'
      });
    }
  } catch (error) {
    console.error('Upload handling error:', error);
    return res.status(500).json({
      error: 'Error handling upload',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    // Clean up temporary file
    if (filePath) {
      try {
        await fs.promises.unlink(filePath);
        console.log('Temporary file cleaned up:', filePath);
      } catch (cleanupError) {
        console.error('Error cleaning up temp file:', cleanupError);
      }
    }
  }
}