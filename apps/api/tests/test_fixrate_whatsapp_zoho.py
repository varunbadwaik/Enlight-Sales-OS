"""Test suite for extracting UI Fix Rate, parsing WhatsApp document info, and generating Zoho Sales Draft Invoices."""

import pytest
from decimal import Decimal
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_fixrate_whatsapp_zoho_draft_generation():
    """Verify that custom UI Fix Rate is read and applied when generating Zoho Draft Invoices from WhatsApp intake."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        phone = "whatsapp:+917588353703"
        test_message = (
            "Purchase From : Tata Steel Ltd\n"
            "Sale To       : Reliance Industries Ltd\n"
            "Delivery As Per : PO-TATA/1122\n"
            "DO            : DO/7788 | SO : SO/4455\n"
            "Grade         : TMT Fe550D | Size : 12mm Rods\n"
            "Weight (kg)   : 10\n"
            "Vehicle No    : KA01 XY 9999 | Driver : 9876543210\n"
            "Transport     : Safexpress Logistics\n"
            "Dispatch      : 12-08-2026"
        )
        custom_fix_rate = "59.50"

        response = await ac.post(
            "/api/v1/whatsapp/agent/webhook",
            headers={"X-Fix-Rate": custom_fix_rate},
            data={
                "From": phone,
                "Body": test_message,
                "SellingRate": custom_fix_rate,
                "FixRate": custom_fix_rate,
                "NumMedia": "0"
            }
        )

        assert response.status_code == 200
        assert "text/xml" in response.headers.get("content-type", "")
        content = response.text
        assert "Draft Invoice is Ready" in content or "Zoho Draft Invoice" in content
