import { PostForm } from "@/components/dashboard/posts/PostForm";

export default function NewPostPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Create New Post</h2>
      <PostForm />
    </div>
  );
}
