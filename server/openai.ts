import OpenAI from "openai";
import type { SegmentRule, AIMessageSuggestion } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || ""
});

/**
 * Convert natural language query to segment rules using AI
 */
export async function generateAISegmentRules(query: string): Promise<SegmentRule[]> {
  try {
    const prompt = `Convert the following natural language description into customer segmentation rules for a CRM system.

Natural language query: "${query}"

Available fields:
- totalSpend (number): Customer's total spending amount
- visitCount (number): Number of visits/orders
- lastVisit (date): Days since last visit 
- registrationDate (date): Days since registration

Available operators:
- For numbers: "gt" (greater than), "lt" (less than), "gte" (greater than or equal), "lte" (less than or equal), "eq" (equal to)
- For dates: "days_ago" (more than X days ago), "less_than_days_ago" (less than X days ago)

Logic operators: "AND", "OR"

Return a JSON array of rules in this exact format:
{
  "rules": [
    {
      "field": "totalSpend",
      "operator": "gt", 
      "value": 10000,
      "logic": "AND"
    }
  ]
}

Rules:
1. First rule should not have a logic field
2. Subsequent rules should have logic: "AND" or "OR"
3. Convert currency amounts to numbers (remove symbols)
4. Convert time periods to days as numbers
5. Use appropriate field names and operators
6. Create multiple rules for complex conditions`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at converting natural language queries into structured customer segmentation rules. Always respond with valid JSON in the exact format requested."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    if (!result.rules || !Array.isArray(result.rules)) {
      throw new Error("Invalid response format from AI");
    }

    // Validate and clean the rules
    const validatedRules: SegmentRule[] = result.rules.map((rule: any, index: number) => {
      // Remove logic from first rule
      if (index === 0) {
        const { logic, ...ruleWithoutLogic } = rule;
        return ruleWithoutLogic;
      }
      
      return {
        field: rule.field,
        operator: rule.operator,
        value: rule.value,
        logic: rule.logic || "AND"
      };
    });

    return validatedRules;

  } catch (error) {
    console.error("Error generating AI segment rules:", error);
    throw new Error("Failed to generate segment rules from natural language query");
  }
}

/**
 * Generate AI-powered message suggestions for campaigns
 */
export async function generateAIMessage(objective: string, audience: string): Promise<AIMessageSuggestion[]> {
  try {
    const prompt = `Generate 3 personalized marketing message suggestions for a campaign.

Campaign objective: "${objective}"
Target audience: "${audience}"

Requirements:
1. Messages should be concise and engaging
2. Include personalization placeholder {{firstName}}
3. Each message should have a different tone/approach
4. Consider the campaign objective and audience characteristics
5. Keep messages under 150 characters for good deliverability

Return JSON in this exact format:
{
  "messages": [
    {
      "text": "Hi {{firstName}}, message text here...",
      "tone": "Friendly, Personal",
      "confidence": 0.92
    }
  ]
}

Tone options: Friendly/Personal, Professional/Urgent, Exclusive/Rewarding, Helpful/Informative, Exciting/Promotional`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert marketing copywriter specializing in personalized customer communications. Create engaging, effective messages that drive action while maintaining brand professionalism."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    if (!result.messages || !Array.isArray(result.messages)) {
      throw new Error("Invalid response format from AI");
    }

    // Validate message suggestions
    const validatedMessages: AIMessageSuggestion[] = result.messages.map((msg: any) => ({
      text: msg.text || "",
      tone: msg.tone || "Professional",
      confidence: Math.max(0, Math.min(1, msg.confidence || 0.8))
    }));

    return validatedMessages;

  } catch (error) {
    console.error("Error generating AI messages:", error);
    throw new Error("Failed to generate AI message suggestions");
  }
}

/**
 * Generate AI insights for campaign performance
 */
export async function generateCampaignInsights(campaignData: {
  name: string;
  audienceSize: number;
  deliveryRate: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
}): Promise<string> {
  try {
    const prompt = `Analyze this campaign performance data and provide a concise, actionable insight summary.

Campaign: ${campaignData.name}
Audience Size: ${campaignData.audienceSize}
Delivery Rate: ${campaignData.deliveryRate}%
Messages Sent: ${campaignData.sentCount}
Delivered: ${campaignData.deliveredCount}
Failed: ${campaignData.failedCount}

Provide a human-readable summary in 2-3 sentences that:
1. Highlights key performance metrics
2. Identifies what went well or areas for improvement
3. Suggests actionable next steps if relevant

Return JSON in this format:
{
  "insight": "Your campaign insight text here..."
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a marketing analytics expert who provides clear, actionable insights from campaign performance data."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.insight || "Campaign analysis completed successfully.";

  } catch (error) {
    console.error("Error generating campaign insights:", error);
    return "Unable to generate campaign insights at this time.";
  }
}

/**
 * Generate optimal send time recommendations using AI
 */
export async function generateOptimalSendTime(audienceData: {
  segment: string;
  historicalPerformance?: any;
}): Promise<{
  recommendedTime: string;
  dayOfWeek: string;
  confidence: number;
  reasoning: string;
}> {
  try {
    const prompt = `Recommend the optimal send time for a marketing campaign based on audience segment and best practices.

Audience Segment: ${audienceData.segment}
Historical Performance: ${JSON.stringify(audienceData.historicalPerformance || "No historical data available")}

Consider:
1. Industry best practices for email/SMS delivery
2. Audience segment characteristics (e.g., business hours for B2B, evenings for B2C)
3. Day of week patterns
4. Time zone considerations (assume local business timezone)

Return JSON in this format:
{
  "recommendedTime": "10:00 AM",
  "dayOfWeek": "Tuesday", 
  "confidence": 0.85,
  "reasoning": "Brief explanation of why this timing is optimal"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a marketing timing optimization expert with deep knowledge of customer behavior patterns and engagement statistics."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      recommendedTime: result.recommendedTime || "10:00 AM",
      dayOfWeek: result.dayOfWeek || "Tuesday",
      confidence: Math.max(0, Math.min(1, result.confidence || 0.8)),
      reasoning: result.reasoning || "Based on industry best practices for optimal engagement."
    };

  } catch (error) {
    console.error("Error generating optimal send time:", error);
    return {
      recommendedTime: "10:00 AM",
      dayOfWeek: "Tuesday",
      confidence: 0.8,
      reasoning: "Default recommendation based on industry standards."
    };
  }
}

/**
 * Generate lookalike audience suggestions
 */
export async function generateLookalikeAudience(performingSegment: {
  name: string;
  rules: SegmentRule[];
  performance: {
    deliveryRate: number;
    engagementRate?: number;
  };
}): Promise<{
  suggestions: SegmentRule[];
  reasoning: string;
  estimatedSize: string;
}> {
  try {
    const prompt = `Based on a high-performing customer segment, suggest similar audience rules that might also perform well.

High-performing segment: ${performingSegment.name}
Current rules: ${JSON.stringify(performingSegment.rules)}
Performance: ${performingSegment.performance.deliveryRate}% delivery rate

Create a lookalike audience by:
1. Identifying key characteristics of the successful segment
2. Expanding criteria slightly to find similar customers
3. Maintaining the core value proposition

Return JSON in this format:
{
  "suggestions": [
    {
      "field": "totalSpend",
      "operator": "gt",
      "value": 8000,
      "logic": "AND"
    }
  ],
  "reasoning": "Why these rules should work well",
  "estimatedSize": "Medium (1,000-2,500 customers)"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a customer segmentation expert who excels at finding patterns in high-performing audience segments and creating effective lookalike audiences."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      suggestions: result.suggestions || [],
      reasoning: result.reasoning || "Lookalike audience based on successful segment characteristics.",
      estimatedSize: result.estimatedSize || "Medium"
    };

  } catch (error) {
    console.error("Error generating lookalike audience:", error);
    return {
      suggestions: [],
      reasoning: "Unable to generate lookalike suggestions at this time.",
      estimatedSize: "Unknown"
    };
  }
}
