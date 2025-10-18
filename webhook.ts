// Webhook notifications utility
export interface ServiceRequestWebhookPayload {
  requestId: string;
  title: string;
  category: string;
  description: string;
  priority: string | null;
  status: string;
  apartment: {
    number: string;
    entrance: number | null;
    floor: number | null;
  };
  user: {
    firstName: string | null;
    lastName: string | null;
    phone?: string | null;
    email?: string | null;
  };
  createdAt: string;
  appUrl?: string;
}

export async function sendServiceRequestWebhook(payload: ServiceRequestWebhookPayload): Promise<void> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.log('N8N_WEBHOOK_URL not configured, skipping webhook notification');
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'service_request_created',
        data: payload,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      console.error('Webhook notification failed:', response.status, response.statusText);
    } else {
      console.log('Webhook notification sent successfully for request:', payload.requestId);
    }
  } catch (error) {
    console.error('Error sending webhook notification:', error);
    // Don't throw - webhook failure shouldn't break the main flow
  }
}
