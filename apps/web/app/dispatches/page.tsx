'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DispatchesPage() {
  const [fixRate, setFixRate] = useState<string>('58.00');
  const [dispatches, setDispatches] = useState<any[]>([]);

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

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/dispatches')
      .then((res) => res.json())
      .then((data) => {
        if (data.dispatches && data.dispatches.length > 0) {
          const fetched = data.dispatches.map((d: any) => ({
            dispatch_id: d.dispatch_id,
            customer: d.customer_name || 'XYZ Industries',
            po_number: d.po_number || 'PO-98765',
            vehicle: d.vehicle_number || 'MH12 AB 1234',
            weight: `${(d.weight_kg || 12500).toLocaleString()} KG`,
            status: d.status,
          }));
          setDispatches(fetched);
        } else {
          setDispatches([
            { dispatch_id: 'DSP-001', customer: 'XYZ Industries', po_number: 'PO-98765', vehicle: 'MH12 AB 1234', weight: '12,500 KG', status: 'VALIDATED' },
            { dispatch_id: 'DSP-002', customer: 'ABC Metals', po_number: 'PO-44312', vehicle: 'MH12 AB 9999', weight: '15,000 KG', status: 'VALIDATION_REQUIRED' },
            { dispatch_id: 'DSP-003', customer: 'XYZ Industries', po_number: 'PO-98765', vehicle: 'MH12 AB 1234', weight: '12,500 KG', status: 'DRAFT_INVOICE_CREATED' },
            { dispatch_id: 'DSP-004', customer: 'Apex Metals', po_number: 'PO-11223', vehicle: 'MH14 XY 9999', weight: '10,000 KG', status: 'PENDING_APPROVAL' },
          ]);
        }
      })
      .catch(() => {
        setDispatches([
          { dispatch_id: 'DSP-001', customer: 'XYZ Industries', po_number: 'PO-98765', vehicle: 'MH12 AB 1234', weight: '12,500 KG', status: 'VALIDATED' },
          { dispatch_id: 'DSP-002', customer: 'ABC Metals', po_number: 'PO-44312', vehicle: 'MH12 AB 9999', weight: '15,000 KG', status: 'VALIDATION_REQUIRED' },
          { dispatch_id: 'DSP-003', customer: 'XYZ Industries', po_number: 'PO-98765', vehicle: 'MH12 AB 1234', weight: '12,500 KG', status: 'DRAFT_INVOICE_CREATED' },
          { dispatch_id: 'DSP-004', customer: 'Apex Metals', po_number: 'PO-11223', vehicle: 'MH14 XY 9999', weight: '10,000 KG', status: 'PENDING_APPROVAL' },
        ]);
      });
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
          <h1 className="page-title">Dispatches</h1>
          <p className="page-subtitle">
            Track end-to-end dispatch lifecycles from weighbridge intake to Zoho sales invoice creation (Rate: ₹{fixRate}/kg).
          </p>
        </div>
        <button className="btn-primary-dark">+ New Dispatch</button>
      </div>

      {/* Filter & Search Bar */}
      <div className="filter-bar-card">
        <div className="search-input-wrapper">
          <span>🔍</span>
          <input type="text" placeholder="Name or ID..." readOnly />
        </div>
        <div className="filter-pills-group">
          <button className="filter-pill active">All</button>
          <button className="filter-pill">Validated</button>
          <button className="filter-pill">Issued</button>
          <button className="filter-pill">Discrepancies</button>
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
              <th>WEIGHT</th>
              <th>SELLING RATE</th>
              <th>STATUS</th>
              <th style={{ textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {dispatches.map((item) => {
              const initials = getInitials(item.customer);
              let statusClass = 'status-pill-slate';
              let statusLabel = item.status;

              if (item.status === 'DRAFT_INVOICE_CREATED') {
                statusClass = 'status-pill-blue';
                statusLabel = '• Issued';
              } else if (item.status === 'VALIDATED') {
                statusClass = 'status-pill-emerald';
                statusLabel = '• Resulted';
              } else if (item.status === 'PENDING_APPROVAL') {
                statusClass = 'status-pill-amber';
                statusLabel = '• Pending';
              } else if (item.status === 'VALIDATION_REQUIRED') {
                statusClass = 'status-pill-rose';
                statusLabel = '• Critical View';
              }

              return (
                <tr key={item.dispatch_id}>
                  <td style={{ fontWeight: '700', color: '#0F172A' }}>
                    <Link href={`/dispatches/${item.dispatch_id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {item.dispatch_id}
                    </Link>
                  </td>
                  <td>
                    <div className="customer-avatar-row">
                      <div className="customer-avatar-circle">{initials}</div>
                      <span style={{ fontWeight: '600', color: '#0F172A' }}>{item.customer}</span>
                    </div>
                  </td>
                  <td style={{ color: '#475569', fontWeight: '500' }}>{item.po_number}</td>
                  <td style={{ color: '#475569' }}>{item.vehicle}</td>
                  <td style={{ color: '#475569' }}>{item.weight}</td>
                  <td style={{ fontWeight: '700', color: '#0F172A' }}>₹{fixRate}/kg</td>
                  <td>
                    <span className={`status-pill ${statusClass}`}>
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
