'use client';

import Link from 'next/link';

export default function ExceptionsPage() {
  const exceptions = [
    { dispatch_id: 'DSP-002', customer: 'ABC Metals', po_number: 'PO-44312', type: 'VEHICLE_MISMATCH', description: 'Bill vehicle (MH12AB9999) does not match LR vehicle (MH12AB1234)', severity: 'HIGH' },
    { dispatch_id: 'DSP-007', customer: 'Delta Heavy', po_number: 'PO-77889', type: 'WEIGHT_TOLERANCE_EXCEEDED', description: 'Weighment variance (1.8%) exceeds maximum allowed threshold (1.0%)', severity: 'HIGH' },
  ];

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
          <h1 className="page-title">Lab Requests & Exceptions</h1>
          <p className="page-subtitle">
            Cross-document discrepancies flagged by the validation engine. Requires operator review before Zoho invoice generation.
          </p>
        </div>
        <button className="btn-primary-dark">+ Request Re-Scan</button>
      </div>

      {/* Filter & Search Bar */}
      <div className="filter-bar-card">
        <div className="search-input-wrapper">
          <span>🔍</span>
          <input type="text" placeholder="Name or ID..." readOnly />
        </div>
        <div className="filter-pills-group">
          <button className="filter-pill active">All Exceptions</button>
          <button className="filter-pill">Critical Value</button>
          <button className="filter-pill">Vehicle Mismatch</button>
          <button className="filter-pill">Weight Variance</button>
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
              <th>EXCEPTION TYPE</th>
              <th>DISCREPANCY DETAILS</th>
              <th>SEVERITY</th>
              <th style={{ textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {exceptions.map((item) => {
              const initials = getInitials(item.customer);

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
                  <td>
                    <span className="status-pill status-pill-rose">
                      • {item.type}
                    </span>
                  </td>
                  <td style={{ color: '#475569', fontSize: '12px', maxWidth: '320px', lineHeight: '1.4' }}>
                    {item.description}
                  </td>
                  <td>
                    <span style={{ color: '#BE123C', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase' }}>
                      ● {item.severity}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link
                      href={`/dispatches/${item.dispatch_id}`}
                      style={{
                        color: '#0F172A', textDecoration: 'none', fontWeight: '700',
                        fontSize: '12px', background: '#F1F5F9', padding: '6px 12px',
                        borderRadius: '6px', border: '1px solid #CBD5E1'
                      }}
                    >
                      Resolve →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Table Footer Pagination */}
        <div className="table-footer-pagination">
          <div>1 to {exceptions.length} of {exceptions.length}</div>
          <div className="pagination-links">
            <span className="pagination-link">Prev</span>
            <span className="pagination-link">Next</span>
          </div>
        </div>
      </div>
    </div>
  );
}
