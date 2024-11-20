// src/pages/api/wiki/categories.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        const categories = await prisma.category.findMany({
          orderBy: {
            order: 'asc'
          }
        });
        
        if (!categories.length) {
          // Ensure at least 'General' category exists
          await prisma.category.upsert({
            where: { name: 'General' },
            update: {},
            create: {
              name: 'General',
              order: 0
            }
          });
          return res.status(200).json([{ id: 1, name: 'General', order: 0, parentId: null }]);
        }
        
        return res.status(200).json(categories);

      case 'POST':
        const { name, parentId } = req.body;
        if (!name) {
          return res.status(400).json({ error: 'Name is required' });
        }

        const maxOrder = await prisma.category.aggregate({
          _max: {
            order: true
          }
        });

        const newCategory = await prisma.category.create({
          data: {
            name,
            parentId: parentId || null,
            order: (maxOrder._max.order || 0) + 1
          }
        });

        return res.status(201).json(newCategory);

      case 'PUT':
        const { id, name: updateName } = req.body;
        if (!id || !updateName) {
          return res.status(400).json({ error: 'ID and name are required' });
        }

        const updatedCategory = await prisma.category.update({
          where: { id: Number(id) },
          data: { name: updateName }
        });

        return res.status(200).json(updatedCategory);

      case 'DELETE':
        const categoryId = Number(req.query.id);
        if (!categoryId) {
          return res.status(400).json({ error: 'ID is required' });
        }

        // First, move any documents in this category to 'General'
        await prisma.document.updateMany({
          where: { 
            category: {
              equals: (await prisma.category.findUnique({
                where: { id: categoryId }
              }))?.name
            }
          },
          data: { category: 'General' }
        });

        // Then delete the category
        await prisma.category.delete({
          where: { id: categoryId }
        });

        return res.status(200).json({ message: 'Category deleted' });

      case 'PATCH':
        const { id: patchId, order: newOrder } = req.body;
        if (!patchId || typeof newOrder !== 'number') {
          return res.status(400).json({ error: 'ID and order are required' });
        }

        const patchedCategory = await prisma.category.update({
          where: { id: Number(patchId) },
          data: { order: newOrder }
        });

        return res.status(200).json(patchedCategory);

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Categories API error:', error);

    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Category name must be unique' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Category not found' });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
}