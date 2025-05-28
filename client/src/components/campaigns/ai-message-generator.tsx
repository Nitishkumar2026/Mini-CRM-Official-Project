import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAIMessageGeneration } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { AIMessageSuggestion } from "@/types";

interface AIMessageGeneratorProps {
  objective: string;
  audience: string;
  onSelectMessage: (message: string) => void;
  selectedMessage?: string;
}

export function AIMessageGenerator({ objective, audience, onSelectMessage, selectedMessage }: AIMessageGeneratorProps) {
  const [suggestions, setSuggestions] = useState<AIMessageSuggestion[]>([]);
  const { mutate: generateMessages, isPending } = useAIMessageGeneration();
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!objective || !audience) {
      toast({
        title: "Missing Information",
        description: "Please provide campaign objective and audience information.",
        variant: "destructive",
      });
      return;
    }

    generateMessages(
      { objective, audience },
      {
        onSuccess: (data) => {
          setSuggestions(data.messages);
          toast({
            title: "Messages Generated",
            description: "AI has generated personalized message suggestions.",
          });
        },
        onError: () => {
          toast({
            title: "Generation Failed",
            description: "Failed to generate message suggestions. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const defaultSuggestions: AIMessageSuggestion[] = [
    {
      text: "Hi {{firstName}}, we miss you! Here's 20% off your next purchase to welcome you back!",
      tone: "Friendly, Personal",
      confidence: 0.92,
    },
    {
      text: "{{firstName}}, exclusive offer just for you: Save 20% on premium products. Limited time!",
      tone: "Professional, Urgent",
      confidence: 0.88,
    },
    {
      text: "Your VIP status unlocks special savings, {{firstName}}. Enjoy 20% off today only!",
      tone: "Exclusive, Rewarding",
      confidence: 0.85,
    },
  ];

  const displaySuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions;

  return (
    <Card className="bg-emerald-50 border-emerald-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-emerald-700">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
          </svg>
          <span>AI Message Generator</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-emerald-600">
          Generate personalized messages based on your campaign objective
        </p>
        
        <div className="space-y-3">
          {displaySuggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`bg-white border rounded-lg p-3 cursor-pointer transition-colors ${
                selectedMessage === suggestion.text
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-emerald-200 hover:border-emerald-300"
              }`}
              onClick={() => onSelectMessage(suggestion.text)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-slate-700 mb-1">{suggestion.text}</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {suggestion.tone}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {Math.round(suggestion.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  {selectedMessage === suggestion.text ? (
                    <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <Button
          onClick={handleGenerate}
          disabled={isPending}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          {isPending && (
            <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Generate More
        </Button>
      </CardContent>
    </Card>
  );
}
