import { getServerAuthSession } from "@/server/auth/session";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getDashboardStats } from "@/server/actions/dashboard.actions";
import { Users, FileText, Activity, BookOpen, CheckCircle, Clock } from "lucide-react";
import { PDDDashboard } from "@/components/dashboard/PDDDashboard";

export default async function DashboardPage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/login");
  }

  // --- ROLE BASED VIEW LOGIC ---
  if (session.user.role === "PDD") {
    return <PDDDashboard user={session.user} />;
  }

  if (session.user.role === "TREASURER") {
      redirect("/dashboard/finance/overview");
  }

  // --- SUPERADMIN VIEW (Stats) ---
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Admin Header */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview Dashboard</h1>
          <p className="text-muted-foreground">
            System metrics and content statistics overview.
          </p>
        </div>
        {/* Placeholder for potential date filter or export button */}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Users Stats */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                 <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500 font-medium">{stats.users.active} active</span> accounts
            </p>
          </CardContent>
        </Card>

        {/* Total Posts Stats */}
        <Card className="border-l-4 border-l-purple-500 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Content</CardTitle>
            <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.posts.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Posts across all categories
            </p>
          </CardContent>
        </Card>

        {/* Activities Stats */}
        <Card className="border-l-4 border-l-green-500 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium text-muted-foreground">Activities</CardTitle>
             <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
             </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.posts.activities}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Recorded program activities
            </p>
          </CardContent>
        </Card>

        {/* Articles Stats */}
        <Card className="border-l-4 border-l-pink-500 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Articles</CardTitle>
            <div className="h-8 w-8 rounded-full bg-pink-100 dark:bg-pink-900/50 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-pink-600 dark:text-pink-400" />
            </div>
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">{stats.posts.articles}</div>
             <p className="text-xs text-muted-foreground mt-1">
              Published news & blogs
             </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Status Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
         <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Content Status Overview</CardTitle>
            <CardDescription>Breakdown of published vs draft content.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900">
                    <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                    <span className="text-2xl font-bold">{stats.posts.published}</span>
                    <span className="text-sm text-muted-foreground">Published</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-100 dark:border-yellow-900">
                    <Clock className="h-8 w-8 text-yellow-500 mb-2" />
                    <span className="text-2xl font-bold">{stats.posts.draft}</span>
                    <span className="text-sm text-muted-foreground">Drafts</span>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick System Action or Info */}
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg">System Health</CardTitle>
                <CardDescription>Server and database status.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Database (Supabase)</span>
                        <div className="flex items-center text-sm text-green-600">
                            <span className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                            Connected
                        </div>
                    </div>
                     <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Superadmin</span>
                        <div className="text-sm text-muted-foreground">
                            {session.user.email}
                        </div>
                    </div>
                     <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Version</span>
                        <div className="text-sm text-muted-foreground">
                            v1.0.0
                        </div>
                    </div>
                 </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
