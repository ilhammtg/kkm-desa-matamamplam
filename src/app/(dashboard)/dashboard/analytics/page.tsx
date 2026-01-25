import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnalyticsData } from "@/server/actions/analytics.actions";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Eye, TrendingUp, Users } from "lucide-react";

export default async function AnalyticsPage() {
  const { siteVisits, topPosts, totalVisits } = await getAnalyticsData();
  
  // Calculate today's visits
  const today = new Date().toISOString().split("T")[0];
  const todayVisits = siteVisits.find((v: { date: Date; count: number }) => v.date.toISOString().split("T")[0] === today)?.count || 0;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Visitors (30d)
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVisits}</div>
            <p className="text-xs text-muted-foreground">
              Total visits in the last 30 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Visitors Today
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayVisits}</div>
            <p className="text-xs text-muted-foreground">
              Visits recorded today
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Top Viewed Content</CardTitle>
            <CardDescription>
              Most popular articles and activities
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                {topPosts.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No data available yet.</p>
                ) : (
                    topPosts.map((post: { id: string; title: string; type: string; views: number }) => (
                        <div key={post.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-none truncate max-w-[200px] md:max-w-[400px]">
                                    {post.title}
                                </p>
                                <p className="text-xs text-muted-foreground uppercase">{post.type}</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3 text-muted-foreground" />
                                <span className="font-bold text-sm">{post.views}</span>
                            </div>
                        </div>
                    ))
                )}
             </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
             <CardTitle>Daily Visits (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent> 
              <div className="space-y-2">
                  {siteVisits.slice(-7).map((visit: { id: string; date: Date; count: number }) => (
                      <div key={visit.id} className="flex items-center justify-between text-sm">
                          <span>{format(new Date(visit.date), "dd MMM", { locale: id })}</span>
                          <span className="font-bold">{visit.count}</span>
                      </div>
                  ))}
                  {siteVisits.length === 0 && <p className="text-muted-foreground text-sm">No data available yet.</p>}
              </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
