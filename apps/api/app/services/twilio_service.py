"""Twilio WhatsApp Integration & Messaging Utilities."""

import os
import logging
import httpx
from typing import Optional, Dict, Any
from app.config import settings

logger = logging.getLogger(__name__)


class TwilioService:
    def __init__(self):
        self.account_sid = settings.WHATSAPP_ACCOUNT_SID or getattr(settings, "TWILIO_ACCOUNT_SID", "")
        self.auth_token = settings.WHATSAPP_AUTH_TOKEN or getattr(settings, "TWILIO_AUTH_TOKEN", "")
        self.from_number = getattr(settings, "TWILIO_WHATSAPP_NUMBER", "") or "whatsapp:+14155238886"

    async def send_whatsapp_message(self, to_number: str, message_body: str) -> Dict[str, Any]:
        """Sends an outbound WhatsApp message using Twilio REST API."""
        if not to_number.startswith("whatsapp:"):
            formatted_to = f"whatsapp:{to_number}"
        else:
            formatted_to = to_number

        formatted_from = self.from_number
        if not formatted_from.startswith("whatsapp:"):
            formatted_from = f"whatsapp:{formatted_from}"

        url = f"https://api.twilio.com/2010-04-01/Accounts/{self.account_sid}/Messages.json"

        if not self.account_sid or not self.auth_token:
            logger.warning("Twilio SID/Auth Token not set. Mocking outbound WhatsApp message dispatch.")
            return {"status": "mocked", "to": formatted_to, "body": message_body}

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url,
                    data={
                        "From": formatted_from,
                        "To": formatted_to,
                        "Body": message_body,
                    },
                    auth=(self.account_sid, self.auth_token),
                    timeout=10.0,
                )
                if response.status_code in [200, 201]:
                    logger.info(f"Outbound WhatsApp message sent to {formatted_to}")
                    return response.json()
                else:
                    logger.error(f"Twilio API Error ({response.status_code}): {response.text}")
                    return {"status": "error", "code": response.status_code, "body": message_body}
        except Exception as e:
            logger.error(f"Failed to send Twilio message: {e}")
            return {"status": "failed", "error": str(e), "body": message_body}

    async def download_media(self, media_url: str, save_path: str) -> bool:
        """Downloads media file from Twilio CDN using Basic Auth."""
        try:
            auth = None
            if self.account_sid and self.auth_token:
                auth = (self.account_sid, self.auth_token)

            os.makedirs(os.path.dirname(save_path), exist_ok=True)

            async with httpx.AsyncClient(follow_redirects=True) as client:
                res = await client.get(media_url, auth=auth, timeout=8.0)
                if res.status_code == 200:
                    with open(save_path, "wb") as f:
                        f.write(res.content)
                    return True
                else:
                    logger.error(f"Failed to download media from {media_url}: status {res.status_code}")
                    return False
        except Exception as e:
            logger.error(f"Exception downloading media from {media_url}: {e}")
            return False

    @staticmethod
    def build_twiml_response(message: str) -> str:
        """Constructs XML TwiML response string for Twilio webhook reply."""
        escaped_msg = message.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        return f'<?xml version="1.0" encoding="UTF-8"?><Response><Message>{escaped_msg}</Message></Response>'

    @staticmethod
    def format_checklist_message(session) -> str:
        """Formats interactive WhatsApp document checklist."""
        po_check = "✅" if session.doc_purchase_order else "⬜"
        bill_check = "✅" if session.doc_purchase_bill else "⬜"
        lr_check = "✅" if session.doc_lorry_receipt else "⬜"
        weight_check = "✅" if session.doc_weight_slip else "⬜"

        po_str = session.po_number or "Not Provided"

        return (
            f"📋 Enlight Sales OS — Dispatch Intake\n"
            f"PO Number: {po_str}\n\n"
            f"Please upload the following 4 dispatch documents:\n"
            f"{po_check} 1. Customer PO (po.pdf)\n"
            f"{bill_check} 2. Purchase Bill (bill.pdf)\n"
            f"{lr_check} 3. Lorry Receipt / LR (lr.jpg)\n"
            f"{weight_check} 4. Weighment Slip (weight.jpg)\n\n"
            f"💡 Reply with photo/PDF attachments to complete submission."
        )

    @staticmethod
    def format_completed_message(dispatch_id: str, invoice_id: str, selling_rate: float, customer_name: str, po_number: str = "PO-98765") -> str:
        """Formats completed invoice processing notification with direct Zoho Books link."""
        org_id = getattr(settings, "ZOHO_ORG_ID", "60082578964") or "60082578964"
        if invoice_id and ("410" in str(invoice_id) or str(invoice_id).isdigit()):
            zoho_url = f"https://books.zoho.in/app/{org_id}#/invoices/{invoice_id}"
        else:
            zoho_url = f"https://books.zoho.in/app/{org_id}#/invoices?filter_by=Status.Draft"

        inv_display = invoice_id if invoice_id else "DRAFT-INV-ZOHO"

        return (
            f"🎉 Draft Invoice is Ready!\n\n"
            f"📄 Zoho Draft Invoice: {inv_display}\n"
            f"📋 PO Number: {po_number}\n"
            f"🏢 Customer: {customer_name}\n"
            f"🔒 Locked Selling Rate: ₹{selling_rate:.2f}/kg\n"
            f"🛡️ Status: DRAFT IN ZOHO BOOKS\n\n"
            f"🔗 Direct Zoho Books Link:\n"
            f"{zoho_url}\n\n"
            f"🌐 Web Dashboard Link:\n"
            f"http://localhost:3000/invoices"
        )


twilio_service = TwilioService()
