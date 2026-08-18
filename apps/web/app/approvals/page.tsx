'use client';

import Link from 'next/link';

export default function ApprovalsPage() {
  const pendingApprovals = [
    { dispatch_id: 'DSP-004', customer: 'Apex Metals', po_number: 'PO-11223', vehicle: 'MH14 AB 9999', weight: '10,000 KG', rate: '₹55.00/kg', status: 'PENDING_APPROVAL' },
    { dispatch_id: 'DSP-001', customer: 'XYZ Industries', po_number: 'PO-98765', vehicle: 'MH12 AB 1234', weight: '12,500 KG', rate: '₹58.00/kg', status: 'PENDING_APPROVAL' },
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
          <h1 className="page-title">Approvals Queue</h1>
          <p className="page-subtitle">
            Dispatches awaiting explicit Human Admin Approval before Zoho Draft Invoice generation.
          </p>
        </div>
        <button className="btn-primary-dark">+ Review All</button>
      </div>

      {/* Filter & Search Bar */}
      <div className="filter-bar-card">
        <div className="search-input-wrapper">
          <span>🔍</span>
          <input type="text" placeholder="Name or ID..." readOnly />
        </div>
        <div className="filter-pills-group">
          <button className="filter-pill active">All Pending</button>
          <button className="filter-pill">High Priority</button>
          <button className="filter-pill">WhatsApp Intake</button>
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
              <th>PO SELLING RATE</th>
              <th>STATUS</th>
              <th style={{ textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {pendingApprovals.map((item) => {
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
                  <td style={{ color: '#475569' }}>{item.vehicle}</td>
                  <td style={{ color: '#475569' }}>{item.weight}</td>
                  <td style={{ fontWeight: '700', color: '#0F172A' }}>{item.rate}</td>
                  <td>
                    <span className="status-pill status-pill-amber">
                      • Pending Review
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link href={`/dispatches/${item.dispatch_id}`} style={{ color: '#0F172A', textDecoration: 'none', fontWeight: '700', fontSize: '12px' }}>
                      Review & Approve →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Table Footer Pagination */}
        <div className="table-footer-pagination">
          <div>1 to {pendingApprovals.length} of {pendingApprovals.length}</div>
          <div className="pagination-links">
            <span className="pagination-link">Prev</span>
            <span className="pagination-link">Next</span>
          </div>
        </div>
      </div>
    </div>
  );
}
