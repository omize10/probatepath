/**
 * Email & SMS Messaging Types
 */

export interface TemplateDefinition {
  key: string;
  name: string;
  description: string;
  category: 'transactional' | 'reminder' | 'recovery' | 'auth';
  emailSubject: string;
  emailHtml: string;
  emailPlainText?: string;
  smsBody?: string;
  smsEnabled: boolean;
  availableVariables: string[];
  variableDescriptions: Record<string, string>;
}

export interface SendMessageOptions {
  templateKey: string;
  to: {
    email?: string;
    phone?: string;
  };
  variables: Record<string, string>;
  matterId?: string;
  meta?: Record<string, unknown>;
}

export interface SendResult {
  email?: {
    success: boolean;
    error?: string;
    id?: string;
  };
  sms?: {
    success: boolean;
    error?: string;
    sid?: string;
  };
}

export interface TemplatePreview {
  emailSubject: string;
  emailHtml: string;
  emailPlainText?: string;
  smsBody?: string;
}
