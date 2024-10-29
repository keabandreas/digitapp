import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method === 'GET') {
    if (id) {
      const document = await prisma.document.findUnique({
        where: { id: parseInt(id as string) },
      })

      if (document) {
        res.status(200).json(document)
      } else {
        res.status(404).json({ error: 'Document not found' })
      }
    } else {
      const documents = await prisma.document.findMany({
        orderBy: { title: 'asc' },
      })
      res.status(200).json(documents)
    }
  } else if (req.method === 'POST') {
    const { title, content, restricted, category } = req.body

    if (!title) {
      return res.status(400).json({ error: 'Title is required' })
    }

    try {
      const document = await prisma.document.create({
        data: {
          title,
          content: content || '',
          restricted: restricted || false,
          category: category || 'General',
        },
      })
      res.status(201).json(document)
    } catch (error) {
      console.error('Error creating document:', error)
      res.status(500).json({ error: 'Error creating document' })
    }
  } else if (req.method === 'PUT') {
    const { title, content, restricted, category } = req.body

    if (!id) {
      return res.status(400).json({ error: 'Document ID is required' })
    }

    if (!title) {
      return res.status(400).json({ error: 'Title is required' })
    }

    try {
      const document = await prisma.document.update({
        where: { id: parseInt(id as string) },
        data: {
          title,
          content: content || '',
          restricted: restricted || false,
          category: category || 'General',
        },
      })
      res.status(200).json(document)
    } catch (error) {
      console.error('Error updating document:', error)
      res.status(500).json({ error: 'Error updating document' })
    }
  } else if (req.method === 'PATCH') {
    const { restricted } = req.body

    if (!id) {
      return res.status(400).json({ error: 'Document ID is required' })
    }

    try {
      const document = await prisma.document.update({
        where: { id: parseInt(id as string) },
        data: { restricted },
      })
      res.status(200).json(document)
    } catch (error) {
      console.error('Error updating document:', error)
      res.status(500).json({ error: 'Error updating document' })
    }
  } else if (req.method === 'DELETE') {
    if (id) {
      try {
        await prisma.document.delete({
          where: { id: parseInt(id as string) },
        })
        res.status(200).json({ message: 'Document deleted successfully' })
      } catch (error) {
        console.error('Error deleting document:', error)
        res.status(404).json({ error: 'Document not found or could not be deleted' })
      }
    } else {
      res.status(400).json({ error: 'Document ID is required' })
    }
  } else {
    res.status(405).end() // Method Not Allowed
  }
}
