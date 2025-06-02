import { TopBar } from "@/components/layout/top-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAnalyticsOverview, useCampaigns } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

export default function Analytics() {
  const { data: stats, isLoading: statsLoading } = useAnalyticsOverview();
  const { data: campaigns = [] } = useCampaigns();

  const topSegments = [
    {
      name: "VIP Customers",
      deliveryRate: "98.2%",
      icon: "👑",
      color: "bg-green-100 text-green-800",
    },
    {
      name: "New Customers",
      deliveryRate: "94.7%",
      icon: "🌱",
      color: "bg-blue-100 text-blue-800",
    },
    {
      name: "Frequent Buyers",
      deliveryRate: "91.3%",
      icon: "🛒",
      color: "bg-purple-100 text-purple-800",
    },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <TopBar
        title="Analytics & Insights"
        subtitle="Deep dive into campaign performance and customer behavior"
        aiButton={{
          label: "Generate Insights",
          onClick: () => {},
        }}
        actionButton={{
          label: "Export Data",
          onClick: () => {},
          variant: "secondary",
        }}
      />

      <main className="flex-1 p-8 overflow-y-auto space-y-8">
        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Campaign Performance</CardTitle>
                  <Select defaultValue="30days">
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">Last 7 days</SelectItem>
                      <SelectItem value="30days">Last 30 days</SelectItem>
                      <SelectItem value="90days">Last 90 days</SelectItem>
                      <SelectItem value="year">This year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {/* Chart placeholder */}
                <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-slate-500 font-medium">Campaign Performance Chart</p>
                    <p className="text-xs text-slate-400 mt-1">Interactive chart showing delivery rates, engagement, and conversion metrics</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Segments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topSegments.map((segment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border">
                        <span className="text-lg">{segment.icon}</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{segment.name}</p>
                        <p className="text-sm text-slate-600">{segment.deliveryRate} delivery rate</p>
                      </div>
                    </div>
                    <Badge className={segment.color}>
                      #{index + 1}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Total Reach</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">
                    {statsLoading ? "..." : `${stats?.totalCustomers?.toLocaleString() || 0}`}
                  </p>
                  <p className="text-green-600 text-sm mt-1">📈 +12.5% vs last month</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Avg. Open Rate</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">23.4%</p>
                  <p className="text-green-600 text-sm mt-1">📈 +2.1% vs last month</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Click-through Rate</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">4.7%</p>
                  <p className="text-green-600 text-sm mt-1">📈 +0.9% vs last month</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Conversion Rate</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">2.8%</p>
                  <p className="text-green-600 text-sm mt-1">📈 +0.3% vs last month</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaign History with AI Insights */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Campaign History & Performance</CardTitle>
              <div className="flex items-center space-x-3">
                <Button variant="outline" className="bg-purple-600 text-white hover:bg-purple-700">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
                  </svg>
                  AI Insights
                </Button>
                <Button variant="outline">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {campaigns.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-lg font-medium text-slate-600">No campaign data available</p>
                <p className="text-slate-500 mt-2">Create and launch your first campaign to see analytics here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Campaign</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Audience</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Sent</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Delivered</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Failed</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Rate</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">AI Insight</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {campaigns.map((campaign) => {
                      const deliveryRate = campaign.deliveryRate ? parseFloat(campaign.deliveryRate) : 0;
                      const getInsight = (rate: number) => {
                        if (rate >= 95) return { text: "Peak performance ✨", color: "text-purple-600" };
                        if (rate >= 90) return { text: "Excellent delivery 🎯", color: "text-green-600" };
                        if (rate >= 85) return { text: "Good performance 👍", color: "text-blue-600" };
                        return { text: "Needs optimization 📈", color: "text-amber-600" };
                      };
                      const insight = getInsight(deliveryRate);

                      return (
                        <tr key={campaign.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-slate-800">{campaign.name}</p>
                              <p className="text-sm text-slate-500">
                                  {campaign.createdAt ? formatDistanceToNow(campaign.createdAt, { addSuffix: true }) : 'N/A'}
                                </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {campaign.audienceSize?.toLocaleString() || 0} customers
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {campaign.sentCount?.toLocaleString() || 0}
                          </td>
                          <td className="px-6 py-4 text-sm text-green-600">
                            {campaign.deliveredCount?.toLocaleString() || 0}
                          </td>
                          <td className="px-6 py-4 text-sm text-red-600">
                            {campaign.failedCount?.toLocaleString() || 0}
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              className={
                                deliveryRate >= 90
                                  ? "bg-green-100 text-green-800"
                                  : deliveryRate >= 80
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              {deliveryRate.toFixed(1)}%
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-sm ${insight.color}`}>{insight.text}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI-Powered Insights Panel */}
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-purple-800">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
              </svg>
              <span>AI-Powered Performance Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800 mb-1">Optimal Timing</h4>
                    <p className="text-sm text-slate-600">Your campaigns perform 23% better when sent on Tuesday-Thursday between 2-4 PM.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800 mb-1">Audience Growth</h4>
                    <p className="text-sm text-slate-600">Consider targeting customers similar to your "Premium" segment - potential audience of 1,200+ users.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="flex items-start space-x-3">
                  <div className="bg-amber-100 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800 mb-1">Performance Trend</h4>
                    <p className="text-sm text-slate-600">Campaigns with personalized product recommendations show 31% higher engagement.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
