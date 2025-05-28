import { useState } from "react";
import { TopBar } from "@/components/layout/top-bar";
import { AIMessageGenerator } from "@/components/campaigns/ai-message-generator";
import { AudiencePreview } from "@/components/campaigns/audience-preview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useSegments, useCreateCampaign, useLaunchCampaign } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Segment } from "@/types";

export default function Campaigns() {
  const [campaignName, setCampaignName] = useState("");
  const [campaignType, setCampaignType] = useState("");
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [message, setMessage] = useState("");
  const [channel, setChannel] = useState("");
  const [sendTime, setSendTime] = useState("immediate");

  const { data: segments = [] } = useSegments();
  const { mutate: createCampaign, isPending: isCreating } = useCreateCampaign();
  const { mutate: launchCampaign, isPending: isLaunching } = useLaunchCampaign();
  const { toast } = useToast();

  const handleSelectSegment = (segmentId: string) => {
    const segment = segments.find(s => s.id.toString() === segmentId);
    setSelectedSegment(segment || null);
  };

  const handleSelectMessage = (selectedMessage: string) => {
    setMessage(selectedMessage);
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('message-textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newMessage = message.substring(0, start) + `{{${variable}}}` + message.substring(end);
      setMessage(newMessage);
      
      // Set cursor position after the inserted variable
      setTimeout(() => {
        textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4);
        textarea.focus();
      }, 0);
    }
  };

  const handleSaveDraft = () => {
    if (!campaignName.trim() || !selectedSegment || !message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in campaign name, select audience, and write a message.",
        variant: "destructive",
      });
      return;
    }

    createCampaign(
      {
        name: campaignName,
        segmentId: selectedSegment.id,
        message,
        channel: channel || "email",
        status: "draft",
        audienceSize: selectedSegment.audienceSize || 0,
      },
      {
        onSuccess: () => {
          toast({
            title: "Draft Saved",
            description: "Your campaign has been saved as a draft.",
          });
          resetForm();
        },
        onError: () => {
          toast({
            title: "Save Failed",
            description: "Failed to save campaign draft. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleLaunchCampaign = () => {
    if (!campaignName.trim() || !selectedSegment || !message.trim() || !channel) {
      toast({
        title: "Missing Information",
        description: "Please complete all required fields before launching.",
        variant: "destructive",
      });
      return;
    }

    createCampaign(
      {
        name: campaignName,
        segmentId: selectedSegment.id,
        message,
        channel,
        status: "active",
        audienceSize: selectedSegment.audienceSize || 0,
        scheduledAt: sendTime === "immediate" ? new Date() : undefined,
      },
      {
        onSuccess: (data) => {
          toast({
            title: "Campaign Launched",
            description: "Your campaign is now being delivered to the target audience.",
          });
          resetForm();
        },
        onError: () => {
          toast({
            title: "Launch Failed",
            description: "Failed to launch campaign. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const resetForm = () => {
    setCampaignName("");
    setCampaignType("");
    setSelectedSegment(null);
    setMessage("");
    setChannel("");
    setSendTime("immediate");
  };

  return (
    <div className="flex-1 flex flex-col">
      <TopBar
        title="Campaign Management"
        subtitle="Design and launch targeted marketing campaigns"
      />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Create New Campaign</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Campaign Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Campaign Name
                    </label>
                    <Input
                      placeholder="Enter campaign name"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Campaign Type
                    </label>
                    <Select value={campaignType} onValueChange={setCampaignType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select campaign type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="promotional">Promotional</SelectItem>
                        <SelectItem value="win-back">Win-back</SelectItem>
                        <SelectItem value="welcome">Welcome Series</SelectItem>
                        <SelectItem value="retention">Retention</SelectItem>
                        <SelectItem value="upsell">Upsell</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Audience Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Target Audience
                  </label>
                  <div className="border border-slate-300 rounded-lg p-4">
                    {selectedSegment ? (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-slate-800">
                            Selected Segment: {selectedSegment.name}
                          </h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedSegment(null)}
                          >
                            Change Segment
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-slate-600">Audience Size</p>
                            <p className="text-lg font-semibold text-slate-800">
                              {selectedSegment.audienceSize?.toLocaleString() || 0}
                            </p>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-slate-600">Estimated Reach</p>
                            <p className="text-lg font-semibold text-green-600">96.2%</p>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-slate-600">Rules</p>
                            <p className="text-lg font-semibold text-slate-800">
                              {selectedSegment.rules.length}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-slate-600 mb-3">Select an audience segment:</p>
                        <Select onValueChange={handleSelectSegment}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose segment" />
                          </SelectTrigger>
                          <SelectContent>
                            {segments.map((segment) => (
                              <SelectItem key={segment.id} value={segment.id.toString()}>
                                {segment.name} ({segment.audienceSize?.toLocaleString() || 0} customers)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Message Content */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-slate-700">
                      Message Content
                    </label>
                  </div>
                  
                  <div className="border border-slate-300 rounded-lg overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-300">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-slate-700">Template Variables:</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => insertVariable("firstName")}
                        >
                          {{firstName}}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => insertVariable("discount")}
                        >
                          {{discount}}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => insertVariable("product")}
                        >
                          {{product}}
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      id="message-textarea"
                      className="border-0 focus:ring-0 resize-none"
                      rows={4}
                      placeholder="Hi {{firstName}}, we have a special offer just for you..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>
                </div>

                {/* AI Message Generator */}
                <AIMessageGenerator
                  objective={campaignType}
                  audience={selectedSegment?.name || ""}
                  onSelectMessage={handleSelectMessage}
                  selectedMessage={message}
                />

                {/* Scheduling */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Send Time
                    </label>
                    <Select value={sendTime} onValueChange={setSendTime}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Send immediately</SelectItem>
                        <SelectItem value="scheduled">Schedule for later</SelectItem>
                        <SelectItem value="optimal">Optimal time (AI recommended)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Channel
                    </label>
                    <Select value={channel} onValueChange={setChannel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select channel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="push">Push Notification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-purple-600 mt-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <div>
                      <h5 className="font-medium text-purple-800 mb-2">AI Recommendations</h5>
                      <ul className="space-y-1 text-sm text-purple-700">
                        <li>• Best send time: Tuesday 10:00 AM (23% higher open rate)</li>
                        <li>• Add urgency element for high-value segments (+15% conversion)</li>
                        <li>• Consider A/B testing subject lines for better performance</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                  <Button variant="ghost" onClick={handleSaveDraft} disabled={isCreating}>
                    Save as Draft
                  </Button>
                  <div className="flex items-center space-x-3">
                    <Button variant="outline">
                      Preview
                    </Button>
                    <Button
                      onClick={handleLaunchCampaign}
                      disabled={isLaunching || isCreating}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {(isLaunching || isCreating) && (
                        <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      )}
                      Launch Campaign
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <AudiencePreview
              audienceSize={selectedSegment?.audienceSize || 0}
              estimatedReach={92}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
