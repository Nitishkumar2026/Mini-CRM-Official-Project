import { useState } from "react";
import { TopBar } from "@/components/layout/top-bar";
import { RuleBuilder } from "@/components/campaigns/rule-builder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useSegments, useCreateSegment, usePreviewSegment, useAISegmentGeneration } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { SegmentRule } from "@/types";

export default function AudienceBuilder() {
  const [segmentName, setSegmentName] = useState("");
  const [segmentDescription, setSegmentDescription] = useState("");
  const [rules, setRules] = useState<SegmentRule[]>([]);
  const [aiQuery, setAiQuery] = useState("");
  const [audienceSize, setAudienceSize] = useState<number>(0);

  const { data: segments = [] } = useSegments();
  const { mutate: createSegment, isPending: isCreating } = useCreateSegment();
  const { mutate: previewSegment } = usePreviewSegment();
  const { mutate: generateAIRules, isPending: isGenerating } = useAISegmentGeneration();
  const { toast } = useToast();

  const handlePreview = () => {
    if (rules.length === 0) {
      toast({
        title: "No Rules Defined",
        description: "Please add at least one rule to preview the audience.",
        variant: "destructive",
      });
      return;
    }

    previewSegment(rules, {
      onSuccess: (data) => {
        setAudienceSize(data.audienceSize);
        toast({
          title: "Audience Updated",
          description: `Preview shows ${data.audienceSize.toLocaleString()} customers match your criteria.`,
        });
      },
      onError: () => {
        toast({
          title: "Preview Failed",
          description: "Failed to calculate audience size. Please check your rules.",
          variant: "destructive",
        });
      },
    });
  };

  const handleSaveSegment = () => {
    if (!segmentName.trim()) {
      toast({
        title: "Missing Segment Name",
        description: "Please provide a name for your segment.",
        variant: "destructive",
      });
      return;
    }

    if (rules.length === 0) {
      toast({
        title: "No Rules Defined",
        description: "Please add at least one rule to create the segment.",
        variant: "destructive",
      });
      return;
    }

    createSegment(
      {
        name: segmentName,
        description: segmentDescription,
        rules,
      },
      {
        onSuccess: () => {
          toast({
            title: "Segment Created",
            description: "Your audience segment has been saved successfully.",
          });
          setSegmentName("");
          setSegmentDescription("");
          setRules([]);
          setAudienceSize(0);
        },
        onError: () => {
          toast({
            title: "Creation Failed",
            description: "Failed to create segment. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleAIGenerate = () => {
    if (!aiQuery.trim()) {
      toast({
        title: "Missing Query",
        description: "Please describe your audience in natural language.",
        variant: "destructive",
      });
      return;
    }

    generateAIRules(aiQuery, {
      onSuccess: (data) => {
        setRules(data.rules);
        setAudienceSize(data.audienceSize);
        toast({
          title: "Rules Generated",
          description: "AI has converted your description into segment rules.",
        });
      },
      onError: () => {
        toast({
          title: "Generation Failed",
          description: "Failed to generate rules from your description. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="flex-1 flex flex-col">
      <TopBar
        title="Audience Builder"
        subtitle="Create and manage customer segments with intelligent rules"
        aiButton={{
          label: "AI Assistant",
          onClick: () => {},
        }}
      />

      <main className="flex-1 p-8 overflow-y-auto space-y-8">
        {/* AI Natural Language Builder */}
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-purple-800">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
              </svg>
              <span>Natural Language Segment Builder</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <Textarea
                  placeholder="Example: 'Customers who spent more than ₹10,000 in the last 6 months but haven't purchased in 30 days'"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>
              <Button
                onClick={handleAIGenerate}
                disabled={isGenerating}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isGenerating && (
                  <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                Generate Rules
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Segment Details */}
        <Card>
          <CardHeader>
            <CardTitle>Segment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Segment Name
                </label>
                <Input
                  placeholder="Enter segment name"
                  value={segmentName}
                  onChange={(e) => setSegmentName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description (Optional)
                </label>
                <Input
                  placeholder="Describe this segment"
                  value={segmentDescription}
                  onChange={(e) => setSegmentDescription(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rule Builder */}
        <RuleBuilder
          rules={rules}
          onChange={setRules}
          onPreview={handlePreview}
          audienceSize={audienceSize}
        />

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <div>
            <p className="text-sm text-slate-600">
              Ready to save this segment?
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handlePreview}>
              Preview Audience
            </Button>
            <Button
              onClick={handleSaveSegment}
              disabled={isCreating}
              className="bg-primary hover:bg-primary/90"
            >
              {isCreating && (
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              Save Segment
            </Button>
          </div>
        </div>

        {/* Saved Segments */}
        <Card>
          <CardHeader>
            <CardTitle>Saved Segments</CardTitle>
          </CardHeader>
          <CardContent>
            {segments.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p>No segments created yet.</p>
                <p className="text-sm">Create your first segment using the builder above!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {segments.map((segment) => (
                  <div
                    key={segment.id}
                    className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-slate-800">{segment.name}</h4>
                      <Badge variant="secondary">
                        ⭐
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">
                      {segment.description || "No description provided"}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">
                        {segment.audienceSize?.toLocaleString() || 0} customers
                      </span>
                      <span className="text-green-600 font-medium">
                        {segment.rules.length} rules
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
