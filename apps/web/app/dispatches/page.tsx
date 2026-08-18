'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DispatchesPage() {
  const [dispatches, setDispatches] = useState<any[]>([
    { dispatch_id: 'DSP-001', customer: 'XYZ Industries', po_number: 'PO-98765', vehicle: 'MH12AB1234', weight: '12,500 KG', rate: '₹58.00/kg', status: 'VALIDATED', action: 'Inspect' },
    { dispatch_id: 'DSP-002', customer: 'ABC Metals', po_number: 'PO-44312', vehicle: 'MH12AB9999', weight: '15,000 KG', rate: '₹62.00/kg', status: 'VALIDATION_REQUIRED', action: 'Review Discrepancy' },
    { dispatch_id: 'DSP-003', customer: 'XYZ Industries', po_number: 'PO-98765', vehicle: 'MH12AB1234', weight: '12,500 KG', rate: '₹58.00/kg', status: 'DRAFT_INVOICE_CREATED', action: 'View Draft' },
    { dispatch_id: 'DSP-004', customer: 'Apex Metals', po_number: 'PO-11223', vehicle: 'MH14XY9999', weight: '10,000 KG', rate: '₹55.00/kg', status: 'PENDING_APPROVAL', action: 'Approve' },
  ]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/dispatches')
      .then((res) => res.json())
      .then((data) => {
        if (data.dispatches && data.dispatches.length > 0) {
          const fetched = data.dispatches.map((d: any) => ({
            dispatch_id: d.dispatch_id,
            customer: d.customer_name || 'XYZ Industries',
            po_number: d.po_number || 'PO-98765',
            vehicle: d.vehicle_number || 'MH12AB1234',
            weight: `${(d.weight_kg || 12500).toLocaleString()} KG`,
            rate: `₹${(d.selling_rate || 58.0).toFixed(2)}/kg`,
            status: d.status,
            action: 'Inspect'
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
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">CARE & PIPELINE</div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dispatches Queue</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            13 dispatches on register — every lead & weight ticket is on the audit log.
          </p>
        </div>

        <button className="btn-dark-pill">
          <span>+ Register patient</span>
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
          <button
            onClick={() => setFilter('All')}
            className={`filter-pill ${filter === 'All' ? 'active' : ''}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('Issued')}
            className={`filter-pill ${filter === 'Issued' ? 'active' : ''}`}
          >
            Issued
          </button>
          <button
            onClick={() => setFilter('Pending')}
            className={`filter-pill ${filter === 'Pending' ? 'active' : ''}`}
          >
            Pending Approval
          </button>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Showing 1 to {dispatches.length} of {dispatches.length}
        </div>
      </div>

      {/* Clean Table Container */}
      <div className="card-clean p-0 overflow-hidden">
        <table className="table-clean">
          <thead>
            <tr>
              <th>Dispatch ID</th>
              <th>Customer Name</th>
              <th>PO Number & Vehicle</th>
              <th>Weight & Selling Rate</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {dispatches.map((item) => (
              <tr key={item.dispatch_id}>
                <td className="font-bold text-slate-900">
                  <Link href={`/dispatches/${item.dispatch_id}`} className="hover:underline">
                    {item.dispatch_id}
                  </Link>
                </td>
                <td className="font-semibold text-slate-900">{item.customer}</td>
                <td className="text-slate-600 font-medium">{item.po_number} · {item.vehicle}</td>
                <td className="text-slate-900 font-bold">{item.weight} @ <span className="text-emerald-600">{item.rate}</span></td>
                <td>
                  <span className={`status-badge ${
                    item.status === 'DRAFT_INVOICE_CREATED' || item.status === 'VALIDATED' ? 'issued' :
                    item.status === 'VALIDATION_REQUIRED' ? 'critical' : 'processing'
                  }`}>
                    • {item.status === 'DRAFT_INVOICE_CREATED' ? 'Issued' : item.status === 'VALIDATED' ? 'Passed' : item.status === 'VALIDATION_REQUIRED' ? 'Critical Value' : 'Pending'}
                  </span>
                </td>
                <td>
                  <Link href={`/dispatches/${item.dispatch_id}`} className="text-xs font-bold text-slate-900 hover:text-blue-600">
                    {item.action} →
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
