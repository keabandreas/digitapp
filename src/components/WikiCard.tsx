import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Lock, Edit } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { WikiPage } from '../pages/wiki/index';

const MarkdownEditor = dynamic(() => import('@/components/MarkdownEditor'), { ssr: false });

interface WikiCardProps {
  page: WikiPage;
  isLocked: boolean;
  onSavePage: (updatedPage: WikiPage) => void;
}

export const WikiCard: React.FC<WikiCardProps> = ({ page, isLocked, onSavePage }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleSavePage = (content: string) => {
    onSavePage({ ...page, content });
    setIsEditing(false);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-blue-700">{page.title}</h2>
          {page.restricted && <Lock className="text-yellow-500" />}
        </div>
        <span className="text-sm text-gray-500">{page.category}</span>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">{page.excerpt}</p>
        <div className="flex justify-between">
          <Link href={`/wiki/${page.id}`} passHref>
            <Button variant="link" className="text-blue-500 hover:text-blue-700">
              <BookOpen className="h-4 w-4 mr-2" />
              Read more
            </Button>
          </Link>
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Edit Page: {page.title}</DialogTitle>
              </DialogHeader>
              <MarkdownEditor
                initialValue={page.content}
                onSave={handleSavePage}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};
