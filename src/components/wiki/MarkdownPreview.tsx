import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownPreviewProps {
  content: string;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // This allows us to render custom HTML within the markdown
        p: ({ children }) => <p dangerouslySetInnerHTML={{ __html: children as string }} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownPreview;
