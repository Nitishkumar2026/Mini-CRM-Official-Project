import type { Express } from "express";
import { createServer, type Server } from "http";
import { simpleStorage } from "./simple-storage";
import { generateAISegmentRules } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Health check endpoint for Render
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });
  
  // Customer management endpoints
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await simpleStorage.getAllCustomers();
      res.json(customers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customer = await simpleStorage.createCustomer(req.body);
      res.status(201).json(customer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Order management endpoints
  app.post("/api/orders", async (req, res) => {
    try {
      const order = await simpleStorage.createOrder(req.body);
      res.status(201).json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Segment management endpoints
  app.get("/api/segments", async (req, res) => {
    try {
      const segments = await simpleStorage.getSegmentsByUser();
      res.json(segments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/segments", async (req, res) => {
    try {
      const segment = await simpleStorage.createSegment(req.body);
      res.status(201).json(segment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/segments/preview", async (req, res) => {
    try {
      const { rules } = req.body;
      const audienceSize = await simpleStorage.calculateAudienceSize(rules);
      res.json({ audienceSize });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI-powered segment generation
  app.post("/api/segments/ai-generate", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      const rules = await generateAISegmentRules(query);
      // TODO: Calculate audience size based on new rules. For now, returning a placeholder.
      const audienceSize = await simpleStorage.calculateAudienceSize(rules); 
      res.json({ rules, audienceSize });
    } catch (error: any) {
      console.error("Error in /api/segments/ai-generate:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI segment rules" });
    }
  });

  // Campaign management endpoints
  app.get("/api/campaigns", async (req, res) => {
    try {
      const campaigns = await simpleStorage.getCampaignsByUser();
      res.json(campaigns);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/campaigns", async (req, res) => {
    try {
      const campaign = await simpleStorage.createCampaign(req.body);
      res.status(201).json(campaign);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI message generation (mock response)
  app.post("/api/ai/messages", async (req, res) => {
    try {
      const { objective, audience } = req.body;
      if (!objective || !audience) {
        return res.status(400).json({ error: "Objective and audience are required" });
      }

      // Mock AI suggestions
      const suggestions = [
        {
          text: "आपके लिए विशेष छूट! अभी खरीदारी करें और 20% तक बचाएं।",
          tone: "promotional",
          confidence: 0.85
        },
        {
          text: "नमस्ते! आपके पसंदीदा उत्पादों पर बेहतरीन ऑफर्स उपलब्ध हैं।",
          tone: "friendly",
          confidence: 0.78
        }
      ];
      res.json({ suggestions });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Analytics endpoints
  app.get("/api/analytics/overview", async (req, res) => {
    try {
      const customers = await simpleStorage.getAllCustomers();
      const campaigns = await simpleStorage.getCampaignsByUser();
      const segments = await simpleStorage.getSegmentsByUser();

      const activeCampaigns = campaigns.filter((c: any) => c.status === 'active').length;
      const totalRevenue = customers.reduce((sum: number, customer: any) => 
        sum + parseFloat(customer.totalSpend || '0'), 0);

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

  const httpServer = createServer(app);
  return httpServer;
}