import { users, customers, orders, segments, campaigns, communicationLog, type User, type InsertUser, type Customer, type InsertCustomer, type Order, type InsertOrder, type Segment, type InsertSegment, type Campaign, type InsertCampaign, type CommunicationLog, type InsertCommunicationLog, type SegmentRule } from "@shared/schema";
import { db } from "./db";
import { eq, and, or, gt, lt, gte, lte, desc, asc, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Customer methods
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  getAllCustomers(userId: number): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer>;

  // Order methods
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByCustomer(customerId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;

  // Segment methods
  getSegment(id: number): Promise<Segment | undefined>;
  getSegmentsByUser(userId: number): Promise<Segment[]>;
  createSegment(segment: InsertSegment): Promise<Segment>;
  updateSegment(id: number, segment: Partial<InsertSegment>): Promise<Segment>;
  deleteSegment(id: number): Promise<void>;
  calculateAudienceSize(rules: SegmentRule[]): Promise<number>;
  getCustomersForSegment(segmentId: number): Promise<Customer[]>;

  // Campaign methods
  getCampaign(id: number): Promise<Campaign | undefined>;
  getCampaignsByUser(userId: number): Promise<Campaign[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, campaign: Partial<InsertCampaign>): Promise<Campaign>;
  deleteCampaign(id: number): Promise<void>;

  // Communication log methods
  getCommunicationLog(campaignId: number): Promise<CommunicationLog[]>;
  createCommunicationLog(log: InsertCommunicationLog): Promise<CommunicationLog>;
  updateCommunicationStatus(messageId: string, status: string, errorReason?: string): Promise<void>;
  getCampaignStats(campaignId: number): Promise<{ sent: number; delivered: number; failed: number; deliveryRate: number }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.email, email));
    return customer || undefined;
  }

  async getAllCustomers(userId: number): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const [customer] = await db
      .insert(customers)
      .values({
        ...insertCustomer,
        updatedAt: new Date(),
      })
      .returning();
    return customer;
  }

  async updateCustomer(id: number, customerUpdate: Partial<InsertCustomer>): Promise<Customer> {
    const [customer] = await db
      .update(customers)
      .set({
        ...customerUpdate,
        updatedAt: new Date(),
      })
      .where(eq(customers.id, id))
      .returning();
    return customer;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getOrdersByCustomer(customerId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.customerId, customerId)).orderBy(desc(orders.orderDate));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values(insertOrder)
      .returning();

    // Update customer stats
    const customerOrders = await this.getOrdersByCustomer(insertOrder.customerId);
    const totalSpend = customerOrders.reduce((sum, o) => sum + parseFloat(o.amount), 0);
    await this.updateCustomer(insertOrder.customerId, {
      totalSpend: totalSpend.toString(),
      visitCount: customerOrders.length,
      lastVisit: new Date(),
    });

    return order;
  }

  async getSegment(id: number): Promise<Segment | undefined> {
    const [segment] = await db.select().from(segments).where(eq(segments.id, id));
    return segment || undefined;
  }

  async getSegmentsByUser(userId: number): Promise<Segment[]> {
    return await db.select().from(segments).where(eq(segments.userId, userId)).orderBy(desc(segments.createdAt));
  }

  async createSegment(insertSegment: InsertSegment): Promise<Segment> {
    const audienceSize = await this.calculateAudienceSize(insertSegment.rules);
    
    const [segment] = await db
      .insert(segments)
      .values({
        ...insertSegment,
        audienceSize,
        updatedAt: new Date(),
      })
      .returning();
    return segment;
  }

  async updateSegment(id: number, segmentUpdate: Partial<InsertSegment>): Promise<Segment> {
    let updateData = { ...segmentUpdate, updatedAt: new Date() };
    
    if (segmentUpdate.rules) {
      const audienceSize = await this.calculateAudienceSize(segmentUpdate.rules);
      updateData.audienceSize = audienceSize;
    }

    const [segment] = await db
      .update(segments)
      .set(updateData)
      .where(eq(segments.id, id))
      .returning();
    return segment;
  }

  async deleteSegment(id: number): Promise<void> {
    await db.delete(segments).where(eq(segments.id, id));
  }

  async calculateAudienceSize(rules: SegmentRule[]): Promise<number> {
    try {
      let query = db.select({ count: sql<number>`count(*)` }).from(customers);
      
      if (rules.length > 0) {
        const conditions = this.buildWhereConditions(rules);
        if (conditions) {
          query = query.where(conditions);
        }
      }

      const [result] = await query;
      return result.count;
    } catch (error) {
      console.error('Error calculating audience size:', error);
      return 0;
    }
  }

  private buildWhereConditions(rules: SegmentRule[]) {
    if (rules.length === 0) return undefined;

    const conditions = rules.map((rule, index) => {
      const condition = this.buildRuleCondition(rule);
      if (index === 0) return condition;
      
      if (rule.logic === 'OR') {
        return or(conditions[index - 1], condition);
      } else {
        return and(conditions[index - 1], condition);
      }
    });

    return conditions[conditions.length - 1];
  }

  private buildRuleCondition(rule: SegmentRule) {
    const { field, operator, value } = rule;
    
    switch (field) {
      case 'totalSpend':
        const spendValue = parseFloat(value.toString());
        switch (operator) {
          case 'gt':
          case 'greater than':
            return gt(customers.totalSpend, spendValue.toString());
          case 'lt':
          case 'less than':
            return lt(customers.totalSpend, spendValue.toString());
          case 'gte':
          case 'greater than or equal':
            return gte(customers.totalSpend, spendValue.toString());
          case 'lte':
          case 'less than or equal':
            return lte(customers.totalSpend, spendValue.toString());
          case 'eq':
          case 'equal to':
            return eq(customers.totalSpend, spendValue.toString());
        }
        break;
      case 'visitCount':
        const visitValue = parseInt(value.toString());
        switch (operator) {
          case 'gt':
          case 'greater than':
            return gt(customers.visitCount, visitValue);
          case 'lt':
          case 'less than':
            return lt(customers.visitCount, visitValue);
          case 'eq':
          case 'equal to':
            return eq(customers.visitCount, visitValue);
        }
        break;
      case 'lastVisit':
        const daysAgo = parseInt(value.toString());
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - daysAgo);
        
        switch (operator) {
          case 'days_ago':
          case 'more than days ago':
            return lt(customers.lastVisit, dateThreshold);
          case 'less_than_days_ago':
          case 'less than days ago':
            return gt(customers.lastVisit, dateThreshold);
        }
        break;
      default:
        return eq(customers.id, -1); // Return no results for unknown fields
    }
    
    return eq(customers.id, -1); // Return no results for unknown operators
  }

  async getCustomersForSegment(segmentId: number): Promise<Customer[]> {
    const segment = await this.getSegment(segmentId);
    if (!segment) return [];

    let query = db.select().from(customers);
    
    if (segment.rules.length > 0) {
      const conditions = this.buildWhereConditions(segment.rules);
      if (conditions) {
        query = query.where(conditions);
      }
    }

    return await query;
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign || undefined;
  }

  async getCampaignsByUser(userId: number): Promise<Campaign[]> {
    return await db.select().from(campaigns).where(eq(campaigns.userId, userId)).orderBy(desc(campaigns.createdAt));
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const [campaign] = await db
      .insert(campaigns)
      .values({
        ...insertCampaign,
        updatedAt: new Date(),
      })
      .returning();
    return campaign;
  }

  async updateCampaign(id: number, campaignUpdate: Partial<InsertCampaign>): Promise<Campaign> {
    const [campaign] = await db
      .update(campaigns)
      .set({
        ...campaignUpdate,
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, id))
      .returning();
    return campaign;
  }

  async deleteCampaign(id: number): Promise<void> {
    await db.delete(campaigns).where(eq(campaigns.id, id));
  }

  async getCommunicationLog(campaignId: number): Promise<CommunicationLog[]> {
    return await db.select().from(communicationLog).where(eq(communicationLog.campaignId, campaignId)).orderBy(desc(communicationLog.createdAt));
  }

  async createCommunicationLog(insertLog: InsertCommunicationLog): Promise<CommunicationLog> {
    const [log] = await db
      .insert(communicationLog)
      .values(insertLog)
      .returning();
    return log;
  }

  async updateCommunicationStatus(messageId: string, status: string, errorReason?: string): Promise<void> {
    const updateData: any = { status };
    
    if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    }
    
    if (errorReason) {
      updateData.errorReason = errorReason;
    }

    await db
      .update(communicationLog)
      .set(updateData)
      .where(eq(communicationLog.messageId, messageId));
  }

  async getCampaignStats(campaignId: number): Promise<{ sent: number; delivered: number; failed: number; deliveryRate: number }> {
    const logs = await this.getCommunicationLog(campaignId);
    
    const sent = logs.filter(log => log.status === 'SENT' || log.status === 'DELIVERED').length;
    const delivered = logs.filter(log => log.status === 'DELIVERED').length;
    const failed = logs.filter(log => log.status === 'FAILED').length;
    const deliveryRate = sent > 0 ? (delivered / sent) * 100 : 0;

    // Update campaign stats
    await this.updateCampaign(campaignId, {
      sentCount: sent,
      deliveredCount: delivered,
      failedCount: failed,
      deliveryRate: deliveryRate.toString(),
    });

    return { sent, delivered, failed, deliveryRate };
  }
}

export const storage = new DatabaseStorage();
