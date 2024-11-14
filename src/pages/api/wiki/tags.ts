import { NextApiRequest, NextApiResponse } from 'next';
import { getTags, createTag, deleteTag, updateDocumentTags } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        const tags = await getTags();
        res.status(200).json(tags);
        break;

      case 'POST':
        const { name, color } = req.body;
        const newTag = await createTag(name, color);
        res.status(201).json(newTag);
        break;

      case 'DELETE':
        await deleteTag(Number(req.query.id));
        res.status(200).json({ message: 'Tag deleted' });
        break;

      case 'PATCH':
        const { documentId, tagIds } = req.body;
        await updateDocumentTags(documentId, tagIds);
        res.status(200).json({ message: 'Document tags updated' });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PATCH']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Tag API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}