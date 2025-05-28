import { pgTable, text, serial, integer, boolean, timestamp, json, decimal, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  googleId: text("google_id").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  customerId: text("customer_id").unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  totalSpend: decimal("total_spend", { precision: 10, scale: 2 }).default("0"),
  visitCount: integer("visit_count").default(0),
  lastVisit: timestamp("last_visit"),
  registrationDate: timestamp("registration_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderId: text("order_id").unique(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  orderDate: timestamp("order_date").notNull(),
  items: json("items").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const segments = pgTable("segments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  rules: json("rules").$type<SegmentRule[]>().notNull(),
  audienceSize: integer("audience_size").default(0),
  userId: integer("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  segmentId: integer("segment_id").references(() => segments.id).notNull(),
  message: text("message").notNull(),
  channel: text("channel").notNull(),
  status: text("status").notNull().default("draft"),
  audienceSize: integer("audience_size").default(0),
  sentCount: integer("sent_count").default(0),
  deliveredCount: integer("delivered_count").default(0),
  failedCount: integer("failed_count").default(0),
  deliveryRate: decimal("delivery_rate", { precision: 5, scale: 2 }).default("0"),
  userId: integer("user_id").references(() => users.id).notNull(),
  scheduledAt: timestamp("scheduled_at"),
  launchedAt: timestamp("launched_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const communicationLog = pgTable("communication_log", {
  id: serial("id").primaryKey(),
  messageId: uuid("message_id").defaultRandom().notNull(),
  campaignId: integer("campaign_id").references(() => campaigns.id).notNull(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  status: text("status").notNull(), // SENT, DELIVERED, FAILED
  channel: text("channel").notNull(),
  message: text("message").notNull(),
  errorReason: text("error_reason"),
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  segments: many(segments),
  campaigns: many(campaigns),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
  communications: many(communicationLog),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
}));

export const segmentsRelations = relations(segments, ({ one, many }) => ({
  user: one(users, {
    fields: [segments.userId],
    references: [users.id],
  }),
  campaigns: many(campaigns),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  user: one(users, {
    fields: [campaigns.userId],
    references: [users.id],
  }),
  segment: one(segments, {
    fields: [campaigns.segmentId],
    references: [segments.id],
  }),
  communications: many(communicationLog),
}));

export const communicationLogRelations = relations(communicationLog, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [communicationLog.campaignId],
    references: [campaigns.id],
  }),
  customer: one(customers, {
    fields: [communicationLog.customerId],
    references: [customers.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export const insertSegmentSchema = createInsertSchema(segments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  audienceSize: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  sentCount: true,
  deliveredCount: true,
  failedCount: true,
  deliveryRate: true,
  launchedAt: true,
});

export const insertCommunicationLogSchema = createInsertSchema(communicationLog).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type Segment = typeof segments.$inferSelect;
export type InsertSegment = z.infer<typeof insertSegmentSchema>;

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

export type CommunicationLog = typeof communicationLog.$inferSelect;
export type InsertCommunicationLog = z.infer<typeof insertCommunicationLogSchema>;

// Segment rule types
export interface SegmentRule {
  field: string;
  operator: string;
  value: string | number;
  logic?: "AND" | "OR";
}

export interface SegmentGroup {
  rules: SegmentRule[];
  logic: "AND" | "OR";
}

// Campaign types
export type CampaignStatus = "draft" | "scheduled" | "active" | "completed" | "failed";
export type CommunicationStatus = "SENT" | "DELIVERED" | "FAILED";
export type CampaignChannel = "email" | "sms" | "push";
