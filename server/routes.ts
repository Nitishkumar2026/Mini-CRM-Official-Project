import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomerSchema, insertOrderSchema, insertSegmentSchema, insertCampaignSchema, insertCommunicationLogSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { generateAISegmentRules, generateAIMessage } from "./openai";
import { deliverMessage } from "./vendorApi";

const PgSession = ConnectPgSimple(session);

// Configure Passport
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await storage.getUserByGoogleId(profile.id);
    
    if (!user) {
      user = await storage.createUser({
        googleId: profile.id,
        email: profile.emails?.[0]?.value || "",
        name: profile.displayName || "",
        avatar: profile.photos?.[0]?.value,
      });
    }
    
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    store: new PgSession({
      pool: pool,
      tableName: 'session'
    }),
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ error: "Authentication required" });
  };

  // Auth routes
  app.get("/api/auth/google", passport.authenticate("google", {
    scope: ["profile", "email"]
  }));

  app.get("/api/auth/google/callback", 
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => {
      res.redirect("/");
    }
  );

  app.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  // Customer routes
  app.get("/api/customers", requireAuth, async (req, res) => {
    try {
      const customers = await storage.getAllCustomers((req.user as any).id);
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      
      // Check if customer exists by email
      const existingCustomer = await storage.getCustomerByEmail(validatedData.email);
      
      let customer;
      if (existingCustomer) {
        // Update existing customer
        customer = await storage.updateCustomer(existingCustomer.id, validatedData);
      } else {
        // Create new customer
        customer = await storage.createCustomer(validatedData);
      }
      
      res.json({ success: true, customer });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      console.error("Error creating/updating customer:", error);
      res.status(500).json({ error: "Failed to process customer data" });
    }
  });

  // Order routes
  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validatedData);
      res.json({ success: true, order });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      console.error("Error creating order:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Segment routes
  app.get("/api/segments", requireAuth, async (req, res) => {
    try {
      const segments = await storage.getSegmentsByUser((req.user as any).id);
      res.json(segments);
    } catch (error) {
      console.error("Error fetching segments:", error);
      res.status(500).json({ error: "Failed to fetch segments" });
    }
  });

  app.post("/api/segments", requireAuth, async (req, res) => {
    try {
      const validatedData = insertSegmentSchema.parse({
        ...req.body,
        userId: (req.user as any).id
      });
      const segment = await storage.createSegment(validatedData);
      res.json({ success: true, segment });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      console.error("Error creating segment:", error);
      res.status(500).json({ error: "Failed to create segment" });
    }
  });

  app.get("/api/segments/:id/size", requireAuth, async (req, res) => {
    try {
      const segmentId = parseInt(req.params.id);
      const segment = await storage.getSegment(segmentId);
      
      if (!segment) {
        return res.status(404).json({ error: "Segment not found" });
      }
      
      const audienceSize = await storage.calculateAudienceSize(segment.rules);
      res.json({ audienceSize, lastUpdated: new Date().toISOString() });
    } catch (error) {
      console.error("Error calculating audience size:", error);
      res.status(500).json({ error: "Failed to calculate audience size" });
    }
  });

  app.post("/api/segments/preview", requireAuth, async (req, res) => {
    try {
      const { rules } = req.body;
      const audienceSize = await storage.calculateAudienceSize(rules);
      res.json({ audienceSize });
    } catch (error) {
      console.error("Error previewing segment:", error);
      res.status(500).json({ error: "Failed to preview segment" });
    }
  });

  // AI-powered segment generation
  app.post("/api/segments/ai-generate", requireAuth, async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }
      
      const rules = await generateAISegmentRules(query);
      const audienceSize = await storage.calculateAudienceSize(rules);
      
      res.json({ rules, audienceSize });
    } catch (error) {
      console.error("Error generating AI segment rules:", error);
      res.status(500).json({ error: "Failed to generate segment rules" });
    }
  });

  // Campaign routes
  app.get("/api/campaigns", requireAuth, async (req, res) => {
    try {
      const campaigns = await storage.getCampaignsByUser((req.user as any).id);
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  });

  app.post("/api/campaigns", requireAuth, async (req, res) => {
    try {
      const validatedData = insertCampaignSchema.parse({
        ...req.body,
        userId: (req.user as any).id
      });
      
      const campaign = await storage.createCampaign(validatedData);
      
      // If campaign is set to launch immediately, start delivery process
      if (validatedData.status === "active") {
        await launchCampaign(campaign.id);
      }
      
      res.json({ success: true, campaign });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      console.error("Error creating campaign:", error);
      res.status(500).json({ error: "Failed to create campaign" });
    }
  });

  app.post("/api/campaigns/:id/launch", requireAuth, async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      await launchCampaign(campaignId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error launching campaign:", error);
      res.status(500).json({ error: "Failed to launch campaign" });
    }
  });

  // AI message generation
  app.post("/api/campaigns/ai-message", requireAuth, async (req, res) => {
    try {
      const { objective, audience } = req.body;
      const messages = await generateAIMessage(objective, audience);
      res.json({ messages });
    } catch (error) {
      console.error("Error generating AI messages:", error);
      res.status(500).json({ error: "Failed to generate messages" });
    }
  });

  // Delivery receipt webhook
  app.post("/api/delivery-receipt", async (req, res) => {
    try {
      const { messageId, status, errorReason } = req.body;
      
      await storage.updateCommunicationStatus(messageId, status, errorReason);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating delivery status:", error);
      res.status(500).json({ error: "Failed to update delivery status" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/overview", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const customers = await storage.getAllCustomers(userId);
      const campaigns = await storage.getCampaignsByUser(userId);
      const segments = await storage.getSegmentsByUser(userId);
      
      const totalCustomers = customers.length;
      const activeCampaigns = campaigns.filter(c => c.status === "active").length;
      const totalCampaigns = campaigns.length;
      
      // Calculate average delivery rate
      const campaignsWithDelivery = campaigns.filter(c => c.deliveryRate && parseFloat(c.deliveryRate) > 0);
      const avgDeliveryRate = campaignsWithDelivery.length > 0 
        ? campaignsWithDelivery.reduce((sum, c) => sum + parseFloat(c.deliveryRate), 0) / campaignsWithDelivery.length
        : 0;
      
      // Calculate revenue impact (sum of total spend for all customers)
      const revenueImpact = customers.reduce((sum, c) => sum + parseFloat(c.totalSpend || "0"), 0);
      
      res.json({
        totalCustomers,
        activeCampaigns,
        totalCampaigns,
        deliveryRate: avgDeliveryRate.toFixed(1),
        revenueImpact: revenueImpact.toFixed(0),
        activeSegments: segments.length,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Campaign launch helper function
  async function launchCampaign(campaignId: number) {
    const campaign = await storage.getCampaign(campaignId);
    if (!campaign) throw new Error("Campaign not found");
    
    // Get customers for this campaign's segment
    const customers = await storage.getCustomersForSegment(campaign.segmentId);
    
    // Update campaign status and audience size
    await storage.updateCampaign(campaignId, {
      status: "active",
      audienceSize: customers.length,
      launchedAt: new Date(),
    });
    
    // Create communication logs and deliver messages
    for (const customer of customers) {
      const messageId = `msg_${Date.now()}_${customer.id}`;
      
      // Create communication log
      await storage.createCommunicationLog({
        messageId,
        campaignId,
        customerId: customer.id,
        status: "SENT",
        channel: campaign.channel,
        message: campaign.message.replace(/\{\{firstName\}\}/g, customer.name.split(' ')[0]),
        sentAt: new Date(),
      });
      
      // Simulate message delivery via vendor API
      setTimeout(async () => {
        await deliverMessage(messageId, customer, campaign.message, campaign.channel);
      }, Math.random() * 5000); // Stagger delivery over 5 seconds
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}
