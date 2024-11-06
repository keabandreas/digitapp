import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

// Only disable body parser for file uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
      // Disable only for file upload endpoint
      ...((process => {
        switch(process.env.NODE_ENV) {
          case 'production':
            return { bodyParser: false }
          default:
            return process.env.NEXT_PUBLIC_API_MOCKING === 'enabled'
              ? {}
              : { bodyParser: false }
        }
      })(process))
    }
  },
}

const PYTHON_SERVER = process.env.NEXT_PUBLIC_HANDBRAKE_PYTHON_API_URL || 'http://172.20.96.20:5000'

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

const parseForm = async (req: NextApiRequest) => {
  const form = formidable({
    maxFileSize: 10 * 1024 * 1024 * 1024, // 10GB
    maxTotalFileSize: 10 * 1024 * 1024 * 1024, // 10GB
  });

  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
};

const getRequestBody = async (req: NextApiRequest) => {
  if (req.body) return req.body;

  // If body-parser is disabled, parse the raw body
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')

  try {
    const token = await getToken()
    console.log('Action:', req.query.action)  // Debug log

    switch (req.query.action) {
      case 'list_files': {
        const body = await getRequestBody(req);
        console.log('List files request body:', body)  // Debug log

        if (!body || !body.password) {
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

        const data = await response.json();
        console.log('Python server response:', data)  // Debug log
        return res.status(response.status).json(data);
      }

      case 'upload_file': {
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed for this action' })
        }

        const { fields, files } = await parseForm(req);
        const file = files.file as formidable.File;
        const password = fields.password as string;

        if (!password) {
          return res.status(400).json({ error: "Password is required" });
        }

        // Create multipart form data
        const formData = new FormData();
        formData.append('file', new Blob([fs.readFileSync(file.filepath)]), file.originalFilename);
        formData.append('password', password);

        const uploadResponse = await fetch(`${PYTHON_SERVER}/upload_file`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const responseData = await uploadResponse.json();

        // Clean up the temporary file
        fs.unlinkSync(file.filepath);

        if (!uploadResponse.ok) {
          throw new Error(responseData.error || 'Upload failed');
        }

        return res.status(200).json(responseData);
      }

      case 'list_presets': {
        const response = await fetch(`${PYTHON_SERVER}/list_presets`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        return res.status(response.status).json(data);
      }

      case 'process_file': {
        const body = await getRequestBody(req);
        console.log('Process file request body:', body)  // Debug log

        if (!body || !body.password) {
          return res.status(400).json({ error: "Password is required" });
        }

        const response = await fetch(`${PYTHON_SERVER}/process_file`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });

        const data = await response.json();
        return res.status(response.status).json(data);
      }

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

  } catch (error) {
    console.error('Error in handbrake handler:', error);
    return res.status(500).json({
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
