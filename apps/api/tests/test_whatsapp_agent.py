"""Unit and E2E Tests for WhatsApp AI Agent & Web Sync Integration."""

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_whatsapp_agent_session_initialization():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Step 1: Send incoming text message with PO Number
        response = await ac.post(
            "/api/v1/whatsapp/agent/webhook",
            data={
                "From": "whatsapp:+919876543210",
                "Body": "Hello, dispatch documents for PO-98765",
                "NumMedia": "0"
            }
        )
        assert response.status_code == 200
        assert "xml" in response.headers.get("content-type", "")
        assert "Enlight Sales OS" in response.text
        assert "PO-98765" in response.text


@pytest.mark.asyncio
async def test_whatsapp_document_upload_and_completion():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        phone = "whatsapp:+919888877777"
        
        # 1. Customer PO
        res1 = await ac.post(
            "/api/v1/whatsapp/agent/webhook",
            data={
                "From": phone,
                "Body": "PO document attached PO-98765",
                "NumMedia": "1",
                "MediaUrl0": "https://example.com/po.pdf",
                "MediaContentType0": "application/pdf",
                "Filename0": "customer_po.pdf"
            }
        )
        assert res1.status_code == 200

        # 2. Purchase Bill
        res2 = await ac.post(
            "/api/v1/whatsapp/agent/webhook",
            data={
                "From": phone,
                "Body": "Vendor bill attached",
                "NumMedia": "1",
                "MediaUrl0": "https://example.com/bill.pdf",
                "MediaContentType0": "application/pdf",
                "Filename0": "purchase_bill.pdf"
            }
        )
        assert res2.status_code == 200

        # 3. Lorry Receipt
        res3 = await ac.post(
            "/api/v1/whatsapp/agent/webhook",
            data={
                "From": phone,
                "Body": "LR document",
                "NumMedia": "1",
                "MediaUrl0": "https://example.com/lr.jpg",
                "MediaContentType0": "image/jpeg",
                "Filename0": "lorry_receipt.jpg"
            }
        )
        assert res3.status_code == 200

        # 4. Weight Slip -> Triggers completion
        res4 = await ac.post(
            "/api/v1/whatsapp/agent/webhook",
            data={
                "From": phone,
                "Body": "Weighment slip final",
                "NumMedia": "1",
                "MediaUrl0": "https://example.com/weight.jpg",
                "MediaContentType0": "image/jpeg",
                "Filename0": "weight_slip.jpg"
            }
        )
        assert res4.status_code == 200
        assert "Draft Invoice is Ready" in res4.text or "Zoho Draft Invoice" in res4.text or "Dispatch Processed" in res4.text


@pytest.mark.asyncio
async def test_whatsapp_sessions_list_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/v1/whatsapp/sessions")
        assert res.status_code == 200
        data = res.json()
        assert isinstance(data, list)


@pytest.mark.asyncio
async def test_draft_invoices_list_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/v1/invoices/drafts")
        assert res.status_code == 200
        data = res.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert "source" in data[0]
