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
  const [loading, setLoading] = useState(false);

  const fetchDispatches = () => {
    setLoading(true);
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
      .catch((err) => console.log('API Dispatches Fetch Fallback:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDispatches();
    const interval = setInterval(fetchDispatches, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">DISPATCHES & PIPELINE</div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dispatches Queue</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
              Live Sync
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {dispatches.length} dispatches registered — every record is tracked on the audit log.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDispatches}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span> Refresh Now
          </button>

          <Link href="/" className="btn-dark-pill">
            <span>+ Register Dispatch</span>
          </Link>
        </div>
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
            All ({dispatches.length})
          </button>
          <button
            onClick={() => setFilter('Issued')}
            className={`filter-pill ${filter === 'Issued' ? 'active' : ''}`}
          >
            Draft Issued
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
            {dispatches.map((item, idx) => (
              <tr key={item.dispatch_id || idx}>
                <td>
                  <span className="font-bold text-slate-900">{item.dispatch_id}</span>
                </td>
                <td>
                  <div className="font-semibold text-slate-900">{item.customer}</div>
                  <div className="text-[11px] text-slate-400 font-normal">Registered</div>
                </td>
                <td>
                  <div className="text-xs font-semibold text-slate-900">{item.po_number}</div>
                  <div className="text-[11px] text-slate-400 font-normal">Veh: {item.vehicle}</div>
                </td>
                <td>
                  <div className="text-xs font-bold text-slate-900">{item.weight}</div>
                  <div className="text-[11px] text-slate-400 font-normal">Rate: {item.rate}</div>
                </td>
                <td>
                  <span className={`status-badge ${
                    item.status === 'DRAFT_INVOICE_CREATED' || item.status === 'VALIDATED' 
                      ? 'issued' 
                      : item.status === 'VALIDATION_REQUIRED' 
                        ? 'critical' 
                        : 'warning'
                  }`}>
                    • {item.status}
                  </span>
                </td>
                <td>
                  <Link href={`/dispatches/${item.dispatch_id}`} className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1">
                    {item.action} <span>→</span>
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
