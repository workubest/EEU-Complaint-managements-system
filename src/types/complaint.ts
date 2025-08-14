export type ComplaintStatus = 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed' | 'cancelled';
export type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical';
export type ComplaintCategory = 
  | 'power_outage'
  | 'billing_issue'
  | 'meter_problem'
  | 'connection_request'
  | 'voltage_fluctuation'
  | 'equipment_damage'
  | 'service_quality'
  | 'safety_concern'
  | 'other';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  region?: string;
  serviceCenter?: string;
  meterNumber?: string;
  accountNumber?: string;
  contractNumber?: string;
  businessPartner?: string;
  customerType?: 'residential' | 'commercial' | 'industrial';
  registrationDate?: Date;
}

export interface Complaint {
  id: string;
  customerId?: string;
  customer?: Customer;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  region: string;
  serviceCenter?: string;
  location?: string;
  assignedTo?: string;
  assignedBy?: string;
  createdBy?: string;
  accountNumber?: string;
  meterNumber?: string;
  createdAt: string;
  updatedAt: string;
  estimatedResolution?: string;
  resolvedAt?: string;
  notes?: string[];
  attachments?: string[];
  tags?: string[];
  customerRating?: number;
  feedback?: string;
}

export const PRIORITY_CONFIG = {
  low: { labelKey: 'priority.low', color: 'text-muted-foreground', bgColor: 'bg-muted' },
  medium: { labelKey: 'priority.medium', color: 'text-primary', bgColor: 'bg-primary/10' },
  high: { labelKey: 'priority.high', color: 'text-warning', bgColor: 'bg-warning/10' },
  critical: { labelKey: 'priority.critical', color: 'text-destructive', bgColor: 'bg-destructive/10' }
} as const;

export const STATUS_CONFIG = {
  open: { labelKey: 'status.open', color: 'text-primary', bgColor: 'bg-primary/10' },
  in_progress: { labelKey: 'status.in_progress', color: 'text-warning', bgColor: 'bg-warning/10' },
  pending: { labelKey: 'status.pending', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  resolved: { labelKey: 'status.resolved', color: 'text-success', bgColor: 'bg-success/10' },
  closed: { labelKey: 'status.closed', color: 'text-muted-foreground', bgColor: 'bg-muted' },
  cancelled: { labelKey: 'status.cancelled', color: 'text-destructive', bgColor: 'bg-destructive/10' }
} as const;