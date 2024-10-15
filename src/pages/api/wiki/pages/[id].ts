import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

const WIKI_DIR = path.join(process.cwd(), 'src', 'pages', 'wiki');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      try {
        const content = await fs.readFile(path.join(WIKI_DIR, `${id}.json`), 'utf-8');
        res.status(200).json(JSON.parse(content));
      } catch (error) {
        console.error(`Error reading wiki page ${id}:`, error);
        res.status(404).json({ message: 'Wiki page not found' });
      }
      break;

    case 'PUT':
      try {
        const updatedPage = req.body;
        await fs.writeFile(path.join(WIKI_DIR, `${id}.json`), JSON.stringify(updatedPage));
        res.status(200).json(updatedPage);
      } catch (error) {
        console.error(`Error updating wiki page ${id}:`, error);
        res.status(500).json({ message: 'Error updating wiki page' });
      }
      break;

    case 'DELETE':
      try {
        await fs.unlink(path.join(WIKI_DIR, `${id}.json`));
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
