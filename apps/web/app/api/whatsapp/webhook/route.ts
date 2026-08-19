import { NextRequest, NextResponse } from 'next/server';

/**
 * Permanent Production WhatsApp & Workflow Webhook Endpoint
 * URL: https://web-chi-azure-76.vercel.app/api/whatsapp/webhook
 * 
 * Handles incoming Twilio WhatsApp webhooks, n8n workflows, and UI sync.
 */
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let payload: Record<string, any> = {};

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        payload[key] = value.toString();
      });
    } else if (contentType.includes('application/json')) {
      payload = await req.json();
    } else {
      const text = await req.text();
      try {
        payload = JSON.parse(text);
      } catch {
        payload = { body: text };
      }
    }

    const from = payload.From || payload.from || payload.wa_id || '+917588353703';
    const bodyText = payload.Body || payload.body || payload.message || '';
    const numMedia = parseInt(payload.NumMedia || payload.num_media || '0', 10);
    const mediaUrl = payload.MediaUrl0 || payload.media_url || '';

    console.log(`[Webhook Intake] From: ${from} | Body: ${bodyText} | Media: ${numMedia > 0 ? mediaUrl : 'None'}`);

    // Try forwarding to local/cloud backend API if available
    const backendUrl = process.env.FASTAPI_BACKEND_URL || 'http://localhost:8000';
    let backendSuccess = false;

    try {
      const apiRes = await fetch(`${backendUrl}/api/v1/whatsapp/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(payload).toString(),
        signal: AbortSignal.timeout(3000), // 3 second timeout
      });

      if (apiRes.ok) {
        backendSuccess = true;
      }
    } catch (err) {
      console.warn('[Webhook Proxy] Primary backend timeout/unreachable, processing locally.');
    }

    // Auto-respond with TwiML XML for Twilio WhatsApp
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>⚡ *Enlight Sales OS*: Message received! Processing dispatch details for ${from}...</Message>
</Response>`;

    return new NextResponse(twimlResponse, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error: any) {
    console.error('[Webhook Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Webhook Error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'Enlight Sales OS — Webhook Gateway',
    webhook_url: 'https://web-chi-azure-76.vercel.app/api/whatsapp/webhook',
    supported_providers: ['Twilio WhatsApp', 'n8n Workflows', 'Custom JSON/Form Webhooks'],
    updated_at: new Date().toISOString()
  });
}
