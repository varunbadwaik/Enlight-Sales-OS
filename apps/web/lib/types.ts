export type DispatchStatus = 
  | 'DOCUMENTS_UPLOADED'
  | 'EXTRACTED'
  | 'VALIDATED'
  | 'VALIDATION_REQUIRED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'DRAFT_INVOICE_CREATED'
  | 'FAILED';

export interface ValidationRuleResult {
  rule_name: string;
  status: 'PASSED' | 'FAILED' | 'WARNING';
  message: string;
}

export interface ValidationReport {
  is_valid: boolean;
  status: DispatchStatus;
  results: ValidationRuleResult[];
  selling_rate?: number;
  purchase_rate?: number;
}

export interface ExtractedData {
  customer_po?: {
    po_number: string;
    selling_rate: number;
    customer_name?: string;
  };
  purchase_bill?: {
    vendor: string;
    vehicle_number: string;
    purchase_rate: number;
  };
  lr?: {
    vehicle_number: string;
    lr_number?: string;
  };
  weighment_slip?: {
    net_weight_kg: number;
  };
}

export interface DispatchRecord {
  dispatch_id: string;
  po_number: string;
  dispatch_date: string;
  status: DispatchStatus;
  documents: string[];
  whatsapp_message?: string;
  extracted_data?: ExtractedData;
  validation_report?: ValidationReport;
  zoho_sales_invoice_id?: string;
  zoho_project_id?: string;
  zoho_purchase_bill_id?: string;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  dispatch_id: string;
  user_id: string;
  action: string;
  old_value?: any;
  new_value?: any;
  timestamp: string;
}
