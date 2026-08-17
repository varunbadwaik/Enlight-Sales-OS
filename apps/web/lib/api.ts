import { DispatchRecord, ValidationReport, AuditLogEntry } from './types';

const API_BASE = 'http://localhost:8000/api/v1';

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    'X-User-Role': 'Admin',
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'API Error' }));
    throw new Error(error.detail || `HTTP Error ${res.status}`);
  }

  return res.json();
}

export const api = {
  createDispatchIntake: (payload: { po_number?: string; whatsapp_message?: string; documents?: string[] }) =>
    fetchAPI<{ dispatch_id: string; status: string }>('/dispatches/intake', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  listDispatches: () =>
    fetchAPI<{ dispatches: DispatchRecord[]; total: number }>('/dispatches'),

  getDispatch: (id: string) =>
    fetchAPI<DispatchRecord>(`/dispatches/${id}`),

  processDocuments: (id: string) =>
    fetchAPI<{ dispatch_id: string; status: string }>(`/dispatches/${id}/process-documents`, {
      method: 'POST',
    }),

  validateDispatch: (id: string) =>
    fetchAPI<ValidationReport>(`/dispatches/${id}/validate`, {
      method: 'POST',
    }),

  approveDispatch: (id: string, decision: 'APPROVED' | 'REJECTED', comment?: string) =>
    fetchAPI<{ dispatch_id: string; status: string }>(`/dispatches/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ decision, comment }),
    }),

  createDraftInvoice: (id: string) =>
    fetchAPI<{ invoice_id: string; invoice_number: string; status: string; selling_rate_applied: number; quantity: number }>(
      `/dispatches/${id}/create-draft-invoice`,
      { method: 'POST' }
    ),

  getAuditLogs: (id: string) =>
    fetchAPI<AuditLogEntry[]>(`/dispatches/${id}/audit-logs`),
};
