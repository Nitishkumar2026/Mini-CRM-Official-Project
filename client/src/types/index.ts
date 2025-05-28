import type { User, Customer, Order, Segment, Campaign, CommunicationLog, SegmentRule } from "@shared/schema";

export type {
  User,
  Customer,
  Order,
  Segment,
  Campaign,
  CommunicationLog,
  SegmentRule,
};

export interface AIMessageSuggestion {
  text: string;
  tone: string;
  confidence: number;
}

export interface CampaignStats {
  totalCustomers: number;
  activeCampaigns: number;
  totalCampaigns: number;
  deliveryRate: string;
  revenueImpact: string;
  activeSegments: number;
}

export interface AudiencePreview {
  audienceSize: number;
  estimatedReach?: number;
  lastUpdated: string;
}

export interface AuthUser {
  id: number;
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
}
