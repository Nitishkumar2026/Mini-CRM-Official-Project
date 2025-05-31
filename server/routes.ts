import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomerSchema, insertOrderSchema, insertSegmentSchema, insertCampaignSchema, insertCommunicationLogSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { generateAISegmentRules, generateAIMessage } from "./openai";
import { deliverMessage } from "./vendorApi";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Mock user for all requests (since auth is removed)
  const mockUser = { id: 1, name: "Demo User", email: "demo@example.com" };

  // Customer management endpoints
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getAllCustomers(mockUser.id);
      res.json(customers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const result = insertCustomerSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).toString() });
      }

      const customer = await storage.createCustomer(result.data);
      res.status(201).json(customer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Order management endpoints
  app.post("/api/orders", async (req, res) => {
    try {
      const result = insertOrderSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).toString() });
      }

      const order = await storage.createOrder(result.data);
      res.status(201).json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Segment management endpoints
  app.get("/api/segments", async (req, res) => {
    try {
      const segments = await storage.getSegmentsByUser(mockUser.id);
      res.json(segments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/segments", async (req, res) => {
    try {
      const result = insertSegmentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).toString() });
      }

      const segment = await storage.createSegment({
        ...result.data,
        userId: mockUser.id
      });
      res.status(201).json(segment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/segments/preview", async (req, res) => {
    try {
      const { rules } = req.body;
      const audienceSize = await storage.calculateAudienceSize(rules);
      res.json({ audienceSize });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI-powered segment generation
  app.post("/api/ai/segments", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      const rules = await generateAISegmentRules(query);
      res.json({ rules });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Campaign management endpoints
  app.get("/api/campaigns", async (req, res) => {
    try {
      const campaigns = await storage.getCampaignsByUser(mockUser.id);
      res.json(campaigns);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/campaigns", async (req, res) => {
    try {
      const result = insertCampaignSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).toString() });
      }

      const campaign = await storage.createCampaign({
        ...result.data,
        userId: mockUser.id
      });

      // Launch campaign immediately
      await launchCampaign(campaign.id);

      res.status(201).json(campaign);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI message generation
  app.post("/api/ai/messages", async (req, res) => {
    try {
      const { objective, audience } = req.body;
      if (!objective || !audience) {
        return res.status(400).json({ error: "Objective and audience are required" });
      }

      const suggestions = await generateAIMessage(objective, audience);
      res.json({ suggestions });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Analytics endpoints
  app.get("/api/analytics/overview", async (req, res) => {
    try {
      const customers = await storage.getAllCustomers(mockUser.id);
      const campaigns = await storage.getCampaignsByUser(mockUser.id);
      const segments = await storage.getSegmentsByUser(mockUser.id);

      const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
      const totalRevenue = customers.reduce((sum, customer) => sum + parseFloat(customer.totalSpend || '0'), 0);

      res.json({
        totalCustomers: customers.length,
        activeCampaigns,
        totalCampaigns: campaigns.length,
        deliveryRate: "92%",
        revenueImpact: `₹${totalRevenue.toLocaleString()}`,
        activeSegments: segments.length
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Campaign launch function
  async function launchCampaign(campaignId: number) {
    try {
      const campaign = await storage.getCampaign(campaignId);
      if (!campaign) return;

      const customers = await storage.getCustomersForSegment(campaign.segmentId);
      
      await storage.updateCampaign(campaignId, { 
        status: 'active'
      });

      // Send messages to all customers
      for (const customer of customers) {
        try {
          const messageId = `msg_${Date.now()}_${customer.id}`;
          
          // Log the communication attempt
          await storage.createCommunicationLog({
            campaignId,
            customerId: customer.id,
            messageId,
            channel: campaign.channel as any,
            message: campaign.message,
            status: 'SENT',
            sentAt: new Date()
          });

          // Simulate message delivery
          deliverMessage(campaign.message, customer, campaign.channel as any);
        } catch (error) {
          console.error(`Failed to send message to customer ${customer.id}:`, error);
        }
      }

      // Update campaign status to completed
      await storage.updateCampaign(campaignId, { 
        status: 'completed'
      });

    } catch (error) {
      console.error('Campaign launch error:', error);
      await storage.updateCampaign(campaignId, { 
        status: 'failed'
      });
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}