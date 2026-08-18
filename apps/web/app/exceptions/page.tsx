'use client';

import Link from 'next/link';

export default function ExceptionsPage() {
  const exceptions = [
    { dispatch_id: 'DSP-002', customer: 'ABC Metals Ltd', po_number: 'PO-44312', error_type: 'Vehicle Number Mismatch', priority: 'High', status: 'CRITICAL_ERROR', description: 'Bill vehicle (MH12AB9999) does not match LR vehicle (MH12AB1234)' },
    { dispatch_id: 'DSP-007', customer: 'Delta Heavy Industries', po_number: 'PO-77889', error_type: 'Weight Tolerance Exceeded', priority: 'Medium', status: 'WARNING', description: 'Weighment variance (1.8%) exceeds maximum allowed threshold (1.0%)' },
    { dispatch_id: 'DSP-012', customer: 'Supertech Construction', po_number: 'PO-11223', error_type: 'Rate Variance Check', priority: 'Low', status: 'PASSED', description: 'Customer PO rate verified at ₹58.00/kg (locked)' },
  ];

  return (
    <div>
      {/* Page Title Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">EXCEPTIONS & AI</div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Discrepancies & Flagged Errors</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Cross-document validation errors flagged by Gemini 2.5 vision engine for operator resolution.
          </p>
        </div>

        <button className="btn-dark-pill">
          <span>+ Flag Exception</span>
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
          <button className="filter-pill active">All ({exceptions.length})</button>
          <button className="filter-pill">Critical Errors</button>
          <button className="filter-pill">Warnings</button>
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Showing 1 to {exceptions.length} of {exceptions.length}
        </div>
      </div>

      {/* Clean Table Container */}
      <div className="card-clean p-0 overflow-hidden">
        <table className="table-clean">
          <thead>
            <tr>
              <th>Dispatch ID</th>
              <th>Customer Name</th>
              <th>PO Number & Exception</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {exceptions.map((item) => (
              <tr key={item.dispatch_id}>
                <td className="font-mono text-xs font-bold text-blue-600">{item.dispatch_id}</td>
                <td className="font-bold text-slate-900">{item.customer}</td>
                <td className="text-slate-700 font-medium">{item.error_type} ({item.po_number})</td>
                <td className="text-slate-600 font-medium">{item.priority}</td>
                <td>
                  <span className={`status-badge ${
                    item.status === 'CRITICAL_ERROR' ? 'critical' :
                    item.status === 'WARNING' ? 'part-dispensed' : 'issued'
                  }`}>
                    • {item.status === 'CRITICAL_ERROR' ? 'Critical Error' : item.status === 'WARNING' ? 'Warning' : 'Passed'}
                  </span>
                </td>
                <td>
                  <Link href={`/dispatches/${item.dispatch_id}`} className="text-xs font-bold text-slate-700 hover:text-slate-900">
                    Inspect →
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
