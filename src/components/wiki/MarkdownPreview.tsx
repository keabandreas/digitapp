import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownPreviewProps {
  content: string;
  isLocked: boolean;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, isLocked }) => {
  const [revealedSpoilers, setRevealedSpoilers] = useState<Set<number>>(new Set());

  const toggleSpoiler = (index: number) => {
    if (!isLocked) {
      setRevealedSpoilers(prev => {
        const newSet = new Set(prev);
        if (newSet.has(index)) {
          newSet.delete(index);
        } else {
          newSet.add(index);
        }
        return newSet;
      });
    }
  };

  const processContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('! ')) {
        const spoilerContent = line.slice(2);
        const isRevealed = revealedSpoilers.has(index);

        return (
          <div
            key={index}
            className={`cursor-pointer p-2 rounded ${isLocked ? 'bg-gray-300' : 'bg-yellow-200'}`}
            onClick={() => toggleSpoiler(index)}
          >
            {isLocked ? (
              <span className="select-none">REDACTED</span>
            ) : (
              isRevealed ? spoilerContent : '[Click to reveal]'
            )}
          </div>
        );
      }
      return line;
    }).join('\n');
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
    >
      {processContent(content)}
    </ReactMarkdown>
  );
};

export default MarkdownPreview;
