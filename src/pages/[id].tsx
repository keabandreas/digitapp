import { GetStaticPaths, GetStaticProps } from 'next'
import { useRouter } from 'next/router'

interface Post {
  id: string
  title: string
  content: string
}

interface PostPageProps {
  post: Post
}

export default function PostPage({ post }: PostPageProps) {
  const router = useRouter()

  if (router.isFallback) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  // This is where you would typically fetch data from an API or database
  // For this example, we'll use a static list of post IDs
  const paths = [
    { params: { id: '1' } },
    { params: { id: '2' } },
    { params: { id: '3' } },
  ]

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  // This is where you would typically fetch data for a specific post
  // For this example, we'll return mock data
  const post: Post = {
    id: params?.id as string,
    title: `Post ${params?.id}`,
    content: `This is the content of post ${params?.id}`,
  }

  return {
    props: {
      post,
    },
  }
}
