import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SegmentRule } from "@/types";

interface RuleBuilderProps {
  rules: SegmentRule[];
  onChange: (rules: SegmentRule[]) => void;
  onPreview: () => void;
  audienceSize?: number;
}

const fieldOptions = [
  { value: "totalSpend", label: "Total Spend" },
  { value: "lastVisit", label: "Last Visit" },
  { value: "visitCount", label: "Visit Count" },
  { value: "registrationDate", label: "Registration Date" },
];

const operatorOptions = {
  totalSpend: [
    { value: "gt", label: "Greater than" },
    { value: "lt", label: "Less than" },
    { value: "gte", label: "Greater than or equal" },
    { value: "lte", label: "Less than or equal" },
    { value: "eq", label: "Equal to" },
  ],
  visitCount: [
    { value: "gt", label: "Greater than" },
    { value: "lt", label: "Less than" },
    { value: "eq", label: "Equal to" },
  ],
  lastVisit: [
    { value: "days_ago", label: "More than days ago" },
    { value: "less_than_days_ago", label: "Less than days ago" },
  ],
  registrationDate: [
    { value: "days_ago", label: "More than days ago" },
    { value: "less_than_days_ago", label: "Less than days ago" },
  ],
};

export function RuleBuilder({ rules, onChange, onPreview, audienceSize }: RuleBuilderProps) {
  const addRule = () => {
    const newRule: SegmentRule = {
      field: "totalSpend",
      operator: "gt",
      value: "",
      logic: rules.length > 0 ? "AND" : undefined,
    };
    onChange([...rules, newRule]);
  };

  const updateRule = (index: number, updates: Partial<SegmentRule>) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], ...updates };
    onChange(newRules);
  };

  const removeRule = (index: number) => {
    const newRules = rules.filter((_, i) => i !== index);
    // Update logic for the first rule if it exists
    if (newRules.length > 0 && newRules[0].logic) {
      newRules[0].logic = undefined;
    }
    onChange(newRules);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Audience Rules</CardTitle>
          <Button onClick={addRule} variant="outline" size="sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Rule
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {rules.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>No rules defined. Click "Add Rule" to get started.</p>
          </div>
        ) : (
          rules.map((rule, index) => (
            <div key={index} className="space-y-3">
              {index > 0 && rule.logic && (
                <div className="flex justify-center">
                  <Badge variant="secondary" className="bg-primary text-primary-foreground">
                    {rule.logic}
                  </Badge>
                </div>
              )}
              
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg border">
                <Select
                  value={rule.field}
                  onValueChange={(value) => updateRule(index, { field: value, operator: operatorOptions[value as keyof typeof operatorOptions][0].value })}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={rule.operator}
                  onValueChange={(value) => updateRule(index, { operator: value })}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {operatorOptions[rule.field as keyof typeof operatorOptions]?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type={rule.field === "totalSpend" ? "number" : "text"}
                  placeholder={rule.field === "totalSpend" ? "10000" : rule.field.includes("Date") || rule.field === "lastVisit" ? "90" : "3"}
                  value={rule.value}
                  onChange={(e) => updateRule(index, { value: e.target.value })}
                  className="flex-1"
                />

                {index > 0 && (
                  <Select
                    value={rule.logic || "AND"}
                    onValueChange={(value: "AND" | "OR") => updateRule(index, { logic: value })}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND">AND</SelectItem>
                      <SelectItem value="OR">OR</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRule(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </div>
            </div>
          ))
        )}

        {rules.length > 0 && (
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-800 mb-2">Audience Preview</h4>
                <p className="text-sm text-slate-600">
                  This segment will include{" "}
                  <span className="font-semibold text-primary">
                    {audienceSize ? audienceSize.toLocaleString() : "calculating..."}
                  </span>{" "}
                  customers
                </p>
              </div>
              <Button onClick={onPreview} variant="outline">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
