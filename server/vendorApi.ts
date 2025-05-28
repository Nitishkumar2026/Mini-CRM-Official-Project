import { storage } from "./storage";
import type { Customer } from "@shared/schema";

interface DeliveryResult {
  messageId: string;
  status: "DELIVERED" | "FAILED";
  errorReason?: string;
}

// Simulate vendor API for message delivery
export async function deliverMessage(
  messageId: string,
  customer: Customer,
  message: string,
  channel: string
): Promise<DeliveryResult> {
  return new Promise((resolve) => {
    // Simulate network delay
    const delay = Math.random() * 3000 + 1000; // 1-4 seconds
    
    setTimeout(async () => {
      // Simulate 90% success rate as per requirements
      const isSuccess = Math.random() < 0.9;
      
      const result: DeliveryResult = {
        messageId,
        status: isSuccess ? "DELIVERED" : "FAILED",
        errorReason: isSuccess ? undefined : getRandomErrorReason(channel),
      };
      
      // Call delivery receipt API to update status
      try {
        await updateDeliveryStatus(result);
        resolve(result);
      } catch (error) {
        console.error("Error updating delivery status:", error);
        resolve({
          messageId,
          status: "FAILED",
          errorReason: "Internal error updating status",
        });
      }
    }, delay);
  });
}

// Simulate calling our own delivery receipt API
async function updateDeliveryStatus(result: DeliveryResult) {
  try {
    const response = await fetch(`${process.env.BASE_URL || 'http://localhost:5000'}/api/delivery-receipt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messageId: result.messageId,
        status: result.status,
        errorReason: result.errorReason,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    // If API call fails, update directly in storage
    console.warn("API call failed, updating storage directly:", error);
    await storage.updateCommunicationStatus(
      result.messageId,
      result.status,
      result.errorReason
    );
  }
}

function getRandomErrorReason(channel: string): string {
  const emailErrors = [
    "Invalid email address",
    "Mailbox full",
    "Email bounced",
    "Spam filter blocked",
    "Domain not found",
  ];
  
  const smsErrors = [
    "Invalid phone number",
    "Network error",
    "Number unreachable",
    "SMS limit exceeded",
    "Carrier blocked",
  ];
  
  const pushErrors = [
    "Device not registered",
    "App not installed",
    "Notification disabled",
    "Device offline",
    "Token expired",
  ];
  
  let errors = emailErrors;
  if (channel === "sms") errors = smsErrors;
  else if (channel === "push") errors = pushErrors;
  
  return errors[Math.floor(Math.random() * errors.length)];
}

// Batch processing for high-volume campaigns
export async function deliverMessageBatch(
  messages: Array<{
    messageId: string;
    customer: Customer;
    message: string;
    channel: string;
  }>
): Promise<DeliveryResult[]> {
  const batchSize = 100; // Process 100 messages at a time
  const results: DeliveryResult[] = [];
  
  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);
    const batchPromises = batch.map(({ messageId, customer, message, channel }) =>
      deliverMessage(messageId, customer, message, channel)
    );
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Small delay between batches to avoid overwhelming the system
    if (i + batchSize < messages.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}
