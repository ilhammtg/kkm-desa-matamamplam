import { PostForm } from "@/components/dashboard/posts/PostForm";
import { getPost } from "@/server/actions/posts.actions";
import { notFound } from "next/navigation";

interface EditPostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPostPage(props: EditPostPageProps) {
  const params = await props.params;
  const post = await getPost(params.id);

  if (!post) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Edit Post</h2>
      <PostForm initialData={post} />
    </div>
  );
}
