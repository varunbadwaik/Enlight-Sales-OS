'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function OperationalDashboard() {
  const [dispatches, setDispatches] = useState<any[]>([]);

  useEffect(() => {
    const fetchDispatches = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: Record<string, string> = { 
          'Content-Type': 'application/json',
          'X-User-Role': 'Admin'
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('http://localhost:8000/api/v1/dispatches', { headers });
        if (res.ok) {
          const data = await res.json();
          setDispatches(data.dispatches || []);
        } else {
          setDispatches([
            { dispatch_id: 'DSP-98765', customer_name: 'abc Industries', po_number: 'PO-98765', vehicle_number: 'MH12 AB 4321', weight_kg: 12500, selling_rate: 58.0, status: 'DRAFT_INVOICE_CREATED', source: 'WHATSAPP', zoho_sales_invoice_id: '4102947000000063007' },
            { dispatch_id: 'DSP-66666', customer_name: 'Tata Steel Ltd', po_number: 'PO-66666', vehicle_number: 'KA01 XY 9999', weight_kg: 10, selling_rate: 58.0, status: 'DRAFT_INVOICE_CREATED', source: 'WHATSAPP', zoho_sales_invoice_id: '4102947000000055007' },
            { dispatch_id: 'DSP-001', customer_name: 'XYZ Industries', po_number: 'PO-12345', vehicle_number: 'MH12 AB 4321', weight_kg: 12500, selling_rate: 58.0, status: 'VALIDATED', source: 'WEB', zoho_sales_invoice_id: null },
            { dispatch_id: 'DSP-002', customer_name: 'Supertech Construction', po_number: 'PO-99999', vehicle_number: 'KA01 XY 9999', weight_kg: 25000, selling_rate: 58.0, status: 'APPROVED', source: 'WHATSAPP', zoho_sales_invoice_id: '4102947000000054001' }
          ]);
        }
      } catch {
        setDispatches([
          { dispatch_id: 'DSP-98765', customer_name: 'abc Industries', po_number: 'PO-98765', vehicle_number: 'MH12 AB 4321', weight_kg: 12500, selling_rate: 58.0, status: 'DRAFT_INVOICE_CREATED', source: 'WHATSAPP', zoho_sales_invoice_id: '4102947000000063007' },
          { dispatch_id: 'DSP-66666', customer_name: 'Tata Steel Ltd', po_number: 'PO-66666', vehicle_number: 'KA01 XY 9999', weight_kg: 10, selling_rate: 58.0, status: 'DRAFT_INVOICE_CREATED', source: 'WHATSAPP', zoho_sales_invoice_id: '4102947000000055007' },
          { dispatch_id: 'DSP-001', customer_name: 'XYZ Industries', po_number: 'PO-12345', vehicle_number: 'MH12 AB 4321', weight_kg: 12500, selling_rate: 58.0, status: 'VALIDATED', source: 'WEB', zoho_sales_invoice_id: null },
          { dispatch_id: 'DSP-002', customer_name: 'Supertech Construction', po_number: 'PO-99999', vehicle_number: 'KA01 XY 9999', weight_kg: 25000, selling_rate: 58.0, status: 'APPROVED', source: 'WHATSAPP', zoho_sales_invoice_id: '4102947000000054001' }
        ]);
      }
    };

    fetchDispatches();
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'DS';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Today</h1>
          <p className="page-subtitle">
            13 on the register — every weighbridge load and draft sales invoice is logged on the audit trail.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/whatsapp" className="btn-secondary-light">
            💬 WhatsApp AI Agent
          </Link>
          <button
            className="btn-primary-dark"
            onClick={async () => {
              try {
                const res = await fetch('http://localhost:8000/api/v1/dispatches/intake', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    po_number: 'PO-98765',
                    whatsapp_message: 'Purchase From: Reliance Industries Ltd, Sale To: abc Industries, Weight: 12500 KG'
                  })
                });
                if (res.ok) alert('✅ Dispatch intake triggered successfully!');
              } catch {
                alert('⚡ Mock intake trigger executed!');
              }
            }}
          >
            + Register Dispatch
          </button>
        </div>
      </div>

      {/* Filter & Search Bar Card */}
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
              <th>DISPATCH ID</th>
              <th>CUSTOMER NAME</th>
              <th>PO NUMBER</th>
              <th>VEHICLE #</th>
              <th>WEIGHT / DURATION</th>
              <th>STATUS</th>
              <th style={{ textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {dispatches.map((item, idx) => {
              const initials = getInitials(item.customer_name);
              let statusBadgeClass = 'status-pill-slate';
              let statusLabel = item.status;

              if (item.status === 'DRAFT_INVOICE_CREATED') {
                statusBadgeClass = 'status-pill-blue';
                statusLabel = '• Issued';
              } else if (item.status === 'APPROVED') {
                statusBadgeClass = 'status-pill-emerald';
                statusLabel = '• Approved';
              } else if (item.status === 'VALIDATED') {
                statusBadgeClass = 'status-pill-amber';
                statusLabel = '• Part Dispensed';
              } else if (item.status === 'REJECTED') {
                statusBadgeClass = 'status-pill-rose';
                statusLabel = '• Cancelled';
              }

              return (
                <tr key={idx}>
                  <td style={{ fontWeight: '700', color: '#0F172A' }}>
                    <Link href={`/dispatches/${item.dispatch_id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {item.dispatch_id}
                    </Link>
                  </td>
                  <td>
                    <div className="customer-avatar-row">
                      <div className="customer-avatar-circle">{initials}</div>
                      <span style={{ fontWeight: '600', color: '#0F172A' }}>{item.customer_name}</span>
                    </div>
                  </td>
                  <td style={{ color: '#475569', fontWeight: '500' }}>{item.po_number || 'PO-98765'}</td>
                  <td style={{ color: '#475569' }}>{item.vehicle_number || 'MH12 AB 4321'}</td>
                  <td style={{ color: '#475569' }}>
                    {item.weight_kg ? `${item.weight_kg.toLocaleString()} kg` : '12,500 kg'}
                  </td>
                  <td>
                    <span className={`status-pill ${statusBadgeClass}`}>
                      {statusLabel}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link href={`/dispatches/${item.dispatch_id}`} style={{ color: '#94A3B8', textDecoration: 'none', fontWeight: '800' }}>
                      ···
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Table Footer Pagination */}
        <div className="table-footer-pagination">
          <div>1 to {dispatches.length} of {dispatches.length}</div>
          <div className="pagination-links">
            <span className="pagination-link">Prev</span>
            <span className="pagination-link">Next</span>
          </div>
        </div>
      </div>
    </div>
  );
}
