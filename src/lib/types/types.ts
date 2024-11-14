// @/lib/types/wiki.ts
export interface Document {
  id: number;
  title: string;
  content: string;
  category: string;
  restricted: boolean;
}