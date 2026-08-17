'use client';

import Link from 'next/link';

export default function ApprovalsPage() {
  const pendingApprovals = [
    { dispatch_id: 'DSP-004', customer: 'Apex Metals', po_number: 'PO-11223', vehicle: 'MH14XY9999', weight: '10,000 KG', rate: '₹55.00/kg', status: 'PENDING_APPROVAL' },
    { dispatch_id: 'DSP-001', customer: 'XYZ Industries', po_number: 'PO-98765', vehicle: 'MH12AB1234', weight: '12,500 KG', rate: '₹58.00/kg', status: 'PENDING_APPROVAL' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.5px' }}>
          Admin Approvals Queue
        </h1>
        <p style={{ color: '#64748B', marginTop: '4px', fontSize: '14px' }}>
          Dispatches awaiting explicit Human Admin Approval before Zoho Draft Invoice generation.
        </p>
      </div>

      <div className="card-container">
        <div className="card-header">
          <h2 className="card-title">Pending Human Approval ({pendingApprovals.length})</h2>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>DISPATCH ID</th>
              <th>CUSTOMER</th>
              <th>PO NUMBER</th>
              <th>VEHICLE</th>
              <th>WEIGHT</th>
              <th>PO SELLING RATE</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {pendingApprovals.map((item) => (
              <tr key={item.dispatch_id}>
                <td>
                  <Link href={`/dispatches/${item.dispatch_id}`} style={{ fontWeight: '700', color: '#2563EB', textDecoration: 'none' }}>
                    {item.dispatch_id}
                  </Link>
                </td>
                <td style={{ color: '#0F172A', fontWeight: '600' }}>{item.customer}</td>
                <td style={{ color: '#475569', fontWeight: '500' }}>{item.po_number}</td>
                <td style={{ fontFamily: 'monospace', fontWeight: '600', color: '#334155' }}>{item.vehicle}</td>
                <td style={{ color: '#475569' }}>{item.weight}</td>
                <td style={{ fontWeight: '700', color: '#059669', fontSize: '15px' }}>{item.rate}</td>
                <td>
                  <Link href={`/dispatches/${item.dispatch_id}`} className="btn-success" style={{ textDecoration: 'none', display: 'inline-block', padding: '6px 14px', fontSize: '13px' }}>
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
