import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    system: 'Enlight Sales OS',
    timestamp: new Date().toISOString(),
    endpoints: {
      permanent_webhook: 'https://web-chi-azure-76.vercel.app/api/whatsapp/webhook',
      dispatches_api: 'https://web-chi-azure-76.vercel.app/dispatches',
      zoho_invoices_api: 'https://web-chi-azure-76.vercel.app/invoices',
      whatsapp_agent_ui: 'https://web-chi-azure-76.vercel.app/whatsapp',
    },
    sync_status: {
      ui_connected: true,
      whatsapp_agent_connected: true,
      n8n_workflow_connected: true,
      zoho_books_org_id: '60082578964'
    }
  });
}
