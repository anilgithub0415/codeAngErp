export interface Interaction {
  interactionId: number;
  tenantId: number;
  customerId: number;
  userId: number;
  channel: 'Call' | 'WhatsApp' | 'Email' | 'In-Person Visit';
  direction: 'Inbound' | 'Outbound';
  purpose?: string;
  notes?: string;
  isSampleFeedback: boolean;
  attachmentUrl?: string;
  nextFollowUpDate?: string | null;
  nextFollowUpObjective?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    userId: number;
    username: string;
  };
}

export interface CreateInteractionDto {
  customerId: number;
  userId: number;
  channel: string;
  direction: string;
  purpose?: string;
  notes?: string;
  isSampleFeedback?: boolean;
  attachmentUrl?: string;
  nextFollowUpDate?: string | null;
  nextFollowUpObjective?: string;
}

export interface UpdateInteractionDto {
  purpose?: string;
  notes?: string;
  isSampleFeedback?: boolean;
  attachmentUrl?: string;
  nextFollowUpDate?: string | null;
  nextFollowUpObjective?: string;
}
