import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

export const config = {
  api: {
    bodyParser: false,
  },
}

const PYTHON_SERVER = process.env.NEXT_PUBLIC_HANDBRAKE_PYTHON_API_URL || 'http://172.20.96.20:5000'

// Helper to parse JSON body
async function parseJsonBody(req: NextApiRequest) {
  const buffers = []
  for await (const chunk of req) {
    buffers.push(chunk)
  }
  const data = Buffer.concat(buffers).toString()
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

async function getToken() {
  try {
    const response = await fetch(`${PYTHON_SERVER}/generate_token`, {
      signal: AbortSignal.timeout(5000)
    })
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to get authentication token: ${error}`)
    }
    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error('Token generation error:', error)
    if (error instanceof TypeError && error.message.includes('ECONNREFUSED')) {
      throw new Error('Unable to connect to Handbrake server. Please try again later.')
    }
    throw error
  }
}

const parseForm = async (req: NextApiRequest) => {
  const form = formidable({
    maxFileSize: 10 * 1024 * 1024 * 1024, // 10GB
    maxTotalFileSize: 10 * 1024 * 1024 * 1024, // 10GB
    allowEmptyFiles: false,
    multiples: false,
  });

  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
};

async function streamToBuffer(stream: fs.ReadStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')

  try {
    const token = await getToken()
    console.log('Action:', req.query.action)

    switch (req.query.action) {
      case 'upload_file': {
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed for this action' })
        }

        try {
          const { fields, files } = await parseForm(req);
          console.log('Form data:', { fields, files });

          const fileArray = Array.isArray(files.file) ? files.file : [files.file];
          const file = fileArray[0];
          const password = fields.password as string;

          if (!password) {
            return res.status(400).json({ error: "Password is required" });
          }

          if (!file || !file.filepath) {
            console.error('No file or filepath:', file);
            return res.status(400).json({ error: "No file provided" });
          }

          console.log('Uploading file:', file.originalFilename, 'from path:', file.filepath);

          // Read file content
          const fileBuffer = await fs.promises.readFile(file.filepath);

          // Create form data for upload
          const formData = new FormData();
          formData.append('file', new Blob([fileBuffer]), file.originalFilename || 'unnamed_file');
          formData.append('password', password);

          const uploadResponse = await fetch(`${PYTHON_SERVER}/upload_file`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });

          let data;
          try {
            data = await uploadResponse.json();
          } catch (e) {
            console.error('Failed to parse upload response:', e);
            return res.status(500).json({
              error: 'Upload failed',
              details: 'Invalid server response'
            });
          }

          // Clean up temp file
          try {
            await fs.promises.unlink(file.filepath);
          } catch (e) {
            console.error('Failed to cleanup temp file:', e);
          }

          if (!uploadResponse.ok) {
            console.error('Upload failed:', data);
            return res.status(uploadResponse.status).json(data);
          }

          return res.status(200).json(data);
        } catch (error) {
          console.error('File handling error:', error);
          return res.status(500).json({ 
            error: 'Upload failed', 
            details: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }

      case 'list_files': {
        const body = await parseJsonBody(req)
        if (!body?.password) {
          return res.status(400).json({ error: "Password is required" });
        }

        const response = await fetch(`${PYTHON_SERVER}/list_files`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            password: body.password
          })
        });

        let data;
        try {
          data = await response.json();
        } catch (e) {
          console.error('Failed to parse list_files response:', e);
          return res.status(500).json({
            error: 'Invalid response from server',
            details: 'Failed to parse server response'
          });
        }

        return res.status(response.status).json(data);
      }

      case 'list_presets': {
        const response = await fetch(`${PYTHON_SERVER}/list_presets`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        let data;
        try {
          data = await response.json();
        } catch (e) {
          console.error('Failed to parse list_presets response:', e);
          return res.status(500).json({
            error: 'Invalid response from server',
            details: 'Failed to parse server response'
          });
        }

        return res.status(response.status).json(data);
      }

      case 'process_file': {
        const body = await parseJsonBody(req)
        if (!body) {
          return res.status(400).json({ error: "Invalid request body" });
        }

        const response = await fetch(`${PYTHON_SERVER}/process_file`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });

        let data;
        try {
          data = await response.json();
        } catch (e) {
          console.error('Failed to parse process_file response:', e);
          return res.status(500).json({
            error: 'Invalid response from server',
            details: 'Failed to parse server response'
          });
        }

        return res.status(response.status).json(data);
      }

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Error in handbrake handler:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED') || error.message.includes('Unable to connect')) {
        return res.status(503).json({
          error: 'Service temporarily unavailable',
          details: 'Unable to connect to Handbrake server. Please try again later.'
        });
      }
      
      if (error.message.includes('timeout')) {
        return res.status(504).json({
          error: 'Service timeout',
          details: 'Request timed out. Please try again.'
        });
      }
    }

    return res.status(500).json({
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}