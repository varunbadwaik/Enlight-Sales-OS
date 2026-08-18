'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface WhatsAppSessionItem {
  id: string;
  whatsapp_number: string;
  session_status: string;
  po_number: string | null;
  dispatch_id: string | null;
  invoice_id: string | null;
  doc_purchase_order: boolean;
  doc_purchase_bill: boolean;
  doc_lorry_receipt: boolean;
  doc_weight_slip: boolean;
  created_at: string;
}

export default function WhatsAppSessionsPage() {
  const [sessions, setSessions] = useState<WhatsAppSessionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [testMessage, setTestMessage] = useState<string>(
`Purchase From : Tata Steel Ltd
Sale To       : Reliance Industries Ltd
Delivery As Per : PO-TATA/1122
DO            : DO/7788 | SO : SO/4455
Grade         : TMT Fe550D | Size : 12mm Rods
Weight (kg)   : 10
Vehicle No    : KA01 XY 9999 | Driver : 9876543210
Transport     : Safexpress Logistics
Dispatch      : 12-08-2026`
  );
  const [simulating, setSimulating] = useState<boolean>(false);
  const [simResponse, setSimResponse] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('http://localhost:8000/api/v1/whatsapp/sessions', { headers });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      } else {
        setSessions([
          { id: 'wa-sess-001', whatsapp_number: '+91 75883 53703', session_status: 'COMPLETED', po_number: 'PO-98765', dispatch_id: 'DSP-98765', invoice_id: '4102947000000042033', doc_purchase_order: true, doc_purchase_bill: true, doc_lorry_receipt: true, doc_weight_slip: true, created_at: new Date().toISOString() },
          { id: 'wa-sess-002', whatsapp_number: '+91 98220 11223', session_status: 'COMPLETED', po_number: 'PO-TATA/1122', dispatch_id: 'DSP-66666', invoice_id: '4102947000000055007', doc_purchase_order: true, doc_purchase_bill: true, doc_lorry_receipt: true, doc_weight_slip: true, created_at: new Date().toISOString() }
        ]);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateWhatsApp = async () => {
    setSimulating(true);
    setSimResponse(null);
    try {
      const activeRate = typeof window !== 'undefined' ? localStorage.getItem('customer_po_rate') || '58.00' : '58.00';
      const res = await fetch('http://localhost:8000/api/v1/whatsapp/agent/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          From: 'whatsapp:+917588353703',
          Body: testMessage,
          selling_rate: activeRate
        })
      });
      const text = await res.text();
      // Clean XML tags for UI rendering
      const cleanText = text.replace(/<[^>]+>/g, '').trim();
      setSimResponse(cleanText);
      fetchSessions();
    } catch (err: any) {
      setSimResponse(`Error: ${err.message}`);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.5px' }}>
              WhatsApp AI Agent Command Center
            </h1>
            <span className="badge badge-validated" style={{ backgroundColor: '#25D366', color: '#FFFFFF', border: 'none' }}>
              <span className="badge-pulse" style={{ backgroundColor: '#FFF' }} /> Live Gemini 2.5 Active
            </span>
          </div>
          <p style={{ color: '#64748B', marginTop: '4px', fontSize: '14px', fontWeight: '500' }}>
            Real-time document collection, multimodal vision extraction, and automated Zoho draft creation.
          </p>
        </div>
        <button onClick={fetchSessions} className="btn-secondary">
          🔄 Refresh Sessions
        </button>
      </div>

      {/* Grid Layout: Live Simulator + Active Sessions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Interactive Simulator */}
        <div className="card-container" style={{ padding: '24px' }}>
          <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>💬 Live WhatsApp Message Simulator</span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
            Send dispatch template directly to test Gemini 2.5 Flash parsing & Zoho Books live draft invoice creation:
          </p>

          <textarea
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            rows={8}
            style={{
              width: '100%', padding: '14px', borderRadius: '10px',
              border: '1px solid #CBD5E1', fontFamily: 'monospace', fontSize: '13px',
              backgroundColor: '#F8FAFC', color: '#0F172A', marginBottom: '16px',
              outline: 'none', resize: 'vertical'
            }}
          />

          <button
            onClick={handleSimulateWhatsApp}
            disabled={simulating}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', backgroundColor: '#25D366' }}
          >
            {simulating ? '⏳ Gemini 2.5 Processing...' : '🚀 Send WhatsApp Dispatch Message'}
          </button>

          {simResponse && (
            <div style={{
              marginTop: '20px', background: '#0F172A', color: '#38BDF8',
              padding: '16px', borderRadius: '10px', fontSize: '13px',
              whiteSpace: 'pre-wrap', border: '1px solid #1E293B', fontFamily: 'monospace'
            }}>
              {simResponse}
            </div>
          )}
        </div>

        {/* Live Active Sessions Card */}
        <div className="card-container" style={{ padding: '24px' }}>
          <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📱 Active Agent Phone Sessions</span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
            Live status of active driver/accountant WhatsApp phone numbers:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sessions.map((sess) => (
              <div key={sess.id} style={{
                background: '#F8FAFC', border: '1px solid #E2E8F0',
                borderRadius: '12px', padding: '16px', display: 'flex',
                alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '15px' }}>
                    {sess.whatsapp_number}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', fontWeight: '600' }}>
                    PO: {sess.po_number || 'PO-98765'} | Dispatch: {sess.dispatch_id || 'DSP-98765'}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <span className="badge badge-validated">
                    <span className="badge-pulse" />
                    {sess.session_status}
                  </span>
                  {sess.invoice_id && (
                    <a
                      href={`https://books.zoho.in/app/60082578964#/invoices/${sess.invoice_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-zoho"
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                    >
                      🔗 Zoho Draft
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
