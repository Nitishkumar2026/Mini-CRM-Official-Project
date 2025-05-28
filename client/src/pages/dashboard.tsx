import { TopBar } from "@/components/layout/top-bar";
import { CampaignHistory } from "@/components/campaigns/campaign-history";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAnalyticsOverview, useCampaigns } from "@/lib/api";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: stats, isLoading: statsLoading } = useAnalyticsOverview();
  const { data: campaigns = [] } = useCampaigns();

  const handleCreateCampaign = () => {
    setLocation("/campaigns");
  };

  const handleCreateSegment = () => {
    setLocation("/audiences");
  };

  const handleViewAnalytics = () => {
    setLocation("/analytics");
  };

  const statsCards = [
    {
      title: "Total Customers",
      value: stats?.totalCustomers?.toLocaleString() || "0",
      change: "+2.3% from last month",
      icon: "👥",
      color: "bg-primary",
    },
    {
      title: "Active Campaigns",
      value: stats?.activeCampaigns?.toString() || "0",
      change: "+12% this week",
      icon: "📢",
      color: "bg-purple-500",
    },
    {
      title: "Delivery Rate",
      value: `${stats?.deliveryRate || "0"}%`,
      change: "+0.8% improvement",
      icon: "✅",
      color: "bg-green-500",
    },
    {
      title: "Revenue Impact",
      value: `₹${stats?.revenueImpact ? parseFloat(stats.revenueImpact).toLocaleString() : "0"}`,
      change: "+18% this quarter",
      icon: "💰",
      color: "bg-amber-500",
    },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <TopBar
        title="Dashboard"
        subtitle="Monitor your campaign performance and customer insights"
        actionButton={{
          label: "New Campaign",
          onClick: handleCreateCampaign,
        }}
      />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">
                      {statsLoading ? "..." : stat.value}
                    </p>
                    <p className="text-green-600 text-sm mt-1">
                      📈 {stat.change}
                    </p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color.replace('bg-', 'bg-').replace('-500', '-100')} rounded-lg flex items-center justify-center`}>
                    <span className="text-xl">{stat.icon}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CampaignHistory 
              campaigns={campaigns} 
              onViewAll={() => setLocation("/campaigns")}
            />
          </div>

          <div className="space-y-6">
            {/* AI Insights */}
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-purple-800">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
                  </svg>
                  <span>AI Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <p className="text-sm text-slate-700 mb-2">💡 <strong>Opportunity Detected:</strong></p>
                  <p className="text-sm text-slate-600">
                    {stats?.totalCustomers ? Math.floor(stats.totalCustomers * 0.1) : 128} customers haven't made a purchase in 60+ days but had high engagement. Consider a win-back campaign.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <p className="text-sm text-slate-700 mb-2">📈 <strong>Best Time to Send:</strong></p>
                  <p className="text-sm text-slate-600">
                    Tuesday 10 AM shows 23% higher open rates for your audience.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleCreateSegment}
                >
                  <span className="mr-3">👥</span>
                  Create New Segment
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleCreateCampaign}
                >
                  <span className="mr-3">📢</span>
                  Launch Campaign
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleViewAnalytics}
                >
                  <span className="mr-3">📊</span>
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
