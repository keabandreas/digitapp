import { WikiError } from '@/lib/errors/wikiError';

export const handleApiResponse = async (response: Response, errorMessage: string) => {
  if (!response.ok) {
    throw new Error(errorMessage);
  }
  return response.json();
};