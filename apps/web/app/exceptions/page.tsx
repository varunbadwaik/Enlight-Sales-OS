'use client';

import Link from 'next/link';

export default function ExceptionsPage() {
  const exceptions = [
    {
      lab_id: 'LAB-2026-984126',
      dispatch_id: 'DSP-002',
      customer: 'ABC Metals',
      po_number: 'PO-44312',
      type: 'Basic Metabolic Mismatch',
      priority: 'Urgent',
      description: 'Bill vehicle (MH12AB9999) does not match LR vehicle (MH12AB1234)',
      severity: 'Critical View',
      status_class: 'status-pill-rose',
    },
    {
      lab_id: 'LAB-2026-984127',
      dispatch_id: 'DSP-007',
      customer: 'Delta Heavy',
      po_number: 'PO-77889',
      type: 'Weighment Variance Exceeded',
      priority: 'Urgent',
      description: 'Weighment variance (1.8%) exceeds maximum allowed threshold (1.0%)',
      severity: 'Critical View',
      status_class: 'status-pill-rose',
    },
    {
      lab_id: 'LAB-2026-984128',
      dispatch_id: 'DSP-012',
      customer: 'Hassan Al-Rashid',
      po_number: 'PO-99120',
      type: 'Blood Cultures Variance',
      priority: 'Urgent',
      description: 'Required LR consignment note missing from uploaded payload',
      severity: 'Critical View',
      status_class: 'status-pill-rose',
    },
    {
      lab_id: 'LAB-2026-984129',
      dispatch_id: 'DSP-015',
      customer: 'Marguerite Oai',
      po_number: 'PO-55102',
      type: 'HbA1c Discrepancy',
      priority: 'Routine',
      description: 'Unit selling rate discrepancy flagged for operator review',
      severity: 'Resulted',
      status_class: 'status-pill-blue',
    },
    {
      lab_id: 'LAB-2026-984130',
      dispatch_id: 'DSP-018',
      customer: 'Kojo Mensah',
      po_number: 'PO-33410',
      type: 'Electrolyte Panel Audit',
      priority: 'Routine',
      description: 'Automatic weighbridge tolerance auto-resolved within 0.2%',
      severity: 'Resulted',
      status_class: 'status-pill-blue',
    },
  ];

  const getInitials = (name: string) => {
    if (!name) return 'EX';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Lab Requests / Exceptions</h1>
          <p className="page-subtitle">
            Cross-document discrepancies flagged by the validation engine. Results appear once approved and resolved.
          </p>
        </div>
        <button className="btn-primary-dark">
          + Request a Test
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="filter-bar-card">
        <div className="search-input-wrapper">
          <span>🔍</span>
          <input type="text" placeholder="Name or ID..." readOnly />
        </div>
        <div className="filter-pills-group">
          <button className="filter-pill active">All</button>
          <button className="filter-pill">Critical Value</button>
          <button className="filter-pill">Resulted</button>
          <button className="filter-pill">Received</button>
        </div>
      </div>

      {/* Main Clinical Table */}
      <div className="table-container-card">
        <table className="clinical-table">
          <thead>
            <tr>
              <th>LAB ID</th>
              <th>PATIENT / CUSTOMER</th>
              <th>TEST NAME / EXCEPTION</th>
              <th>PRIORITY</th>
              <th>STATUS</th>
              <th style={{ textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {exceptions.map((item) => {
              const initials = getInitials(item.customer);

              return (
                <tr key={item.lab_id}>
                  <td style={{ fontWeight: '700', color: '#0F172A' }}>
                    <Link href={`/dispatches/${item.dispatch_id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {item.lab_id}
                    </Link>
                  </td>
                  <td>
                    <div className="customer-avatar-row">
                      <div className="customer-avatar-circle">{initials}</div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#0F172A' }}>{item.customer}</div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>{item.po_number} • {item.dispatch_id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: '#334155', fontWeight: '500' }}>
                    <div>{item.type}</div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>{item.description}</div>
                  </td>
                  <td style={{ color: item.priority === 'Urgent' ? '#9F1239' : '#475569', fontWeight: '600' }}>
                    {item.priority}
                  </td>
                  <td>
                    <span className={`status-pill ${item.status_class}`}>
                      • {item.severity}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link href={`/dispatches/${item.dispatch_id}`} style={{ color: '#94A3B8', textDecoration: 'none', fontWeight: '800' }}>
                      ···
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
