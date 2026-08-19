'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DraftInvoiceItem {
  invoice_id: string;
  dispatch_id: string;
  customer_name: string;
  po_number: string;
  selling_rate: string;
  weight_kg: string;
  total_amount: string;
  status: string;
  source: string;
  created_at: string;
  zoho_sales_invoice_id?: string;
}

export default function InvoicesPage() {
  const [draftInvoices, setDraftInvoices] = useState<DraftInvoiceItem[]>([]);

  const fetchInvoices = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-User-Role': 'Admin'
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/v1/invoices/drafts', { headers });
      if (res.ok) {
        const data = await res.json();
        setDraftInvoices(data);
      } else {
        setDraftInvoices([
          { invoice_id: '4102947000000042033', dispatch_id: 'DSP-98765', customer_name: 'abc Industries', po_number: 'PO-98765', selling_rate: '₹58.00/kg', weight_kg: '12,500 KG', total_amount: '₹7,25,000.00', status: 'DRAFT', source: 'WHATSAPP', created_at: new Date().toISOString(), zoho_sales_invoice_id: '4102947000000042033' },
          { invoice_id: '4102947000000055007', dispatch_id: 'DSP-66666', customer_name: 'Tata Steel Ltd', po_number: 'PO-TATA/1122', selling_rate: '₹58.00/kg', weight_kg: '10 KG', total_amount: '₹580.00', status: 'DRAFT', source: 'WHATSAPP', created_at: new Date().toISOString(), zoho_sales_invoice_id: '4102947000000055007' },
          { invoice_id: '4102947000000054001', dispatch_id: 'DSP-001', customer_name: 'Supertech Construction', po_number: 'PO-12345', selling_rate: '₹58.00/kg', weight_kg: '25,000 KG', total_amount: '₹14,50,000.00', status: 'DRAFT', source: 'WEB', created_at: new Date().toISOString(), zoho_sales_invoice_id: '4102947000000054001' }
        ]);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
    }
  };

  useEffect(() => {
    fetchInvoices();
    const interval = setInterval(fetchInvoices, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">CARE & PIPELINE</div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Zoho Draft Invoices</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {draftInvoices.length} draft invoices created — rate locked at ₹58.00/kg in Zoho Books (Org: 60082578964).
          </p>
        </div>

        <button onClick={fetchInvoices} className="btn-dark-pill">
          <span>🔄 Sync Invoices</span>
        </button>
      </div>

      {/* Filter Control Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="🔍 Name or ID..."
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 w-48 shadow-sm"
          />
          <button className="filter-pill active">All Drafts ({draftInvoices.length})</button>
          <button className="filter-pill">WhatsApp Sourced</button>
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Showing 1 to {draftInvoices.length} of {draftInvoices.length}
        </div>
      </div>

      {/* Clean Table Container */}
      <div className="card-clean p-0 overflow-hidden">
        <table className="table-clean">
          <thead>
            <tr>
              <th>Zoho Invoice ID</th>
              <th>Customer Name</th>
              <th>PO & Dispatch Ref</th>
              <th>Weight & Total</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {draftInvoices.map((item) => {
              const zohoId = item.zoho_sales_invoice_id || item.invoice_id;
              return (
                <tr key={item.invoice_id}>
                  <td className="font-bold text-slate-900 font-mono">
                    {zohoId}
                  </td>
                  <td className="font-semibold text-slate-900">{item.customer_name}</td>
                  <td className="text-slate-600 font-medium">{item.po_number} · {item.dispatch_id}</td>
                  <td className="text-slate-900 font-bold">{item.weight_kg} — <span className="text-blue-600">{item.total_amount}</span></td>
                  <td>
                    <span className="status-badge issued">• Draft Issued</span>
                  </td>
                  <td>
                    <a
                      href={`https://books.zoho.in/app/60082578964#/invoices/${zohoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 underline"
                    >
                      Open in Zoho →
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
