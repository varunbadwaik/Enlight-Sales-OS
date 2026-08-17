'use client';

import Link from 'next/link';

export default function ExceptionsPage() {
  const exceptions = [
    { dispatch_id: 'DSP-002', customer: 'ABC Metals', po_number: 'PO-44312', type: 'VEHICLE_MISMATCH', description: 'Bill vehicle (MH12AB9999) does not match LR vehicle (MH12AB1234)', severity: 'HIGH' },
    { dispatch_id: 'DSP-007', customer: 'Delta Heavy', po_number: 'PO-77889', type: 'WEIGHT_TOLERANCE_EXCEEDED', description: 'Weighment variance (1.8%) exceeds maximum allowed threshold (1.0%)', severity: 'HIGH' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.5px' }}>
          Exceptions & Validation Errors Queue
        </h1>
        <p style={{ color: '#64748B', marginTop: '4px', fontSize: '14px' }}>
          Cross-document discrepancies flagged by the validation engine. Requires human operator review or corrective re-upload before invoice generation.
        </p>
      </div>

      <div className="card-container">
        <div className="card-header">
          <h2 className="card-title">Flagged Exceptions ({exceptions.length})</h2>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>DISPATCH ID</th>
              <th>CUSTOMER</th>
              <th>PO NUMBER</th>
              <th>EXCEPTION TYPE</th>
              <th>DISCREPANCY DETAILS</th>
              <th>SEVERITY</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {exceptions.map((item) => (
              <tr key={item.dispatch_id}>
                <td>
                  <Link href={`/dispatches/${item.dispatch_id}`} style={{ fontWeight: '700', color: '#2563EB', textDecoration: 'none' }}>
                    {item.dispatch_id}
                  </Link>
                </td>
                <td style={{ color: '#0F172A', fontWeight: '600' }}>{item.customer}</td>
                <td style={{ color: '#475569', fontWeight: '500' }}>{item.po_number}</td>
                <td>
                  <span className="status-badge status-failed">{item.type}</span>
                </td>
                <td style={{ color: '#475569', fontSize: '13px', maxWidth: '300px' }}>{item.description}</td>
                <td>
                  <span style={{ color: '#DC2626', fontWeight: '700', fontSize: '12px' }}>● {item.severity}</span>
                </td>
                <td>
                  <Link href={`/dispatches/${item.dispatch_id}`} className="btn-danger" style={{ textDecoration: 'none', display: 'inline-block', padding: '6px 14px', fontSize: '13px' }}>
                    Resolve Discrepancy →
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
