'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

export default function DispatchesPage() {
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  const fetchDispatches = useCallback(async () => {
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
        if (data.dispatches && data.dispatches.length > 0) {
          setDispatches(data.dispatches);
        }
      }
    } catch (err) {
      console.log('Error fetching dispatches:', err);
    }
  }, []);

  useEffect(() => {
    fetchDispatches();
    const interval = setInterval(fetchDispatches, 3000);
    return () => clearInterval(interval);
  }, [fetchDispatches]);

  const handleRegisterDispatch = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/dispatches/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          po_number: 'PO-98765',
          whatsapp_message: 'Purchase From: Reliance Industries Ltd, Sale To: abc Industries, Weight: 12500 KG'
        })
      });
      if (res.ok) {
        await fetchDispatches();
      }
    } catch (err) {
      console.error('Error registering dispatch:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDispatches = dispatches.filter((item) => {
    if (filter === 'Issued') return item.status === 'DRAFT_INVOICE_CREATED' || item.status === 'APPROVED';
    if (filter === 'Pending') return item.status !== 'DRAFT_INVOICE_CREATED' && item.status !== 'APPROVED';
    return true;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">DISPATCHES & PIPELINE</div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dispatches Queue</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {dispatches.length} dispatches registered — every record is tracked on the audit log (live 3s auto-sync).
          </p>
        </div>

        <button
          className="btn-dark-pill"
          onClick={handleRegisterDispatch}
          disabled={loading}
        >
          <span>{loading ? 'Creating...' : '+ Register dispatch'}</span>
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
            All ({dispatches.length})
          </button>
          <button
            onClick={() => setFilter('Issued')}
            className={`filter-pill ${filter === 'Issued' ? 'active' : ''}`}
          >
            Issued / Invoiced
          </button>
          <button
            onClick={() => setFilter('Pending')}
            className={`filter-pill ${filter === 'Pending' ? 'active' : ''}`}
          >
            Pending Approval
          </button>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Showing 1 to {filteredDispatches.length} of {filteredDispatches.length}
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
            {filteredDispatches.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-400 text-xs font-semibold">
                  No dispatches found. Send a message on WhatsApp or click "+ Register dispatch".
                </td>
              </tr>
            ) : (
              filteredDispatches.map((item, idx) => (
                <tr key={item.dispatch_id || idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="font-bold text-slate-900">
                    <Link href={`/dispatches/${item.dispatch_id}`} className="hover:underline text-slate-900">
                      {item.dispatch_id}
                    </Link>
                  </td>
                  <td className="font-semibold text-slate-800">
                    {item.customer_name || 'XYZ Industries'}
                  </td>
                  <td>
                    <div className="font-medium text-slate-700">{item.po_number || 'PO-98765'}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{item.vehicle_number || 'MH12 AB 4321'}</div>
                  </td>
                  <td>
                    <div className="font-semibold text-slate-900">{typeof item.weight_kg === 'number' ? item.weight_kg.toLocaleString() : item.weight_kg} KG</div>
                    <div className="text-[11px] text-slate-500 font-semibold mt-0.5">₹{(item.selling_rate || 58.0).toFixed(2)}/kg</div>
                  </td>
                  <td>
                    {item.status === 'DRAFT_INVOICE_CREATED' || item.status === 'APPROVED' ? (
                      <span className="status-badge issued">
                        <span className="status-dot"></span>
                        Invoice Drafted
                      </span>
                    ) : item.status === 'VALIDATED' ? (
                      <span className="status-badge critical">
                        <span className="status-dot"></span>
                        Validated
                      </span>
                    ) : (
                      <span className="status-badge warning">
                        <span className="status-dot"></span>
                        {item.status || 'Pending'}
                      </span>
                    )}
                  </td>
                  <td>
                    {item.zoho_sales_invoice_id ? (
                      <a
                        href={`https://books.zoho.in/app/60082578964#/invoices/${item.zoho_sales_invoice_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1"
                      >
                        Open Zoho →
                      </a>
                    ) : (
                      <Link
                        href={`/dispatches/${item.dispatch_id}`}
                        className="text-xs font-bold text-slate-900 hover:underline"
                      >
                        Inspect →
                      </Link>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
