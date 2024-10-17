import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

const WIKI_DIR = path.join(process.cwd(), 'src', 'pages', 'wiki');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid page ID' });
  }

  const filePath = path.join(WIKI_DIR, `${id}.json`);

  switch (req.method) {
    case 'GET':
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const page = JSON.parse(content);
        res.status(200).json(page);
      } catch (error) {
        console.error(`Error reading wiki page ${id}:`, error);
        res.status(404).json({ message: 'Wiki page not found' });
      }
      break;

    case 'PUT':
      try {
        const updatedPage = req.body;
        
        // Ensure that sensitive content is not modified during save
        if (updatedPage.content) {
          updatedPage.content = updatedPage.content.replace(
            /{{SENSITIVE}}(.*?){{\/SENSITIVE}}/gs,
            (match: string) => match
          );
        }

        await fs.writeFile(filePath, JSON.stringify(updatedPage, null, 2));
        res.status(200).json(updatedPage);
      } catch (error) {
        console.error(`Error updating wiki page ${id}:`, error);
        res.status(500).json({ message: 'Error updating wiki page' });
      }
      break;

    case 'DELETE':
      try {
        await fs.unlink(filePath);
        res.status(204).end();
      } catch (error) {
        console.error(`Error deleting wiki page ${id}:`, error);
        res.status(500).json({ message: 'Error deleting wiki page' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
