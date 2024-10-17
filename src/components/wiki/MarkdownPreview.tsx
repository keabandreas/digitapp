import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useWikiContext } from './WikiContext';

interface MarkdownPreviewProps {
  content: string;
  isRestricted: boolean;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, isRestricted }) => {
  const { isLocked } = useWikiContext();

  if (isLocked && isRestricted) {
    return <div className="text-gray-500">This content is restricted.</div>;
  }

  return (
    <div className="prose max-w-none">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

export default MarkdownPreview;
