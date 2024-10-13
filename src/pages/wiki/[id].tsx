import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const WikiArticle: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  // In a real application, you would fetch the article data based on the id
  // For now, we'll just display the id
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Wiki Article {id}</h1>
      <p>This is where the content of the wiki article would go.</p>
      <Link href="/wiki" passHref>
        <Button className="mt-4">Back to Wiki</Button>
      </Link>
    </div>
  );
};

export default WikiArticle;
