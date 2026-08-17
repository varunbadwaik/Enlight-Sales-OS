'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DispatchesPage() {
  const [dispatches, setDispatches] = useState<any[]>([
    { dispatch_id: 'DSP-001', customer: 'XYZ Industries', po_number: 'PO-98765', vehicle: 'MH12AB1234', weight: '12,500 KG', rate: '₹58.00/kg', status: 'VALIDATED', action: 'Review & Approve →' },
    { dispatch_id: 'DSP-002', customer: 'ABC Metals', po_number: 'PO-44312', vehicle: 'MH12AB9999', weight: '15,000 KG', rate: '₹62.00/kg', status: 'VALIDATION_REQUIRED', action: 'Review Discrepancy →' },
    { dispatch_id: 'DSP-003', customer: 'XYZ Industries', po_number: 'PO-98765', vehicle: 'MH12AB1234', weight: '12,500 KG', rate: '₹58.00/kg', status: 'DRAFT_INVOICE_CREATED', action: 'View Draft Invoice →' },
    { dispatch_id: 'DSP-004', customer: 'Apex Metals', po_number: 'PO-11223', vehicle: 'MH14XY9999', weight: '10,000 KG', rate: '₹55.00/kg', status: 'PENDING_APPROVAL', action: 'Review & Approve →' },
  ]);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/dispatches')
      .then((res) => res.json())
      .then((data) => {
        if (data.dispatches && data.dispatches.length > 0) {
          // Merge PostgreSQL dispatches with existing list
          const fetched = data.dispatches.map((d: any) => ({
            dispatch_id: d.dispatch_id,
            customer: d.customer_name || 'XYZ Industries',
            po_number: d.po_number || 'PO-98765',
            vehicle: d.vehicle_number || 'MH12AB1234',
            weight: `${(d.weight_kg || 12500).toLocaleString()} KG`,
            rate: `₹${(d.selling_rate || 58.0).toFixed(2)}/kg`,
            status: d.status,
            action: 'Review & Approve →'
          }));
          setDispatches((prev) => {
            const existingIds = new Set(prev.map(p => p.dispatch_id));
            const newItems = fetched.filter((f: any) => !existingIds.has(f.dispatch_id));
            return [...newItems, ...prev];
          });
        }
      })
      .catch((err) => console.log('API Dispatches Fetch Fallback:', err));
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.5px' }}>
            Dispatches Management
          </h1>
          <p style={{ color: '#64748B', marginTop: '4px', fontSize: '14px' }}>
            Track end-to-end dispatch lifecycles from intake to Zoho draft invoice creation.
          </p>
        </div>
      </div>

      <div className="card-container">
        <div className="card-header">
          <h2 className="card-title">All Dispatches ({dispatches.length})</h2>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>DISPATCH ID</th>
              <th>PO NUMBER</th>
              <th>CUSTOMER</th>
              <th>VEHICLE</th>
              <th>WEIGHT</th>
              <th>PO SELLING RATE</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {dispatches.map((item) => (
              <tr key={item.dispatch_id}>
                <td>
                  <Link href={`/dispatches/${item.dispatch_id}`} style={{ fontWeight: '700', color: '#2563EB', textDecoration: 'none' }}>
                    {item.dispatch_id}
                  </Link>
                </td>
                <td style={{ color: '#475569', fontWeight: '500' }}>{item.po_number}</td>
                <td style={{ color: '#0F172A', fontWeight: '600' }}>{item.customer}</td>
                <td style={{ fontFamily: 'monospace', fontWeight: '600', color: '#334155' }}>{item.vehicle}</td>
                <td style={{ color: '#475569' }}>{item.weight}</td>
                <td style={{ fontWeight: '700', color: '#059669', fontSize: '15px' }}>{item.rate}</td>
                <td>
                  {item.status === 'VALIDATED' && <span className="status-badge status-validated">✓ VALIDATED</span>}
                  {item.status === 'VALIDATION_REQUIRED' && <span className="status-badge status-review">⚠ VEHICLE MISMATCH</span>}
                  {item.status === 'DRAFT_INVOICE_CREATED' && <span className="status-badge status-draft">✓ DRAFT CREATED</span>}
                  {item.status === 'PENDING_APPROVAL' && <span className="status-badge status-review">⏳ PENDING APPROVAL</span>}
                </td>
                <td>
                  <Link href={`/dispatches/${item.dispatch_id}`} className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', padding: '6px 14px', fontSize: '13px' }}>
                    {item.action}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
