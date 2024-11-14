import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  try {
    switch (req.method) {
      case 'GET':
        if (id) {
          const document = await prisma.document.findUnique({
            where: { id: parseInt(id as string) },
          });

          if (document) {
            res.status(200).json(document);
          } else {
            res.status(404).json({ error: 'Document not found' });
          }
        } else {
          const documents = await prisma.document.findMany({
            orderBy: [
              { isPinned: 'desc' },
              { updatedAt: 'desc' }
            ],
          });
          res.status(200).json(documents);
        }
        break;

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
            category: category || 'General',
            isPinned: false,
          },
        });
        res.status(201).json(newDocument);
        break;

        case 'PUT': {
          if (!id) {
            return res.status(400).json({ error: 'Document ID is required' });
          }
        
          const updates = req.body;
          const documentId = parseInt(id as string);
        
          try {
            // First get the existing document
            const existingDoc = await prisma.document.findUnique({
              where: { id: documentId },
            });
        
            if (!existingDoc) {
              return res.status(404).json({ error: 'Document not found' });
            }
        
            // Update with merged data
            const updatedDocument = await prisma.document.update({
              where: { id: documentId },
              data: {
                title: updates.title ?? existingDoc.title,
                content: updates.content ?? existingDoc.content,
                category: updates.category ?? existingDoc.category,
                restricted: updates.restricted ?? existingDoc.restricted,
                isPinned: updates.isPinned ?? existingDoc.isPinned,
              },
            });
        
            res.status(200).json(updatedDocument);
          } catch (error) {
            console.error('Error updating document:', error);
            res.status(500).json({ error: 'Error updating document' });
          }
          break;
        }

      case 'PATCH':
        if (!id) {
          return res.status(400).json({ error: 'Document ID is required' });
        }

        const { restricted: patchRestricted, isPinned: patchIsPinned } = req.body;

        const patchedDocument = await prisma.document.update({
          where: { id: parseInt(id as string) },
          data: {
            ...(patchRestricted !== undefined && { restricted: patchRestricted }),
            ...(patchIsPinned !== undefined && { isPinned: patchIsPinned }),
          },
        });
        res.status(200).json(patchedDocument);
        break;

      case 'DELETE':
        if (!id) {
          return res.status(400).json({ error: 'Document ID is required' });
        }

        await prisma.document.delete({
          where: { id: parseInt(id as string) },
        });
        res.status(200).json({ message: 'Document deleted successfully' });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API error:', error);
    
    // Check if it's a Prisma error
    if ((error as any).code === 'P2025') {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}