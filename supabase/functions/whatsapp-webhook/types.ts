
export interface WhatsAppMessage {
  id: string;
  type: string;
  image?: {
    id: string;
    caption?: string;
  };
  text?: {
    body: string;
  };
}

export interface WhatsAppContact {
  wa_id: string;
}

export interface WhatsAppWebhookPayload {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: WhatsAppMessage[];
        contacts?: WhatsAppContact[];
      };
    }>;
  }>;
}

export interface ImageUploadResult {
  path: string;
  type: string;
  caption?: string;
}
