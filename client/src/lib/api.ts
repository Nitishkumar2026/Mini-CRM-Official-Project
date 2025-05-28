import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Customer, Order, Segment, Campaign, SegmentRule, AIMessageSuggestion, CampaignStats, AudiencePreview } from "@/types";

// Customer API hooks
export function useCustomers() {
  return useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (customer: Omit<Customer, "id" | "createdAt" | "updatedAt">) => {
      const response = await apiRequest("POST", "/api/customers", customer);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (order: Omit<Order, "id" | "createdAt">) => {
      const response = await apiRequest("POST", "/api/orders", order);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
    },
  });
}

// Segment API hooks
export function useSegments() {
  return useQuery<Segment[]>({
    queryKey: ["/api/segments"],
  });
}

export function useCreateSegment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (segment: Omit<Segment, "id" | "createdAt" | "updatedAt" | "audienceSize" | "userId">) => {
      const response = await apiRequest("POST", "/api/segments", segment);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/segments"] });
    },
  });
}

export function usePreviewSegment() {
  return useMutation({
    mutationFn: async (rules: SegmentRule[]): Promise<AudiencePreview> => {
      const response = await apiRequest("POST", "/api/segments/preview", { rules });
      return response.json();
    },
  });
}

export function useAISegmentGeneration() {
  return useMutation({
    mutationFn: async (query: string): Promise<{ rules: SegmentRule[]; audienceSize: number }> => {
      const response = await apiRequest("POST", "/api/segments/ai-generate", { query });
      return response.json();
    },
  });
}

// Campaign API hooks
export function useCampaigns() {
  return useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (campaign: Omit<Campaign, "id" | "createdAt" | "updatedAt" | "sentCount" | "deliveredCount" | "failedCount" | "deliveryRate" | "launchedAt" | "userId">) => {
      const response = await apiRequest("POST", "/api/campaigns", campaign);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
    },
  });
}

export function useLaunchCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (campaignId: number) => {
      const response = await apiRequest("POST", `/api/campaigns/${campaignId}/launch`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
    },
  });
}

export function useAIMessageGeneration() {
  return useMutation({
    mutationFn: async ({ objective, audience }: { objective: string; audience: string }): Promise<{ messages: AIMessageSuggestion[] }> => {
      const response = await apiRequest("POST", "/api/campaigns/ai-message", { objective, audience });
      return response.json();
    },
  });
}

// Analytics API hooks
export function useAnalyticsOverview() {
  return useQuery<CampaignStats>({
    queryKey: ["/api/analytics/overview"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
