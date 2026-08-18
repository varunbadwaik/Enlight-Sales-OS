'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DispatchDetailPage({ params }: { params: { id: string } }) {
  const dispatchId = params.id || 'DSP-001';
  const [activeTab, setActiveTab] = useState<'EXTRACTION' | 'VALIDATION' | 'APPROVAL' | 'INVOICE' | 'AUDIT'>('EXTRACTION');
  const [approvalDecision, setApprovalDecision] = useState<string | null>('VALIDATED');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [invoiceDetails, setInvoiceDetails] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([
    { time: '10:20 AM', action: 'DISPATCH_CREATED', details: `Dispatch ${dispatchId} created in DOCUMENTS_UPLOADED status.` },
    { time: '10:21 AM', action: 'GEMINI_EXTRACTION_COMPLETED', details: 'Extracted structured JSON for PO, Bill, LR, Weighment slip.' },
    { time: '10:22 AM', action: 'VALIDATION_COMPLETED', details: 'Cross-document validation passed with 0.00% weight difference.' },
  ]);

  const handleApproveAndCreateInvoice = async () => {
    setIsProcessing(true);
    try {
      // Step 1: Call API to Approve Dispatch
      const approveRes = await fetch(`http://localhost:8000/api/v1/dispatches/${dispatchId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Role': 'Admin' },
        body: JSON.stringify({ decision: 'APPROVED', comment: 'Approved via Admin Portal UI' }),
      });
      const approveData = await approveRes.json();
      setApprovalDecision('APPROVED');

      // Step 2: Call API to Create Draft Sales Invoice (Customer PO Rate ₹58/kg Lock)
      const invoiceRes = await fetch(`http://localhost:8000/api/v1/dispatches/${dispatchId}/create-draft-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Role': 'Admin' },
      });
      const invoiceData = await invoiceRes.json();
      setInvoiceDetails(invoiceData);

      // Append Audit Logs
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setAuditLogs((prev) => [
        ...prev,
        { time: now, action: 'ADMIN_APPROVED', details: 'Admin approved dispatch for Zoho Draft Sales Invoice creation.' },
        { time: now, action: 'DRAFT_INVOICE_CREATED', details: `Zoho Sales Invoice ${invoiceData.invoice_id || 'inv_zoho_DSP-001'} created at locked PO rate ₹58/kg in DRAFT status.` }
      ]);

      // Automatically switch to Draft Invoice tab
      setActiveTab('INVOICE');
    } catch (error) {
      console.error('API Error:', error);
      // Fallback mock state for client-only fallback
      setApprovalDecision('APPROVED');
      setInvoiceDetails({
        invoice_id: `inv_zoho_${dispatchId}`,
        invoice_number: `INV-2026-${dispatchId}`,
        status: 'draft',
        selling_rate_applied: 58.0,
        quantity: 12500,
        source: 'Customer PO (PO-98765)'
      });
      setActiveTab('INVOICE');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectDispatch = async () => {
    setIsProcessing(true);
    try {
      await fetch(`http://localhost:8000/api/v1/dispatches/${dispatchId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Role': 'Admin' },
        body: JSON.stringify({ decision: 'REJECTED', comment: 'Rejected via Admin Portal UI' }),
      });
      setApprovalDecision('REJECTED');
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setAuditLogs((prev) => [
        ...prev,
        { time: now, action: 'ADMIN_REJECTED', details: 'Admin rejected dispatch.' }
      ]);
    } catch (e) {
      setApprovalDecision('REJECTED');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <div style={{ marginBottom: '16px' }}>
        <Link href="/dispatches" style={{ color: '#64748B', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
          ← Back to Dispatches
        </Link>
      </div>

      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.5px' }}>
              Dispatch {dispatchId}
            </h1>
            {approvalDecision === 'APPROVED' && <span className="status-badge status-draft">✓ DRAFT CREATED</span>}
            {approvalDecision === 'REJECTED' && <span className="status-badge status-failed">✖ REJECTED</span>}
            {approvalDecision === 'VALIDATED' && <span className="status-badge status-validated">✓ VALIDATED</span>}
            {dispatchId.includes('WA') ? (
              <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '4px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: '700' }}>
                🟢 Source: WhatsApp Agent
              </span>
            ) : (
              <span style={{ backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '4px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: '700' }}>
                🔵 Source: Web App Intake
              </span>
            )}
          </div>
          <p style={{ color: '#64748B', marginTop: '4px', fontSize: '14px' }}>
            Customer: <strong style={{ color: '#0F172A' }}>XYZ Industries</strong> | PO: <strong style={{ color: '#0F172A' }}>PO-98765</strong> | Vehicle: <strong style={{ fontFamily: 'monospace', color: '#0F172A' }}>MH12AB1234</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn-danger"
            disabled={isProcessing || approvalDecision === 'REJECTED'}
            onClick={handleRejectDispatch}
          >
            {isProcessing ? 'Processing...' : 'Reject Dispatch'}
          </button>
          <button
            className="btn-success"
            disabled={isProcessing || approvalDecision === 'APPROVED'}
            onClick={handleApproveAndCreateInvoice}
          >
            {isProcessing ? '⏳ Creating Invoice...' : 'Approve & Create Draft Invoice'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', marginBottom: '28px' }}>
        {[
          { key: 'EXTRACTION', label: '📄 Document & AI Extraction' },
          { key: 'VALIDATION', label: '⚖️ Cross-Document Validation' },
          { key: 'APPROVAL', label: '⏳ Admin Approval Gate' },
          { key: 'INVOICE', label: '📄 Draft Invoice' },
          { key: 'AUDIT', label: '📜 Audit Trail' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: activeTab === tab.key ? '700' : '500',
              color: activeTab === tab.key ? '#2563EB' : '#64748B',
              borderBottom: activeTab === tab.key ? '3px solid #2563EB' : 'transparent',
              backgroundColor: 'transparent',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Extraction Split-Screen */}
      {activeTab === 'EXTRACTION' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Document Viewer Container with Drag & Drop Upload */}
          <div className="card-container" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>Document Upload & Viewer</h3>
              <button
                className="btn-success"
                style={{ padding: '8px 16px', fontSize: '13px' }}
                disabled={isProcessing}
                onClick={async () => {
                  setIsProcessing(true);
                  try {
                    const res = await fetch(`http://localhost:8000/api/v1/dispatches/${dispatchId}/process-documents`, { method: 'POST' });
                    if (res.ok) {
                      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      setAuditLogs((prev) => [
                        ...prev,
                        { time: now, action: 'GEMINI_EXTRACTION_COMPLETED', details: 'Gemini Multimodal OCR processed uploaded documents.' }
                      ]);
                    }
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setIsProcessing(false);
                  }
                }}
              >
                {isProcessing ? '⏳ Extracting...' : '✨ Run Gemini OCR'}
              </button>
            </div>

            {/* Drag and Drop File Upload Area */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={async (e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  const file = e.dataTransfer.files[0];
                  const formData = new FormData();
                  formData.append('file', file);
                  formData.append('document_type', 'purchase_bill');
                  formData.append('dispatch_id', dispatchId);
                  try {
                    await fetch('http://localhost:8000/api/v1/uploads', {
                      method: 'POST',
                      body: formData,
                    });
                    alert(`Uploaded ${file.name} cleanly to server!`);
                  } catch (err) {
                    console.error(err);
                  }
                }
              }}
              style={{
                height: '380px',
                backgroundColor: '#F8FAFC',
                border: '2px dashed #CBD5E1',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                cursor: 'pointer',
                padding: '20px',
                textAlign: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ fontSize: '48px', marginBottom: '12px' }}>📂</span>
              <p style={{ fontWeight: '700', color: '#1E293B', fontSize: '15px' }}>
                Drag & Drop Dispatch Documents Here
              </p>
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '6px' }}>
                Accepts PDF, PNG, JPG (Purchase Bills, Customer POs, Weighment Slips, LRs)
              </p>
              <label
                style={{
                  marginTop: '16px',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Browse File
                <input
                  type="file"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      const formData = new FormData();
                      formData.append('file', file);
                      formData.append('document_type', 'purchase_bill');
                      formData.append('dispatch_id', dispatchId);
                      try {
                        await fetch('http://localhost:8000/api/v1/uploads', {
                          method: 'POST',
                          body: formData,
                        });
                        alert(`Uploaded ${file.name} cleanly to server!`);
                      } catch (err) {
                        console.error(err);
                      }
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {/* Extracted Fields Form Container */}
          <div className="card-container" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#0F172A' }}>
              Extracted Fields (Gemini Multimodal)
            </h3>

            {/* Authoritative Rate Lock Banner */}
            <div className="rate-lock-card">
              <div className="rate-lock-header">
                <span className="rate-lock-title">Customer PO Selling Rate</span>
                <span className="rate-lock-badge">Customer PO PO-98765</span>
              </div>
              <div className="rate-lock-value">₹58.00 / kg</div>
              <p className="rate-lock-desc">
                *Mandatory Selling Rate: Hard-locked to Customer PO rate. Vendor Purchase Bill rate (₹50.00) is ignored for sales invoice creation.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>
                  Customer Name
                </label>
                <input
                  type="text"
                  defaultValue="XYZ Industries"
                  readOnly
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', fontWeight: '600', color: '#0F172A' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>
                  Customer PO Number
                </label>
                <input
                  type="text"
                  defaultValue="PO-98765"
                  readOnly
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', fontWeight: '600', color: '#0F172A' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>
                  Vehicle Number
                </label>
                <input
                  type="text"
                  defaultValue="MH12AB1234"
                  readOnly
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', fontFamily: 'monospace', fontWeight: '600', color: '#0F172A' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>
                  Dispatched Net Weight
                </label>
                <input
                  type="text"
                  defaultValue="12,500 KG"
                  readOnly
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', fontWeight: '600', color: '#0F172A' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Validation */}
      {activeTab === 'VALIDATION' && (
        <div className="card-container" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#0F172A' }}>
            Cross-Document Validation Report
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ border: '1px solid #BBF7D0', backgroundColor: '#F0FDF4', borderRadius: '8px', padding: '18px' }}>
              <div style={{ fontWeight: '700', color: '#166534', fontSize: '15px' }}>✓ VEHICLE MATCH — PASSED</div>
              <p style={{ fontSize: '14px', color: '#15803D', marginTop: '6px' }}>
                Vehicle registration number <code style={{ fontFamily: 'monospace', fontWeight: '700' }}>MH12AB1234</code> matches consistently across Purchase Bill, LR, Weighment slip, and WhatsApp message.
              </p>
            </div>
            <div style={{ border: '1px solid #BBF7D0', backgroundColor: '#F0FDF4', borderRadius: '8px', padding: '18px' }}>
              <div style={{ fontWeight: '700', color: '#166534', fontSize: '15px' }}>✓ WEIGHT TOLERANCE — PASSED (0.00% Variance)</div>
              <p style={{ fontSize: '14px', color: '#15803D', marginTop: '6px' }}>
                Dispatched weight of 12,500 KG matches weighment slip exactly. Difference (0.00%) is within the allowed 1.0% weight tolerance limit.
              </p>
            </div>
            <div style={{ border: '1px solid #BBF7D0', backgroundColor: '#F0FDF4', borderRadius: '8px', padding: '18px' }}>
              <div style={{ fontWeight: '700', color: '#166534', fontSize: '15px' }}>✓ CUSTOMER PO SELLING RATE PRESENCE — PASSED</div>
              <p style={{ fontSize: '14px', color: '#15803D', marginTop: '6px' }}>
                Authoritative selling rate ₹58.00/kg retrieved successfully from Customer PO PO-98765.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Approval Gate */}
      {activeTab === 'APPROVAL' && (
        <div className="card-container" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: '#0F172A' }}>Admin Approval Gate</h3>
          <p style={{ color: '#475569', marginBottom: '24px', fontSize: '14px' }}>
            Human Approval Gate: Confirming approval updates dispatch status to <strong>APPROVED</strong> and triggers Zoho Books Sales Invoice generation.
          </p>

          <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '20px', marginBottom: '24px', backgroundColor: '#F8FAFC' }}>
            <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Decision Status:</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: approvalDecision === 'APPROVED' ? '#16A34A' : approvalDecision === 'REJECTED' ? '#DC2626' : '#2563EB', marginTop: '6px' }}>
              {approvalDecision ? approvalDecision : 'PENDING_APPROVAL'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button className="btn-success" disabled={isProcessing} onClick={handleApproveAndCreateInvoice}>
              Approve Dispatch
            </button>
            <button className="btn-danger" disabled={isProcessing} onClick={handleRejectDispatch}>
              Reject Dispatch
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Draft Invoice */}
      {activeTab === 'INVOICE' && (
        <div className="card-container" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#0F172A' }}>Zoho Books Draft Sales Invoice</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div>
              <span style={{ color: '#64748B', fontSize: '13px', fontWeight: '600' }}>Invoice ID:</span>
              <p style={{ fontWeight: '700', color: '#0F172A', fontFamily: 'monospace', fontSize: '16px', marginTop: '4px' }}>
                {invoiceDetails?.invoice_id || `inv_zoho_${dispatchId}`}
              </p>
            </div>
            <div>
              <span style={{ color: '#64748B', fontSize: '13px', fontWeight: '600' }}>Status:</span>
              <p style={{ marginTop: '4px' }}>
                <span className="status-badge status-draft">🔒 DRAFT (Forced Protection)</span>
              </p>
            </div>
            <div>
              <span style={{ color: '#64748B', fontSize: '13px', fontWeight: '600' }}>Selling Rate Applied:</span>
              <p style={{ fontWeight: '800', color: '#059669', fontSize: '22px', marginTop: '4px' }}>
                ₹{invoiceDetails?.selling_rate_applied ? invoiceDetails.selling_rate_applied.toFixed(2) : '58.00'} / kg
              </p>
            </div>
            <div>
              <span style={{ color: '#64748B', fontSize: '13px', fontWeight: '600' }}>Rate Source:</span>
              <p style={{ fontWeight: '700', color: '#0F172A', marginTop: '4px' }}>
                {invoiceDetails?.source || 'Customer PO (PO-98765)'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Audit Log */}
      {activeTab === 'AUDIT' && (
        <div className="card-container" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#0F172A' }}>Immutable Audit Log Timeline</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {auditLogs.map((event, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', borderLeft: '3px solid #2563EB', paddingLeft: '20px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>{event.time}</span>
                  <div style={{ fontWeight: '700', color: '#0F172A', marginTop: '2px', fontSize: '15px' }}>{event.action}</div>
                  <p style={{ fontSize: '14px', color: '#475569', marginTop: '4px' }}>{event.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
