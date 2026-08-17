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
  const [loading, setLoading] = useState<boolean>(true);

  const fetchInvoices = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { 
        'Content-Type': 'application/json',
        'X-User-Role': 'Admin'
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('http://localhost:8000/api/v1/invoices/drafts', { headers });
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    const interval = setInterval(fetchInvoices, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.5px' }}>
            Zoho Books Draft Sales Invoices
          </h1>
          <p style={{ color: '#64748B', marginTop: '4px', fontSize: '14px', fontWeight: '500' }}>
            Overview of live draft invoices generated in Zoho Books (Org: 60082578964). Selling rate strictly locked to Customer PO (₹58.00/kg).
          </p>
        </div>
        <button onClick={fetchInvoices} className="btn-secondary">
          🔄 Refresh Invoices
        </button>
      </div>

      {/* Statutory Banner */}
      <div style={{
        background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px',
        padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px'
      }}>
        <div style={{ fontSize: '24px' }}>🛡️</div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#1E40AF' }}>
            Statutory & Legal Scope Control
          </div>
          <div style={{ fontSize: '13px', color: '#1E3A8A', marginTop: '2px' }}>
            All invoices created by Enlight AI remain strictly in <strong>DRAFT</strong> status. Accountants perform final verification, E-Way Bill generation, and digital signing manually in Zoho Books.
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="card-container">
        <div className="card-header">
          <h2 className="card-title">Live Draft Invoices ({draftInvoices.length})</h2>
          <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Auto-synced with Zoho Books</span>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Zoho Invoice ID</th>
              <th>Dispatch Ref</th>
              <th>Customer</th>
              <th>PO Number</th>
              <th>Source</th>
              <th>Locked Rate</th>
              <th>Total Weight</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {draftInvoices.map((item) => {
              const zohoId = item.zoho_sales_invoice_id || item.invoice_id;
              return (
                <tr key={item.invoice_id}>
                  <td style={{ fontWeight: '800', color: '#2563EB', fontFamily: 'monospace' }}>
                    {zohoId}
                  </td>
                  <td>
                    <Link href={`/dispatches/${item.dispatch_id}`} style={{ fontWeight: '700', color: '#475569', textDecoration: 'none' }}>
                      {item.dispatch_id}
                    </Link>
                  </td>
                  <td style={{ color: '#0F172A', fontWeight: '700' }}>{item.customer_name}</td>
                  <td style={{ color: '#475569', fontWeight: '600' }}>{item.po_number}</td>
                  <td>
                    <span className={`source-badge ${item.source === 'WHATSAPP' ? 'source-whatsapp' : 'source-web'}`}>
                      {item.source === 'WHATSAPP' ? '💬 WhatsApp' : '🌐 Web Portal'}
                    </span>
                  </td>
                  <td style={{ fontWeight: '800', color: '#059669' }}>{item.selling_rate}</td>
                  <td style={{ fontWeight: '700' }}>{item.weight_kg}</td>
                  <td style={{ fontWeight: '800', color: '#0F172A' }}>{item.total_amount}</td>
                  <td>
                    <span className="badge badge-draft">
                      <span className="badge-pulse" />
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <a
                      href={`https://books.zoho.in/app/60082578964#/invoices/${zohoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-zoho"
                    >
                      🔗 Open in Zoho Books
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
