import React from 'react'
import MarkdownPreview from '@uiw/react-markdown-preview'
import '@uiw/react-markdown-preview/markdown.css';

interface WikiDocumentProps {
  document: {
    id: number
    title: string
    content: string
    restricted: boolean
    category: string
  }
  isUnlocked: boolean
  onDocumentUpdate: (id: number, content: string) => void
}

export default function WikiDocument({ document, isUnlocked, onDocumentUpdate }: WikiDocumentProps) {
  if (!document) {
    return <div>No document selected</div>
  }

  // Function to preprocess the Markdown content
  const preprocessMarkdown = (content: string) => {
    // Replace single line breaks with <br>, but preserve double line breaks
    return content.replace(/(?<!\n)\n(?!\n)/g, '  \n');
  };

  const processedContent = preprocessMarkdown(document.content);

  return (
    <div className="w-full h-full bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-4">{document.title}</h1>
      <div className="prose dark:prose-invert max-w-none">
        <MarkdownPreview 
          source={processedContent} 
          style={{
            backgroundColor: 'var(--background)',
            color: 'var(--foreground)',
          }}
        />
      </div>
    </div>
  )
}
