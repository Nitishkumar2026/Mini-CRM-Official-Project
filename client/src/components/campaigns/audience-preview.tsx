import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AudiencePreviewProps {
  audienceSize: number;
  estimatedReach?: number;
  insights?: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}

export function AudiencePreview({ audienceSize, estimatedReach, insights }: AudiencePreviewProps) {
  const defaultInsights = [
    {
      icon: "✅",
      title: "Best send time",
      description: "Tuesday 2-4 PM"
    },
    {
      icon: "📈",
      title: "Expected engagement",
      description: "23% engagement rate"
    },
    {
      icon: "👥",
      title: "Similar segments",
      description: "89% delivery rate"
    }
  ];

  const displayInsights = insights || defaultInsights;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Audience Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-primary">
                {audienceSize.toLocaleString()}
              </span>
            </div>
            <p className="text-slate-600 text-sm">Estimated reach</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">High value customers</span>
              <span className="text-sm font-medium text-slate-900">68%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Inactive users</span>
              <span className="text-sm font-medium text-slate-900">32%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Expected delivery</span>
              <span className="text-sm font-medium text-green-600">
                ~{Math.floor(audienceSize * 0.92).toLocaleString()} messages
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center text-purple-800">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {displayInsights.map((insight, index) => (
              <li key={index} className="flex items-start space-x-3">
                <span className="text-lg">{insight.icon}</span>
                <div>
                  <span className="text-sm text-slate-700 font-medium">{insight.title}:</span>
                  <span className="text-sm text-slate-600 ml-1">{insight.description}</span>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
