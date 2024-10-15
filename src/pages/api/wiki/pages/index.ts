import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

const WIKI_DIR = path.join(process.cwd(), 'src', 'pages', 'wiki');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      try {
        const files = await fs.readdir(WIKI_DIR);
        const pages = await Promise.all(
          files
            .filter(file => file.endsWith('.json'))
            .map(async file => {
              const content = await fs.readFile(path.join(WIKI_DIR, file), 'utf-8');
              return JSON.parse(content);
            })
        );
        res.status(200).json(pages);
      } catch (error) {
        console.error('Error reading wiki pages:', error);
        res.status(500).json({ message: 'Error reading wiki pages' });
      }
      break;

    case 'POST':
      try {
        const { title, content, category, subCategory } = req.body;
        const id = Date.now().toString();
        const newPage = { id, title, content, category, subCategory };
        await fs.writeFile(path.join(WIKI_DIR, `${id}.json`), JSON.stringify(newPage));
        res.status(201).json(newPage);
      } catch (error) {
        console.error('Error creating wiki page:', error);
        res.status(500).json({ message: 'Error creating wiki page' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
