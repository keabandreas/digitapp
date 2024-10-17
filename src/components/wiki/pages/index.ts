import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';
import { encryptPassword, decryptPassword } from '@/lib/encryption';

const WIKI_DIR = path.join(process.cwd(), 'src', 'components', 'wiki', 'articles');
const SECRETS_DIR = path.join(process.cwd(), 'secret', 'wiki');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      try {
        const wikiFiles = await fs.readdir(WIKI_DIR);
        const secretFiles = await fs.readdir(SECRETS_DIR);

        const wikiPages = await Promise.all(
          wikiFiles
            .filter(file => file.endsWith('.json'))
            .map(async file => {
              const content = await fs.readFile(path.join(WIKI_DIR, file), 'utf-8');
              return JSON.parse(content);
            })
        );

        const secretPages = await Promise.all(
          secretFiles
            .filter(file => file.endsWith('.json'))
            .map(async file => {
              const content = await fs.readFile(path.join(SECRETS_DIR, file), 'utf-8');
              return JSON.parse(decryptPassword(content));
            })
        );

        const allPages = [...wikiPages, ...secretPages];
        res.status(200).json(allPages);
      } catch (error) {
        console.error('Error reading wiki pages:', error);
        res.status(500).json({ message: 'Error reading wiki pages' });
      }
      break;

    case 'POST':
      try {
        const { title, content, excerpt, category, subCategory, isRestricted } = req.body;
        const id = Date.now().toString();
        const newPage = { id, title, content, excerpt, category, subCategory, isRestricted };
        const filePath = isRestricted ? path.join(SECRETS_DIR, `${id}.json`) : path.join(WIKI_DIR, `${id}.json`);
        const fileContent = isRestricted ? encryptPassword(JSON.stringify(newPage)) : JSON.stringify(newPage);
        await fs.writeFile(filePath, fileContent);
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
