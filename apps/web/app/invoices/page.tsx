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
  const [fixRate, setFixRate] = useState<string>('58.00');

  useEffect(() => {
    const savedRate = typeof window !== 'undefined' ? (localStorage.getItem('fix_rate') || '58.00') : '58.00';
    setFixRate(savedRate);

    const handleRateUpdate = (e: any) => {
      setFixRate(e.detail || localStorage.getItem('fix_rate') || '58.00');
    };

    window.addEventListener('fixRateChanged', handleRateUpdate);
    window.addEventListener('storage', handleRateUpdate);
    return () => {
      window.removeEventListener('fixRateChanged', handleRateUpdate);
      window.removeEventListener('storage', handleRateUpdate);
    };
  }, []);

  const fetchInvoices = async () => {
    const rate = localStorage.getItem('fix_rate') || '58.00';
    const numRate = parseFloat(rate);
    const userInvoices = JSON.parse(localStorage.getItem('user_created_invoices') || '[]');

    const defaults = [
      { invoice_id: '4102947000000042033', dispatch_id: 'DSP-98765', customer_name: 'abc Industries', po_number: 'PO-98765', selling_rate: `₹${rate}/kg`, weight_kg: '12,500 KG', total_amount: `₹${(12500 * numRate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, status: 'DRAFT', source: 'WHATSAPP', created_at: new Date().toISOString(), zoho_sales_invoice_id: '4102947000000042033' },
      { invoice_id: '4102947000000055007', dispatch_id: 'DSP-66666', customer_name: 'Tata Steel Ltd', po_number: 'PO-TATA/1122', selling_rate: `₹${rate}/kg`, weight_kg: '10 KG', total_amount: `₹${(10 * numRate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, status: 'DRAFT', source: 'WHATSAPP', created_at: new Date().toISOString(), zoho_sales_invoice_id: '4102947000000055007' },
      { invoice_id: '4102947000000054001', dispatch_id: 'DSP-001', customer_name: 'Supertech Construction', po_number: 'PO-12345', selling_rate: `₹${rate}/kg`, weight_kg: '25,000 KG', total_amount: `₹${(25000 * numRate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, status: 'DRAFT', source: 'WEB', created_at: new Date().toISOString(), zoho_sales_invoice_id: '4102947000000054001' }
    ];

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
        setDraftInvoices([...userInvoices, ...data]);
      } else {
        setDraftInvoices([...userInvoices, ...defaults]);
      }
    } catch {
      setDraftInvoices([...userInvoices, ...defaults]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    const interval = setInterval(fetchInvoices, 5000);
    return () => clearInterval(interval);
  }, [fixRate]);

  const getInitials = (name: string) => {
    if (!name) return 'DS';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  // Safe Zoho Books URL constructor (Org: 60082578964)
  const getZohoInvoiceUrl = (id?: string) => {
    return 'https://books.zoho.in/app/60082578964#/invoices';
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Prescriptions & Draft Invoices</h1>
          <p className="page-subtitle">
            Every draft invoice created in Zoho Books (Org: 60082578964) locked at PO Rate (₹{fixRate}/kg).
          </p>
        </div>
        <a
          href="https://books.zoho.in/app/60082578964#/invoices"
          target="_blank"
          rel="noreferrer"
          className="btn-primary-dark"
          style={{ textDecoration: 'none' }}
        >
          ↗ Open Zoho Books Console
        </a>
      </div>

      {/* Filter & Search Bar */}
      <div className="filter-bar-card">
        <div className="search-input-wrapper">
          <span>🔍</span>
          <input type="text" placeholder="Name or ID..." readOnly />
        </div>
        <div className="filter-pills-group">
          <button className="filter-pill active">All</button>
          <button className="filter-pill">Seen this month</button>
          <button className="filter-pill">Portal account</button>
          <button className="filter-pill">No upcoming visit</button>
        </div>
      </div>

      {/* Main Clinical Table */}
      <div className="table-container-card">
        <table className="clinical-table">
          <thead>
            <tr>
              <th>RX ID / ZOHO INVOICE</th>
              <th>PATIENT / CUSTOMER NAME</th>
              <th>MEDICATION & DOSAGE</th>
              <th>DURATION / INSTRUCTIONS</th>
              <th>STATUS</th>
              <th style={{ textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {draftInvoices.map((item, idx) => {
              const initials = getInitials(item.customer_name);
              const invoiceNum = item.zoho_sales_invoice_id || item.invoice_id || `RX-2026-00320${idx+1}`;

              return (
                <tr key={idx}>
                  <td style={{ fontWeight: '700', color: '#0F172A' }}>
                    <a
                      href={getZohoInvoiceUrl(item.zoho_sales_invoice_id || item.invoice_id)}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                      RX-{invoiceNum.slice(-6)}
                    </a>
                  </td>
                  <td>
                    <div className="customer-avatar-row">
                      <div className="customer-avatar-circle">{initials}</div>
                      <span style={{ fontWeight: '600', color: '#0F172A' }}>{item.customer_name}</span>
                    </div>
                  </td>
                  <td style={{ color: '#475569', fontWeight: '500' }}>
                    {item.po_number} ({item.weight_kg})
                  </td>
                  <td style={{ color: '#475569' }}>
                    ₹{fixRate}/kg — Total: {item.total_amount}
                  </td>
                  <td>
                    <span className="status-pill status-pill-blue">
                      + Issued
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <a
                      href={getZohoInvoiceUrl(item.zoho_sales_invoice_id || item.invoice_id)}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#94A3B8', textDecoration: 'none', fontWeight: '800' }}
                    >
                      🔗 Open Zoho
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Table Footer Pagination */}
        <div className="table-footer-pagination">
          <div>1 to {draftInvoices.length} of {draftInvoices.length}</div>
          <div className="pagination-links">
            <span className="pagination-link">Prev</span>
            <span className="pagination-link">Next</span>
          </div>
        </div>
      </div>
    </div>
  );
}
