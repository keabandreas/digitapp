import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb'
    },
    responseLimit: false
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  try {
    switch (req.method) {
      case 'GET':
        if (id) {
          const document = await prisma.document.findUnique({
            where: { id: parseInt(id as string) }
          });

          if (!document) {
            return res.status(404).json({ error: 'Document not found' });
          }

          return res.status(200).json(document);
        } else {
          const documents = await prisma.document.findMany({
            orderBy: { updatedAt: 'desc' }
          });
          return res.status(200).json(documents);
        }

      case 'POST':
        const { title, content, restricted, category } = req.body;

        if (!title) {
          return res.status(400).json({ error: 'Title is required' });
        }

        const newDocument = await prisma.document.create({
          data: {
            title,
            content: content || '',
            restricted: restricted || false,
            category: category || 'General'
          }
        });

        return res.status(201).json(newDocument);

      case 'PUT':
        if (!id) {
          return res.status(400).json({ error: 'Document ID is required' });
        }

        const updates = req.body;
        const documentId = parseInt(id as string);

        const existingDoc = await prisma.document.findUnique({
          where: { id: documentId }
        });

        if (!existingDoc) {
          return res.status(404).json({ error: 'Document not found' });
        }

        const updatedDocument = await prisma.document.update({
          where: { id: documentId },
          data: {
            title: updates.title ?? existingDoc.title,
            content: updates.content ?? existingDoc.content,
            category: updates.category ?? existingDoc.category,
            restricted: updates.restricted ?? existingDoc.restricted,
            updatedAt: new Date()
          }
        });

        return res.status(200).json(updatedDocument);

      case 'DELETE':
        if (!id) {
          return res.status(400).json({ error: 'Document ID is required' });
        }

        await prisma.document.delete({
          where: { id: parseInt(id as string) }
        });

        return res.status(200).json({ message: 'Document deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API error:', error);
    
    if ((error as any).code === 'P2025') {
      return res.status(404).json({ error: 'Document not found' });
    }

    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}