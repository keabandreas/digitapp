import { NextApiRequest, NextApiResponse } from 'next';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        const categories = await getCategories();
        res.status(200).json(categories);
        break;

      case 'POST':
        const { name, parentId } = req.body;
        const newCategory = await createCategory(name, parentId);
        res.status(201).json(newCategory);
        break;

      case 'PUT':
        const { id, name: updateName } = req.body;
        await updateCategory(id, updateName);
        res.status(200).json({ message: 'Category updated' });
        break;

      case 'DELETE':
        await deleteCategory(Number(req.query.id));
        res.status(200).json({ message: 'Category deleted' });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Category API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}