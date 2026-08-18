'use client';

import Link from 'next/link';

export default function ApprovalsPage() {
  const pendingApprovals = [
    { dispatch_id: 'DSP-004', customer: 'Apex Metals', po_number: 'PO-11223', vehicle: 'MH14XY9999', weight: '10,000 KG', rate: '₹55.00/kg', status: 'PENDING_APPROVAL', duration: '30-day supply · 28 ago' },
    { dispatch_id: 'DSP-001', customer: 'XYZ Industries', po_number: 'PO-98765', vehicle: 'MH12AB1234', weight: '12,500 KG', rate: '₹58.00/kg', status: 'PENDING_APPROVAL', duration: 'Repeat · Next refill in 10 days' },
  ];

  return (
    <div>
      {/* Page Title Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">CARE</div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Approvals Queue</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {pendingApprovals.length} dispatches on the registrar — every lead and write is on the audit log.
          </p>
        </div>

        <button className="btn-dark-pill">
          <span>+ Process Batch</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="🔍 Name or ID..."
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 w-48 shadow-sm"
          />
          <button className="filter-pill active">Pending ({pendingApprovals.length})</button>
          <button className="filter-pill">Approved (12)</button>
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Showing 1 to {pendingApprovals.length} of {pendingApprovals.length}
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
              <th>Weight & Locked Rate</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingApprovals.map((item) => (
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
                  <span className="status-badge processing">• Pending</span>
                </td>
                <td>
                  <Link
                    href={`/dispatches/${item.dispatch_id}`}
                    className="btn-dark-pill text-[11px] py-1 px-3"
                  >
                    Review & Approve →
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
