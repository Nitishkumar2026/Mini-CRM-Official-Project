// Simple in-memory storage without authentication
export class SimpleStorage {
  private customers: any[] = [
    { id: 1, name: "राज शर्मा", email: "raj@example.com", totalSpend: "15000", visitCount: 5, phone: "+91-9876543210" },
    { id: 2, name: "प्रिया पटेल", email: "priya@example.com", totalSpend: "8500", visitCount: 3, phone: "+91-9876543211" },
    { id: 3, name: "अमित कुमार", email: "amit@example.com", totalSpend: "25000", visitCount: 8, phone: "+91-9876543212" },
  ];

  private segments: any[] = [
    { id: 1, name: "हाई वैल्यू कस्टमर्स", rules: [], audienceSize: 150 },
    { id: 2, name: "नए कस्टमर्स", rules: [], audienceSize: 89 },
  ];

  private campaigns: any[] = [
    { id: 1, name: "दिवाली सेल", status: "completed", segmentId: 1, message: "दिवाली की शुभकामनाएं! 20% डिस्काउंट पाएं", channel: "sms", audienceSize: 150 },
    { id: 2, name: "न्यू यीयर ऑफर", status: "active", segmentId: 2, message: "नया साल मुबारक! स्पेशल डील्स", channel: "email", audienceSize: 89 },
  ];

  async getAllCustomers(): Promise<any[]> {
    return this.customers;
  }

  async createCustomer(data: any): Promise<any> {
    const newCustomer = { id: Date.now(), ...data };
    this.customers.push(newCustomer);
    return newCustomer;
  }

  async getSegmentsByUser(): Promise<any[]> {
    return this.segments;
  }

  async createSegment(data: any): Promise<any> {
    const newSegment = { id: Date.now(), ...data };
    this.segments.push(newSegment);
    return newSegment;
  }

  async calculateAudienceSize(rules: any[]): Promise<number> {
    return Math.floor(Math.random() * 200) + 50; // Random audience size
  }

  async getCampaignsByUser(): Promise<any[]> {
    return this.campaigns;
  }

  async createCampaign(data: any): Promise<any> {
    const newCampaign = { id: Date.now(), status: "active", ...data };
    this.campaigns.push(newCampaign);
    return newCampaign;
  }

  async createOrder(data: any): Promise<any> {
    return { id: Date.now(), ...data };
  }
}

export const simpleStorage = new SimpleStorage();