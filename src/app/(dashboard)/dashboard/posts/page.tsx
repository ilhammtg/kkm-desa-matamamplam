import { getPosts } from "@/server/actions/posts.actions";
import { PostsTable } from "@/components/dashboard/posts/PostsTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default async function DashboardPostsPage(
  props: {
    searchParams?: Promise<{
      query?: string;
      page?: string;
    }>;
  }
) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;

  const { posts, totalPages } = await getPosts(currentPage, 10, query);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Posts</h2>
        <Link href="/dashboard/posts/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Post
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-2">
         {/* Search Filter would go here */}
      </div>

       <Suspense fallback={<div>Loading...</div>}>
        <PostsTable posts={posts} />
      </Suspense>

      {/* Pagination would go here */}
    </div>
  );
}
