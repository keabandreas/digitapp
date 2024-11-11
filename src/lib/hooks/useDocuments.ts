// @/lib/hooks/useDocuments.ts
import { useState, useCallback, useEffect } from 'react';
import { Document } from '@/lib/types/wiki';
import { toast } from 'react-hot-toast';

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/wiki/wiki');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
        const allCategories = [...new Set(data.map((doc: Document) => doc.category))].sort();
        setCategories(allCategories);
      } else {
        console.error('Failed to fetch documents');
        toast.error('Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Error fetching documents');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch documents on mount
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const createDocument = useCallback(async (title: string, category: string, restricted: boolean, content: string = '') => {
    try {
      const response = await fetch('/api/wiki/wiki', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, restricted, content }),
      });
      if (response.ok) {
        const newDocument = await response.json();
        await fetchDocuments(); // Refresh the documents list
        toast.success('Document created successfully');
        return newDocument;
      } else {
        toast.error('Failed to create document');
      }
    } catch (error) {
      console.error('Error creating document:', error);
      toast.error('Error creating document');
    }
  }, [fetchDocuments]);

  const updateDocument = useCallback(async (id: number, title: string, content: string) => {
    try {
      const response = await fetch('/api/wiki/wiki', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, title, content }),
      });
      if (response.ok) {
        const updatedDoc = await response.json();
        setDocuments(prevDocs => prevDocs.map(doc => doc.id === id ? updatedDoc : doc));
        return updatedDoc;
      } else {
        console.error('Failed to update document');
        toast.error('Failed to update document');
      }
    } catch (error) {
      console.error('Error updating document:', error);
      toast.error('Error updating document');
    }
  }, []);

  const deleteDocument = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/wiki/wiki?id=${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setDocuments(docs => docs.filter(doc => doc.id !== id));
        toast.success('Document deleted successfully');
        return true;
      } else {
        toast.error('Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Error deleting document');
    }
    return false;
  }, []);

  return {
    documents,
    categories,
    isLoading,
    fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument
  };
};