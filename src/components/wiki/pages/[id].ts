import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';
import { encryptPassword, decryptPassword } from '@/lib/encryption';

const WIKI_DIR = path.join(process.cwd(), 'src', 'components', 'wiki', 'articles');
const SECRETS_DIR = path.join(process.cwd(), 'secrets', 'wiki');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid page ID' });
  }

  const getFilePath = (isRestricted: boolean) => {
    return isRestricted ? path.join(SECRETS_DIR, `${id}.json`) : path.join(WIKI_DIR, `${id}.json`);
  };

  switch (req.method) {
    case 'GET':
      try {
        const filePath = getFilePath(req.query.isRestricted === 'true');
        const content = await fs.readFile(filePath, 'utf-8');
        const page = JSON.parse(req.query.isRestricted === 'true' ? decryptPassword(content) : content);
        res.status(200).json(page);
      } catch (error) {
        console.error(`Error reading wiki page ${id}:`, error);
        res.status(404).json({ message: 'Wiki page not found' });
      }
      break;

    case 'PUT':
      try {
        const updatedPage = req.body;
        const filePath = getFilePath(updatedPage.isRestricted);
        const content = updatedPage.isRestricted ? encryptPassword(JSON.stringify(updatedPage)) : JSON.stringify(updatedPage);
        await fs.writeFile(filePath, content);
        res.status(200).json(updatedPage);
      } catch (error) {
        console.error(`Error updating wiki page ${id}:`, error);
        res.status(500).json({ message: 'Error updating wiki page' });
      }
      break;

    case 'DELETE':
      try {
        const filePath = getFilePath(req.query.isRestricted === 'true');
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
