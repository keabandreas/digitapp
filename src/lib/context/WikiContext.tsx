import React, { 
  createContext, 
  useContext, 
  useState, 
  useCallback, 
  useEffect,
  useMemo 
} from 'react';
import { toast } from 'sonner';
import { 
  Document, 
  Category, 
  CategoryWithHierarchy, 
  Tag,
  DocumentUpdate,
  WikiState,
  DocumentFilter,
  SortOption
} from '@/lib/types/wiki';

interface WikiContextType extends WikiState {
  // Document actions
  selectDocument: (id: number | null) => void;
  createDocument: (title: string, category: string, restricted: boolean, content?: string) => Promise<void>;
  updateDocument: (id: number, updates: DocumentUpdate) => Promise<void>;
  deleteDocument: (id: number) => Promise<void>;
  
  // Category actions
  createCategory: (name: string, parentId?: number) => Promise<void>;
  updateCategory: (id: number, name: string) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  reorderCategory: (id: number, newOrder: number) => Promise<void>;
  
  // Tag actions
  createTag: (name: string, color: string) => Promise<void>;
  deleteTag: (id: number) => Promise<void>;
  updateDocumentTags: (documentId: number, tagIds: number[]) => Promise<void>;
  
  // UI State actions
  setIsEditing: (value: boolean) => void;
  setIsUnlocked: (value: boolean) => void;
  
  // Search and filter
  filterDocuments: (filter: DocumentFilter) => void;
  sortDocuments: (sort: SortOption) => void;
  
  // Auth
  isPasswordPromptOpen: boolean;
  setIsPasswordPromptOpen: (value: boolean) => void;
  handlePasswordSubmit: (password: string) => Promise<void>;

  // Additional UI state
  isAddDocumentOpen: boolean;
  isUploadDialogOpen: boolean;
  setIsAddDocumentOpen: (value: boolean) => void;
  setIsUploadDialogOpen: (value: boolean) => void;
}

const WikiContext = createContext<WikiContextType | null>(null);

export function useWiki() {
  const context = useContext(WikiContext);
  if (!context) {
    throw new Error('useWiki must be used within a WikiProvider');
  }
  return context;
}

const buildCategoryHierarchy = (
  categories: Category[],
  documents: Document[],
  parentId: number | null = null,
  level: number = 0
): CategoryWithHierarchy[] => {
  return categories
    .filter(cat => cat.parentId === parentId)
    .map(cat => ({
      ...cat,
      level,
      children: buildCategoryHierarchy(categories, documents, cat.id, level + 1),
      documentCount: documents.filter(doc => doc.category === cat.name).length
    }))
    .sort((a, b) => a.order - b.order);
};

export function WikiProvider({ children }: { children: React.ReactNode }) {
  // State
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordPromptOpen, setIsPasswordPromptOpen] = useState(false);
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [filter, setFilter] = useState<DocumentFilter>({});
  const [sort, setSort] = useState<SortOption>({ field: 'updatedAt', direction: 'desc' });

  // Compute category hierarchy
  const categoryHierarchy = useMemo(() => 
    buildCategoryHierarchy(categories, documents),
    [categories, documents]
  );

  // Fetch initial data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [docsRes, catsRes, tagsRes] = await Promise.all([
        fetch('/api/wiki/wiki'),
        fetch('/api/wiki/categories'),
        fetch('/api/wiki/tags')
      ]);

      if (!docsRes.ok || !catsRes.ok || !tagsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [docsData, catsData, tagsData] = await Promise.all([
        docsRes.json(),
        catsRes.json(),
        tagsRes.json()
      ]);

      setDocuments(docsData);
      setCategories(catsData);
      setTags(tagsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      console.error('Error fetching data:', err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Document actions
  const selectDocument = useCallback((id: number | null) => {
    const doc = id ? documents.find(d => d.id === id) || null : null;
    setSelectedDocument(doc);
    setIsEditing(false);
  }, [documents]);

  const createDocument = useCallback(async (
    title: string,
    category: string,
    restricted: boolean,
    content: string = ''
  ) => {
    try {
      const response = await fetch('/api/wiki/wiki', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, restricted, content }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create document');
      }

      await fetchData();
      toast.success('Document created successfully');
    } catch (error) {
      console.error('Error creating document:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create document');
      throw error;
    }
  }, [fetchData]);

  const updateDocument = useCallback(async (
    id: number,
    updates: DocumentUpdate
  ) => {
    try {
      const response = await fetch(`/api/wiki/wiki?id=${id}`, { // Add id to URL
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update document');
      }
  
      const updatedDoc = await response.json();
      
      // Update local state
      setDocuments(prevDocs => 
        prevDocs.map(doc => 
          doc.id === id ? { ...doc, ...updatedDoc } : doc
        )
      );
  
      if (selectedDocument?.id === id) {
        setSelectedDocument(prev => 
          prev ? { ...prev, ...updatedDoc } : null
        );
      }
  
      toast.success('Document updated successfully');
    } catch (error) {
      console.error('Error updating document:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update document');
      throw error;
    }
  }, [selectedDocument?.id]);

  const deleteDocument = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/wiki/wiki?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      await fetchData();
      if (selectedDocument?.id === id) {
        setSelectedDocument(null);
      }
      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete document');
      throw error;
    }
  }, [fetchData, selectedDocument?.id]);

  // Category actions
  const createCategory = useCallback(async (name: string, parentId?: number) => {
    try {
      const response = await fetch('/api/wiki/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, parentId }),
      });

      if (!response.ok) throw new Error('Failed to create category');
      await fetchData();
      toast.success('Category created successfully');
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
      throw error;
    }
  }, [fetchData]);

  const updateCategory = useCallback(async (id: number, name: string) => {
    try {
      const response = await fetch('/api/wiki/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name }),
      });

      if (!response.ok) throw new Error('Failed to update category');
      await fetchData();
      toast.success('Category updated successfully');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
      throw error;
    }
  }, [fetchData]);

  const deleteCategory = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/wiki/categories?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete category');
      await fetchData();
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
      throw error;
    }
  }, [fetchData]);

  const reorderCategory = useCallback(async (id: number, newOrder: number) => {
    try {
      const response = await fetch('/api/wiki/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, order: newOrder }),
      });

      if (!response.ok) throw new Error('Failed to reorder category');
      await fetchData();
    } catch (error) {
      console.error('Error reordering category:', error);
      toast.error('Failed to reorder category');
      throw error;
    }
  }, [fetchData]);

  // Tag actions
  const createTag = useCallback(async (name: string, color: string) => {
    try {
      const response = await fetch('/api/wiki/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color }),
      });

      if (!response.ok) throw new Error('Failed to create tag');
      await fetchData();
      toast.success('Tag created successfully');
    } catch (error) {
      console.error('Error creating tag:', error);
      toast.error('Failed to create tag');
      throw error;
    }
  }, [fetchData]);

  const deleteTag = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/wiki/tags?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete tag');
      await fetchData();
      toast.success('Tag deleted successfully');
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast.error('Failed to delete tag');
      throw error;
    }
  }, [fetchData]);

  const updateDocumentTags = useCallback(async (documentId: number, tagIds: number[]) => {
    try {
      const response = await fetch('/api/wiki/tags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId, tagIds }),
      });

      if (!response.ok) throw new Error('Failed to update document tags');
      await fetchData();
      toast.success('Tags updated successfully');
    } catch (error) {
      console.error('Error updating document tags:', error);
      toast.error('Failed to update document tags');
      throw error;
    }
  }, [fetchData]);

  // Search and filter
  const filterDocuments = useCallback((newFilter: DocumentFilter) => {
    setFilter(newFilter);
  }, []);

  const sortDocuments = useCallback((newSort: SortOption) => {
    setSort(newSort);
  }, []);

  // Auth
  const handlePasswordSubmit = useCallback(async (password: string) => {
    try {
      const response = await fetch('/api/wiki/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
  
      if (!response.ok) {
        throw new Error('Invalid password');
      }
  
      setIsUnlocked(true);
      setIsPasswordPromptOpen(false);
      toast.success('Successfully unlocked');
    } catch (error) {
      // Don't close the modal on error
      throw error; // Let the PasswordPromptModal handle the error display
    }
  }, []);

  const value = {
    // State
    documents,
    selectedDocument,
    categories: categoryHierarchy,
    tags,
    isEditing,
    isUnlocked,
    isLoading,
    error,
    isPasswordPromptOpen,
    isAddDocumentOpen,
    isUploadDialogOpen,

    // Actions
    selectDocument,
    createDocument,
    updateDocument,
    deleteDocument,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategory,
    createTag,
    deleteTag,
    updateDocumentTags,

    // UI State actions
    setIsEditing,
    setIsUnlocked,
    setIsPasswordPromptOpen,
    setIsAddDocumentOpen,
    setIsUploadDialogOpen,
    filterDocuments,
    sortDocuments,
    handlePasswordSubmit,
  };

  return (
    <WikiContext.Provider value={value}>
      {children}
    </WikiContext.Provider>
  );
}