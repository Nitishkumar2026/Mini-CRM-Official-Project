import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import type { Campaign } from "@/types";

interface CampaignHistoryProps {
  campaigns: Campaign[];
  onViewAll?: () => void;
}

export function CampaignHistory({ campaigns, onViewAll }: CampaignHistoryProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "active":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "✅";
      case "active":
        return "🔵";
      case "failed":
        return "❌";
      case "draft":
        return "📝";
      default:
        return "📝";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Campaigns</CardTitle>
          {onViewAll && (
            <Button variant="outline" size="sm" onClick={onViewAll}>
              View All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {campaigns.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>No campaigns created yet.</p>
            <p className="text-sm">Create your first campaign to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.slice(0, 5).map((campaign) => (
              <div
                key={campaign.id}
                className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-slate-900 text-sm">{campaign.name}</h4>
                  <Badge className={getStatusColor(campaign.status)}>
                    <span className="mr-1">{getStatusIcon(campaign.status)}</span>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </Badge>
                </div>
                
                <p className="text-xs text-slate-600 mb-3">
                  Audience: {campaign.audienceSize?.toLocaleString() || 0} customers
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Sent:</span>
                    <span className="font-medium text-slate-700">
                      {campaign.sentCount?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Delivered:</span>
                    <span className="font-medium text-emerald-600">
                      {campaign.deliveredCount?.toLocaleString() || 0} ({campaign.deliveryRate ? parseFloat(campaign.deliveryRate).toFixed(1) : 0}%)
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Failed:</span>
                    <span className="font-medium text-red-600">
                      {campaign.failedCount?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500">
                    {formatDistanceToNow(new Date(campaign.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
