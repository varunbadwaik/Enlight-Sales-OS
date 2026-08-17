"""OCR Pipeline Service utilizing Google Gemini Multimodal API."""

import logging
from typing import Dict, Any, Optional

from app.integrations.gemini.client import gemini_client
from app.integrations.gemini.prompts import (
    BASE_SYSTEM_PROMPT,
    CUSTOMER_PO_PROMPT,
    PURCHASE_BILL_PROMPT,
    LORRY_RECEIPT_PROMPT,
    WEIGHMENT_SLIP_PROMPT,
    WHATSAPP_DISPATCH_PROMPT
)

logger = logging.getLogger(__name__)

class OCRPipeline:
    def process_document(
        self,
        document_bytes: bytes,
        mime_type: str,
        document_type: str
    ) -> Dict[str, Any]:
        """Extracts structured data from a document using Gemini Multimodal OCR."""
        doc_type = document_type.lower()

        if doc_type == "purchase_bill":
            user_prompt = PURCHASE_BILL_PROMPT
        elif doc_type == "customer_po":
            user_prompt = CUSTOMER_PO_PROMPT
        elif doc_type == "weighment_slip":
            user_prompt = WEIGHMENT_SLIP_PROMPT
        elif doc_type == "lr":
            user_prompt = LORRY_RECEIPT_PROMPT
        else:
            user_prompt = "Extract all key invoice and shipping details as JSON."

        extracted = gemini_client.extract_from_document(
            document_bytes=document_bytes,
            mime_type=mime_type,
            system_prompt=BASE_SYSTEM_PROMPT,
            user_prompt=user_prompt
        )

        return extracted or {}

    def process_whatsapp_text(self, text_message: str) -> Dict[str, Any]:
        """Extracts structured dispatch info from WhatsApp text message."""
        return gemini_client.extract_from_text(
            text_content=text_message,
            system_prompt=BASE_SYSTEM_PROMPT,
            user_prompt=WHATSAPP_DISPATCH_PROMPT
        ) or {}

ocr_pipeline = OCRPipeline()
